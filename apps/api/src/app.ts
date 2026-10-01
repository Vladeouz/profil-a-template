import { OpenAPIHono } from '@hono/zod-openapi';
import { requestId } from 'hono/request-id';
import type { Logger } from 'pino';
import { authenticate, registerBearerAuth } from './core/auth/authenticate.js';
import type { TokenVerifier } from './core/auth/firebase-admin.js';
import type { AppEnv } from './core/http/context.js';
import { cors } from './core/http/cors.js';
import { createErrorHandler, notFoundHandler, validationHook } from './core/http/errors.js';
import { requestLogger } from './core/logger.js';
import type { Database } from './db/client.js';
import { registerHealthRoutes } from './features/system/http/health.route.js';
import { registerUserRoutes } from './features/users/http/me.route.js';
import { createDrizzleUserRepository } from './features/users/infrastructure/drizzle-user-repository.js';
import { syncUser } from './features/users/usecases/sync-user.js';

export type AppDeps = {
  logger: Logger;
  corsOrigins: readonly string[];
  db: Database;
  tokenVerifier: TokenVerifier;
};

export function createApp({
  logger,
  corsOrigins,
  db,
  tokenVerifier,
}: AppDeps): OpenAPIHono<AppEnv> {
  const app = new OpenAPIHono<AppEnv>({ defaultHook: validationHook });

  app.use('*', requestId());
  app.use('*', requestLogger(logger));
  app.use('*', cors(corsOrigins));
  app.onError(createErrorHandler(logger));
  app.notFound(notFoundHandler);

  registerHealthRoutes(app);

  // Semua route `/v1/*` wajib login (NFR-03). Route publik didaftarkan di atas, di luar `/v1`.
  const users = createDrizzleUserRepository(db);
  app.use('/v1/*', authenticate({ verifier: tokenVerifier, resolveUser: syncUser({ users }) }));
  registerBearerAuth(app);
  registerUserRoutes(app);

  return app;
}

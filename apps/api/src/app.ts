import { OpenAPIHono } from '@hono/zod-openapi';
import { requestId } from 'hono/request-id';
import type { Logger } from 'pino';
import type { AppEnv } from './core/http/context.js';
import { cors } from './core/http/cors.js';
import { createErrorHandler, notFoundHandler, validationHook } from './core/http/errors.js';
import { requestLogger } from './core/logger.js';
import { registerHealthRoutes } from './features/system/http/health.route.js';

export type AppDeps = {
  logger: Logger;
  corsOrigins: readonly string[];
};

export function createApp({ logger, corsOrigins }: AppDeps): OpenAPIHono<AppEnv> {
  const app = new OpenAPIHono<AppEnv>({ defaultHook: validationHook });

  app.use('*', requestId());
  app.use('*', requestLogger(logger));
  app.use('*', cors(corsOrigins));
  app.onError(createErrorHandler(logger));
  app.notFound(notFoundHandler);

  registerHealthRoutes(app);

  return app;
}

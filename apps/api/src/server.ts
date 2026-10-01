import { serve } from '@hono/node-server';
import { createApp } from './app.js';
import { createFirebaseAdmin, createFirebaseTokenVerifier } from './core/auth/firebase-admin.js';
import { type Env, EnvError, loadEnv } from './core/config/env.js';
import { createLogger } from './core/logger.js';
import { createDb } from './db/client.js';

function readEnv(): Env {
  try {
    return loadEnv();
  } catch (err) {
    // Logger belum ada karena LOG_LEVEL ikut divalidasi; pesan ditulis langsung ke stderr.
    if (err instanceof EnvError) {
      process.stderr.write(`${err.message}\n`);
      process.exit(1);
    }
    throw err;
  }
}

const env = readEnv();
const logger = createLogger({ level: env.LOG_LEVEL });
const database = createDb(env.DATABASE_URL);
const firebase = createFirebaseAdmin(env.FIREBASE_PROJECT_ID);
const app = createApp({
  logger,
  corsOrigins: env.CORS_ORIGINS,
  db: database.db,
  tokenVerifier: createFirebaseTokenVerifier(firebase.auth),
});

const server = serve({ fetch: app.fetch, port: env.PORT }, (info) => {
  logger.info(
    {
      port: info.port,
      nodeEnv: env.NODE_ENV,
      authEmulator: env.FIREBASE_AUTH_EMULATOR_HOST ?? null,
    },
    'API listening',
  );
});

function shutdown(signal: NodeJS.Signals): void {
  logger.info({ signal }, 'shutting down');
  server.close(async (err) => {
    if (err) logger.error({ err }, 'failed to close server');
    await Promise.allSettled([database.close(), firebase.close()]);
    process.exit(err ? 1 : 0);
  });
}

process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);

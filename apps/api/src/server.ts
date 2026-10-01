import { serve } from '@hono/node-server';
import { createApp } from './app.js';
import { type Env, EnvError, loadEnv } from './core/config/env.js';
import { createLogger } from './core/logger.js';

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
const app = createApp({ logger, corsOrigins: env.CORS_ORIGINS });

const server = serve({ fetch: app.fetch, port: env.PORT }, (info) => {
  logger.info({ port: info.port, nodeEnv: env.NODE_ENV }, 'API listening');
});

function shutdown(signal: NodeJS.Signals): void {
  logger.info({ signal }, 'shutting down');
  server.close((err) => {
    if (err) {
      logger.error({ err }, 'failed to close server');
      process.exit(1);
    }
    process.exit(0);
  });
}

process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);

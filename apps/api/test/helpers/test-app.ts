import { type AppDeps, createApp } from '../../src/app.js';
import { createLogger } from '../../src/core/logger.js';

export const TEST_ORIGIN = 'http://localhost:8081';

// App lengkap (middleware, error handler, route) dengan logger senyap dan satu origin CORS.
export function createTestApp(overrides: Partial<AppDeps> = {}) {
  return createApp({
    logger: createLogger({ level: 'silent' }),
    corsOrigins: [TEST_ORIGIN],
    ...overrides,
  });
}

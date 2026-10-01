import { type AppDeps, createApp } from '../../src/app.js';
import type { TokenVerifier } from '../../src/core/auth/firebase-admin.js';
import { createLogger } from '../../src/core/logger.js';
import { createDb } from '../../src/db/client.js';

export const TEST_ORIGIN = 'http://localhost:8081';

// Menolak semua token. Integration test yang butuh login memberi `tokenVerifier` dari
// `createEmulatorTokenVerifier()` (test/helpers/emulator-token.ts) dan `db` dari `useTestDb()`.
export const rejectAllTokens: TokenVerifier = { verify: async () => null };

// App lengkap (middleware, error handler, route) dengan logger senyap dan satu origin CORS.
// `db` bawaan tidak membuka koneksi sampai ada query, jadi aman untuk unit test.
export function createTestApp(overrides: Partial<AppDeps> = {}) {
  return createApp({
    logger: createLogger({ level: 'silent' }),
    corsOrigins: [TEST_ORIGIN],
    db: overrides.db ?? createDb(process.env.DATABASE_URL ?? '', { max: 1 }).db,
    tokenVerifier: rejectAllTokens,
    ...overrides,
  });
}

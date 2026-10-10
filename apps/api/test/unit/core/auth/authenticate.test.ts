import { describe, expect, it, vi } from 'vitest';
import { authenticate } from '../../../../src/core/auth/authenticate.js';
import type {
  TokenVerifier,
  VerifiedIdentity,
  VerifyResult,
} from '../../../../src/core/auth/firebase-admin.js';
import type { ErrorBody } from '../../../../src/core/http/errors.js';
import type { User } from '../../../../src/features/users/domain/user.js';
import { captureLogger } from '../../../helpers/capture-logger.js';
import { createTestApp } from '../../../helpers/test-app.js';

const identity: VerifiedIdentity = {
  firebaseUid: 'uid-1',
  email: 'a@example.com',
  displayName: null,
};

const user: User = {
  id: '6f1c2f0e-8a3b-4c5d-9e7f-0a1b2c3d4e5f',
  firebaseUid: 'uid-1',
  email: 'a@example.com',
  displayName: null,
  lastSeenAt: new Date('2026-10-01T00:00:00Z'),
  createdAt: new Date('2026-10-01T00:00:00Z'),
};

const accepted: VerifyResult = { ok: true, identity };

// App dengan satu route terlindungi yang mengembalikan `c.var.user`.
function setup(verify: TokenVerifier['verify']) {
  const verifier = { verify: vi.fn(verify) };
  const resolveUser = vi.fn(async () => user);
  const log = captureLogger();
  const app = createTestApp({ logger: log.logger });
  app.use('/protected/*', authenticate({ verifier, resolveUser }));
  app.get('/protected/whoami', (c) => c.json({ id: c.var.user.id }));
  const request = (headers: Record<string, string> = {}) =>
    app.request('/protected/whoami', { headers });
  return { verifier, resolveUser, request, log };
}

describe('authenticate', () => {
  it('401 without an Authorization header, without verifying or resolving', async () => {
    const { verifier, resolveUser, request } = setup(async () => accepted);

    const res = await request();

    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({
      error: { code: 'UNAUTHENTICATED', message: 'Missing bearer token' },
    });
    expect(verifier.verify).not.toHaveBeenCalled();
    expect(resolveUser).not.toHaveBeenCalled();
  });

  it.each(['Basic abc', 'Bearer', 'Bearer ', 'Bearer a b', 'abc'])(
    '401 for a malformed header: %s',
    async (header) => {
      const { verifier, request } = setup(async () => accepted);

      const res = await request({ Authorization: header });

      expect(res.status).toBe(401);
      expect(verifier.verify).not.toHaveBeenCalled();
    },
  );

  it('401 when the verifier rejects the token, without resolving a user', async () => {
    const { resolveUser, request } = setup(async () => ({
      ok: false,
      reason: 'auth/id-token-expired',
    }));

    const res = await request({ Authorization: 'Bearer bad-token' });

    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({
      error: { code: 'UNAUTHENTICATED', message: 'Invalid or expired token' },
    });
    expect(resolveUser).not.toHaveBeenCalled();
  });

  it('logs the rejection reason at warn level without the token', async () => {
    const token = 'eyJhbGciOiJSUzI1NiJ9.secret-claims.signature';
    const { request, log } = setup(async () => ({ ok: false, reason: 'auth/id-token-expired' }));

    await request({ Authorization: `Bearer ${token}` });

    const rejected = log.lines.filter((line) => line.msg === 'rejected ID token');
    expect(rejected).toEqual([
      expect.objectContaining({ level: 40, reason: 'auth/id-token-expired' }),
    ]);
    expect(log.raw()).not.toContain('secret-claims');
  });

  it('does not log a rejection when the header is missing', async () => {
    const { request, log } = setup(async () => accepted);

    await request();

    expect(log.lines.filter((line) => line.msg === 'rejected ID token')).toEqual([]);
  });

  it('passes the token to the verifier, resolves the user, and sets c.var.user', async () => {
    const { verifier, resolveUser, request } = setup(async () => accepted);

    const res = await request({ Authorization: 'bearer good-token' });

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ id: user.id });
    expect(verifier.verify).toHaveBeenCalledWith('good-token');
    expect(resolveUser).toHaveBeenCalledWith(identity);
  });

  it('500 INTERNAL_ERROR when verification itself fails', async () => {
    const { request } = setup(async () => {
      throw new Error('certificates unavailable');
    });

    const res = await request({ Authorization: 'Bearer token' });

    expect(res.status).toBe(500);
    expect(((await res.json()) as ErrorBody).error).toEqual({
      code: 'INTERNAL_ERROR',
      message: 'Internal server error',
    });
  });
});

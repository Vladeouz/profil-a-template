import { randomUUID } from 'node:crypto';
import { type App, deleteApp, initializeApp } from 'firebase-admin/app';
import { type Auth, FirebaseAuthError, getAuth } from 'firebase-admin/auth';

// Identitas dari ID token yang sudah diverifikasi.
export interface VerifiedIdentity {
  firebaseUid: string;
  email: string | null;
  displayName: string | null;
}

// Hasil verifikasi. `reason` adalah kode error firebase-admin (`auth/id-token-expired`,
// `auth/argument-error`, ...) untuk log; tidak pernah berisi token atau isinya.
export type VerifyResult = { ok: true; identity: VerifiedIdentity } | { ok: false; reason: string };

// Port verifikasi token; middleware `authenticate` hanya bergantung pada interface ini.
export interface TokenVerifier {
  // `ok: false` bila token tidak valid, kedaluwarsa, atau bukan untuk project ini.
  // Error lain (misalnya sertifikat Google tidak bisa diambil) dilempar ulang.
  verify(idToken: string): Promise<VerifyResult>;
}

export interface FirebaseAdmin {
  app: App;
  auth: Auth;
  close(): Promise<void>;
}

// Hanya `projectId` yang dibutuhkan untuk `verifyIdToken`: tanpa service account, baik di Auth
// Emulator (`FIREBASE_AUTH_EMULATOR_HOST`, dibaca firebase-admin dari process.env) maupun produksi.
// Nama app unik agar beberapa instance (misalnya di test) tidak bentrok dengan app default.
export function createFirebaseAdmin(projectId: string): FirebaseAdmin {
  const app = initializeApp({ projectId }, `api-${randomUUID()}`);
  return { app, auth: getAuth(app), close: () => deleteApp(app) };
}

// `auth/internal-error` berarti verifikasi tidak bisa dijalankan, bukan token yang salah.
const UNVERIFIABLE = 'auth/internal-error';

export function createFirebaseTokenVerifier(auth: Pick<Auth, 'verifyIdToken'>): TokenVerifier {
  return {
    async verify(idToken) {
      try {
        const decoded = await auth.verifyIdToken(idToken);
        return {
          ok: true,
          identity: {
            firebaseUid: decoded.uid,
            email: decoded.email ?? null,
            displayName: typeof decoded.name === 'string' ? decoded.name : null,
          },
        };
      } catch (err) {
        // Hanya `code`: `message` firebase-admin bisa memuat isi token (klaim `aud`, `iss`, `sub`).
        if (err instanceof FirebaseAuthError && err.code !== UNVERIFIABLE) {
          return { ok: false, reason: err.code };
        }
        throw err;
      }
    },
  };
}

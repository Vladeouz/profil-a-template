import { z } from 'zod';

// Daftar origin dipisah koma, misalnya `http://localhost:8081,https://app.example.com`.
const OriginList = z
  .string()
  .transform((value) =>
    value
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
  )
  .pipe(z.array(z.url({ protocol: /^https?$/ }).transform((url) => new URL(url).origin)).min(1));

// URL koneksi PostgreSQL, misalnya `postgres://template:template@localhost:5432/template`.
const DatabaseUrl = z.url({ protocol: /^postgres(ql)?$/ });

// `host:port` emulator Firebase, misalnya `localhost:9099`. firebase-admin membacanya langsung dari
// `process.env`; divalidasi di sini agar salah ketik terlihat saat start.
const EmulatorHost = z.string().regex(/^[^:/\s]+:\d+$/, 'Expected host:port, e.g. localhost:9099');

const EnvObject = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
  CORS_ORIGINS: OriginList,
  DATABASE_URL: DatabaseUrl,
  FIREBASE_PROJECT_ID: z.string().min(1),
  FIREBASE_AUTH_EMULATOR_HOST: EmulatorHost.optional(),
  // D-05: pg-boss hanya berjalan bila `true`; tidak di-set berarti `false`.
  RUN_WORKER: z
    .enum(['true', 'false'])
    .default('false')
    .transform((value) => value === 'true'),
  // D-06: adapter port push dan storage (`src/core/ports/create-ports.ts`).
  PUSH_ADAPTER: z.enum(['fake', 'fcm']).default('fake'),
  STORAGE_ADAPTER: z.enum(['fake', 'firebase']).default('fake'),
  // Nama bucket, misalnya `demo-template.appspot.com`. Wajib bila STORAGE_ADAPTER=firebase.
  FIREBASE_STORAGE_BUCKET: z.string().min(1).optional(),
  FIREBASE_STORAGE_EMULATOR_HOST: EmulatorHost.optional(),
});

const EMULATOR_HOSTS = ['FIREBASE_AUTH_EMULATOR_HOST', 'FIREBASE_STORAGE_EMULATOR_HOST'] as const;

const EnvSchema = EnvObject.superRefine((env, ctx) => {
  // Dengan emulator, firebase-admin menerima token tanpa tanda tangan dan menulis file ke emulator;
  // jangan pernah di produksi.
  if (env.NODE_ENV === 'production') {
    for (const key of EMULATOR_HOSTS) {
      if (env[key]) {
        ctx.addIssue({
          code: 'custom',
          path: [key],
          message: 'Must not be set when NODE_ENV=production',
        });
      }
    }
  }
  if (env.STORAGE_ADAPTER === 'firebase' && !env.FIREBASE_STORAGE_BUCKET) {
    ctx.addIssue({
      code: 'custom',
      path: ['FIREBASE_STORAGE_BUCKET'],
      message: 'Required when STORAGE_ADAPTER=firebase',
    });
  }
});

export type Env = z.infer<typeof EnvSchema>;

export class EnvError extends Error {
  constructor(error: z.ZodError) {
    super(`Invalid environment variables:\n${z.prettifyError(error)}`);
    this.name = 'EnvError';
  }
}

function parse<T extends z.ZodType>(schema: T, source: NodeJS.ProcessEnv): z.infer<T> {
  const result = schema.safeParse(source);
  if (!result.success) {
    throw new EnvError(result.error);
  }
  return result.data;
}

export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  return parse(EnvSchema, source);
}

// Untuk perintah yang hanya butuh database (`db:migrate`), tanpa env server lainnya.
export function loadDatabaseUrl(source: NodeJS.ProcessEnv = process.env): string {
  return parse(EnvObject.pick({ DATABASE_URL: true }), source).DATABASE_URL;
}

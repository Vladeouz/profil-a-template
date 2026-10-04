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

// `host:port` Auth Emulator, misalnya `localhost:9099`. firebase-admin membacanya langsung dari
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
});

// Dengan emulator, firebase-admin menerima token tanpa tanda tangan; jangan pernah di produksi.
const EnvSchema = EnvObject.refine(
  (env) => !(env.NODE_ENV === 'production' && env.FIREBASE_AUTH_EMULATOR_HOST),
  { path: ['FIREBASE_AUTH_EMULATOR_HOST'], message: 'Must not be set when NODE_ENV=production' },
);

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

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

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
  CORS_ORIGINS: OriginList,
  DATABASE_URL: DatabaseUrl,
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
  return parse(EnvSchema.pick({ DATABASE_URL: true }), source).DATABASE_URL;
}

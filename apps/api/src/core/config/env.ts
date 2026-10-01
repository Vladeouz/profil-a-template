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

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
  CORS_ORIGINS: OriginList,
});

export type Env = z.infer<typeof EnvSchema>;

export class EnvError extends Error {
  constructor(error: z.ZodError) {
    super(`Invalid environment variables:\n${z.prettifyError(error)}`);
    this.name = 'EnvError';
  }
}

export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const result = EnvSchema.safeParse(source);
  if (!result.success) {
    throw new EnvError(result.error);
  }
  return result.data;
}

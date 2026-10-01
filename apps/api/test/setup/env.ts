// Nilai env default untuk test. Nilai yang sudah di-set di shell tidak ditimpa.
const defaults: Record<string, string> = {
  NODE_ENV: 'test',
  LOG_LEVEL: 'silent',
  CORS_ORIGINS: 'http://localhost:8081',
  // Database utama lokal (docker compose). Integration test memakai `<nama>_test` (test/setup/db.ts).
  DATABASE_URL: 'postgres://template:template@localhost:5432/template',
};

for (const [key, value] of Object.entries(defaults)) {
  process.env[key] ??= value;
}

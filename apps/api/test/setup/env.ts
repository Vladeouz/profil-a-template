// Nilai env default untuk test. Nilai yang sudah di-set di shell tidak ditimpa.
const defaults: Record<string, string> = {
  NODE_ENV: 'test',
  LOG_LEVEL: 'silent',
  CORS_ORIGINS: 'http://localhost:8081',
};

for (const [key, value] of Object.entries(defaults)) {
  process.env[key] ??= value;
}

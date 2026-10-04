// Satu perintah verifikasi (FR-03): menjalankan semua langkah berurutan, lalu menampilkan ringkasan.
//
//   node scripts/check.mjs   (pnpm check)
//
// Langkah yang gagal tidak menghentikan langkah berikutnya; semua hasil dilaporkan di ringkasan dan
// exit code bukan 0 bila ada satu saja yang gagal. Integration test butuh `docker compose up -d --wait`.
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const APP_DIR = join(ROOT, 'apps', 'app');

// Dipanggil hanya bila integration test gagal, agar ringkasan menyebut Docker bila penyebabnya itu.
function dockerHint() {
  const engine = spawnSync('docker version --format "{{.Server.Version}}"', {
    shell: true,
    stdio: 'ignore',
    timeout: 20_000,
    windowsHide: true,
  });
  return engine.status === 0
    ? ''
    : 'Docker tidak merespons: jalankan Docker Desktop, lalu `docker compose up -d --wait`';
}

const STEPS = [
  { name: 'Biome', command: 'pnpm lint', cwd: ROOT },
  { name: 'Typecheck API', command: 'pnpm --filter api typecheck', cwd: ROOT },
  { name: 'Unit test API', command: 'pnpm --filter api test', cwd: ROOT },
  {
    name: 'Integration test API',
    command: 'pnpm --filter api test:int',
    cwd: ROOT,
    hint: dockerHint,
  },
  { name: 'contract:check', command: 'pnpm contract:check', cwd: ROOT },
  { name: 'flutter analyze', command: 'flutter analyze', cwd: APP_DIR },
  { name: 'flutter test', command: 'flutter test', cwd: APP_DIR },
];

function formatDuration(ms) {
  const seconds = Math.round(ms / 1000);
  return seconds < 60 ? `${seconds} dtk` : `${Math.floor(seconds / 60)} mnt ${seconds % 60} dtk`;
}

function runStep(step, index) {
  console.log(`\n=== [${index + 1}/${STEPS.length}] ${step.name}: ${step.command}\n`);
  const startedAt = performance.now();
  const result = spawnSync(step.command, { cwd: step.cwd, shell: true, stdio: 'inherit' });
  const ok = result.status === 0 && !result.error;
  return {
    ...step,
    ok,
    durationMs: performance.now() - startedAt,
    detail: ok
      ? ''
      : [`exit ${result.status ?? result.error?.message ?? 'tanpa kode'}`, step.hint?.()]
          .filter(Boolean)
          .join('; '),
  };
}

const startedAt = performance.now();
const results = STEPS.map(runStep);
const totalMs = performance.now() - startedAt;

const rows = results.map((result) => [
  result.name,
  result.ok ? 'OK' : 'GAGAL',
  formatDuration(result.durationMs),
  result.detail,
]);
const headers = ['Langkah', 'Status', 'Waktu', 'Keterangan'];
const widths = headers.map((header, i) =>
  Math.max(header.length, ...rows.map((cells) => cells[i].length)),
);
const formatRow = (cells) =>
  cells
    .map((cell, i) => cell.padEnd(widths[i]))
    .join('  ')
    .trimEnd();

console.log('\npnpm check: ringkasan\n');
console.log(formatRow(headers));
console.log(widths.map((width) => '-'.repeat(width)).join('  '));
for (const cells of rows) console.log(formatRow(cells));

const failed = results.filter((result) => !result.ok);
console.log(`\nTotal waktu: ${formatDuration(totalMs)}`);
if (failed.length > 0) {
  console.log(
    `${failed.length} dari ${results.length} langkah gagal. Lihat output langkah di atas.`,
  );
  process.exitCode = 1;
} else {
  console.log(`Semua ${results.length} langkah OK.`);
}

// Menulis openapi.json dan contoh respons nyata (sukses dan error) untuk test Dart.
import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { app, openApiDocument } from '../src/app.js';

const spikeRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const fixturesDir = join(spikeRoot, 'dart', 'test', 'fixtures');

function writeJson(path: string, value: unknown) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
  console.log(`ditulis: ${path}`);
}

async function post(body: unknown) {
  const res = await app.request('/v1/notes', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  return { status: res.status, body: await res.json() };
}

writeJson(join(spikeRoot, 'openapi.json'), openApiDocument());

const created = await post({ title: 'Belanja', body: 'Susu dan roti' });
if (created.status !== 201) throw new Error(`sukses diharapkan 201, dapat ${created.status}`);
writeJson(join(fixturesDir, 'create_note_201.json'), created.body);

const invalid = await post({ body: 'x'.repeat(5001) });
if (invalid.status !== 422) throw new Error(`error diharapkan 422, dapat ${invalid.status}`);
writeJson(join(fixturesDir, 'create_note_422.json'), invalid.body);

// JSON.stringify memecah array pendek per baris, Biome tidak. Format ulang dengan Biome
// dari root agar `pnpm biome check .` tetap bersih dan hasil export stabil.
const repoRoot = join(spikeRoot, '..', '..');
const biome = spawnSync(
  'pnpm biome format --write spikes/contract/openapi.json spikes/contract/dart/test/fixtures',
  {
    cwd: repoRoot,
    shell: true,
    stdio: 'inherit',
  },
);
if (biome.status !== 0) throw new Error('biome format gagal');

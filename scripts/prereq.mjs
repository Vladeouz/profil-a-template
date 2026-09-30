#!/usr/bin/env node
// Memeriksa prasyarat lingkungan (PRD bagian 3) dan menampilkan tabel status.
// Script ini hanya membaca; tidak pernah membuat atau mengubah file apa pun.

import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const isWindows = process.platform === 'win32';

const OK = 'OK';
const FAIL = 'GAGAL';
const WARN = 'PERINGATAN';

/** Menjalankan perintah lewat shell agar `.cmd`/`.bat` (pnpm, flutter) ikut ditemukan di Windows. */
function run(command, timeoutMs = 30_000) {
  const result = spawnSync(command, {
    shell: true,
    encoding: 'utf8',
    timeout: timeoutMs,
    windowsHide: true,
  });
  const output = `${result.stdout ?? ''}${result.stderr ?? ''}`.trim();
  return {
    ok: result.status === 0 && !result.error,
    output,
    timedOut: result.error?.code === 'ETIMEDOUT',
  };
}

function firstLine(text) {
  return text.split(/\r?\n/).find((line) => line.trim() !== '') ?? '';
}

function readPackageJson() {
  return JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
}

function checkNode() {
  const expected = readFileSync(join(root, '.nvmrc'), 'utf8').trim();
  const major = process.versions.node.split('.')[0];
  if (major === expected) {
    return { status: OK, detail: `v${process.versions.node}` };
  }
  return {
    status: FAIL,
    detail: `v${process.versions.node}, dibutuhkan ${expected}.x`,
    fix: `Pasang Node.js ${expected} LTS (misalnya \`nvm install ${expected}\` lalu \`nvm use ${expected}\`).`,
  };
}

function checkPnpm() {
  const expected = readPackageJson()
    .packageManager.replace(/^pnpm@/, '')
    .split('+')[0];
  const fix = `Jalankan \`corepack enable\` lalu \`corepack prepare pnpm@${expected} --activate\`.`;
  const result = run('pnpm --version');
  if (!result.ok) {
    return { status: FAIL, detail: 'pnpm tidak ditemukan', fix };
  }
  const actual = firstLine(result.output);
  if (actual !== expected) {
    return { status: FAIL, detail: `${actual}, dibutuhkan ${expected}`, fix };
  }
  return { status: OK, detail: actual };
}

function checkGit() {
  const result = run('git --version');
  if (!result.ok) {
    return {
      status: FAIL,
      detail: 'git tidak ditemukan',
      fix: 'Pasang Git dari https://git-scm.com.',
    };
  }
  return { status: OK, detail: firstLine(result.output).replace(/^git version /, '') };
}

function checkDocker() {
  const cli = run('docker --version');
  if (!cli.ok) {
    return {
      status: FAIL,
      detail: 'docker tidak ditemukan',
      fix: 'Pasang Docker Desktop dari https://www.docker.com/products/docker-desktop.',
    };
  }
  const engine = run('docker version --format "{{.Server.Version}}"', 20_000);
  if (!engine.ok) {
    return {
      status: FAIL,
      detail: engine.timedOut ? 'engine tidak merespons (timeout)' : 'engine tidak berjalan',
      fix: 'Jalankan Docker Desktop dan tunggu sampai statusnya "Engine running", lalu ulangi `pnpm prereq`.',
    };
  }
  return { status: OK, detail: `engine ${firstLine(engine.output)}` };
}

function checkFlutter() {
  const install = 'Pasang Flutter channel stable: https://docs.flutter.dev/get-started/install.';
  const flutter = run('flutter --version --machine', 120_000);
  if (!flutter.ok) {
    return { status: FAIL, detail: 'flutter tidak ditemukan atau gagal dijalankan', fix: install };
  }
  let info;
  try {
    info = JSON.parse(flutter.output.slice(flutter.output.indexOf('{')));
  } catch {
    return { status: FAIL, detail: 'output `flutter --version` tidak dikenali', fix: install };
  }
  if (info.channel !== 'stable') {
    return {
      status: FAIL,
      detail: `${info.frameworkVersion} (channel ${info.channel})`,
      fix: 'Pindah ke channel stable: `flutter channel stable` lalu `flutter upgrade`.',
    };
  }

  const dart = run('dart --version');
  if (!dart.ok) {
    const smartAppControl = isWindows
      ? ' Di Windows, kemungkinan besar `dart.exe` diblokir Smart App Control ' +
        '(Windows Security > App & browser control > Smart App Control). Matikan fitur itu atau izinkan dart.exe.'
      : '';
    return {
      status: FAIL,
      detail: `flutter ${info.frameworkVersion}, tetapi \`dart\` gagal dijalankan`,
      fix: `Pastikan \`dart --version\` berjalan.${smartAppControl}`,
    };
  }
  return { status: OK, detail: `${info.frameworkVersion} stable, Dart ${info.dartSdkVersion}` };
}

function androidSdkCandidates() {
  const fromEnv = [process.env.ANDROID_HOME, process.env.ANDROID_SDK_ROOT].filter(Boolean);
  const defaults = isWindows
    ? [process.env.LOCALAPPDATA && join(process.env.LOCALAPPDATA, 'Android', 'Sdk')]
    : process.platform === 'darwin'
      ? [join(homedir(), 'Library', 'Android', 'sdk')]
      : [join(homedir(), 'Android', 'Sdk')];
  return [...fromEnv, ...defaults.filter(Boolean)];
}

function checkAndroid() {
  const sdk = androidSdkCandidates().find((path) => existsSync(path));
  if (!sdk) {
    return {
      status: WARN,
      detail: 'Android SDK tidak ditemukan (opsional)',
      fix: 'Hanya untuk verifikasi Android: pasang Android Studio beserta SDK dan emulator.',
    };
  }
  const emulator = join(sdk, 'emulator', isWindows ? 'emulator.exe' : 'emulator');
  if (!existsSync(emulator)) {
    return {
      status: WARN,
      detail: `SDK di ${sdk}, emulator tidak ada (opsional)`,
      fix: 'Pasang "Android Emulator" lewat SDK Manager di Android Studio.',
    };
  }
  return { status: OK, detail: sdk };
}

function checkEnvFile() {
  if (existsSync(join(root, '.env'))) {
    return { status: OK, detail: 'ada' };
  }
  const copy = isWindows
    ? '`copy .env.example .env` (CMD/PowerShell) atau `cp .env.example .env` (Git Bash)'
    : '`cp .env.example .env`';
  const note = existsSync(join(root, '.env.example'))
    ? ''
    : ' (`.env.example` belum tersedia di repo ini)';
  return {
    status: FAIL,
    detail: 'tidak ada',
    fix: `Buat sendiri dengan ${copy}, lalu sesuaikan isinya${note}.`,
  };
}

const checks = [
  { name: 'Node.js', required: true, run: checkNode },
  { name: 'pnpm', required: true, run: checkPnpm },
  { name: 'Git', required: true, run: checkGit },
  { name: 'Docker', required: true, run: checkDocker },
  { name: 'Flutter', required: true, run: checkFlutter },
  { name: 'Android SDK', required: false, run: checkAndroid },
  { name: 'File .env', required: true, run: checkEnvFile },
];

const rows = checks.map((check) => {
  const result = check.run();
  // Prasyarat opsional tidak pernah menggagalkan prereq.
  const status = !check.required && result.status === FAIL ? WARN : result.status;
  return { ...check, ...result, status };
});

const headers = ['Prasyarat', 'Wajib', 'Status', 'Detail'];
const table = rows.map((row) => [row.name, row.required ? 'ya' : 'tidak', row.status, row.detail]);
const widths = headers.map((header, i) =>
  Math.max(header.length, ...table.map((cells) => cells[i].length)),
);
const formatRow = (cells) =>
  cells
    .map((cell, i) => cell.padEnd(widths[i]))
    .join('  ')
    .trimEnd();

console.log('\npnpm prereq: memeriksa prasyarat lingkungan\n');
console.log(formatRow(headers));
console.log(widths.map((width) => '-'.repeat(width)).join('  '));
for (const cells of table) {
  console.log(formatRow(cells));
}

const fixes = rows.filter((row) => row.status !== OK && row.fix);
if (fixes.length > 0) {
  console.log('\nPerbaikan:');
  for (const row of fixes) {
    console.log(`- [${row.status}] ${row.name}: ${row.fix}`);
  }
}

const failed = rows.filter((row) => row.status === FAIL);
if (failed.length > 0) {
  console.log(`\n${failed.length} prasyarat wajib gagal.`);
  process.exitCode = 1;
} else {
  console.log('\nSemua prasyarat wajib terpenuhi.');
}

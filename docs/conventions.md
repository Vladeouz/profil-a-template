# Konvensi Proyek

Dokumen ini adalah rujukan konvensi untuk manusia dan agent. Sumber aslinya PRD bagian 3 dan 5; setiap bagian nanti merujuk file contoh di repo. Bagian yang belum diisi ditandai dengan task yang akan mengisinya.

## Versi yang dipin

Library dipin ke versi pasti (tanpa `^` atau `~`) saat pertama dipasang, lalu dicatat di sini.

| Komponen | Versi | Dipin di |
| --- | --- | --- |
| Node.js | 24 (`.nvmrc`), `engines.node` `>=24 <25` | T-001 |
| pnpm | 12.6.0 (`packageManager`) | T-001 |
| `@biomejs/biome` | 2.5.14 | T-001 |
| PostgreSQL | 17 (`postgres:17-alpine`) | T-002 |
| Flutter | dicatat di T-004 | T-004 |

## Git

- Branch `<type>/t-xxx-<ringkas>`, type: `feat`, `fix`, `chore`, `docs`, `test`.
- Commit `<type>: <ringkasan> (T-xxx)`.
- Merge ke `master` dilakukan user setelah meninjau hasil.
- `.gitattributes` memaksa LF untuk semua file teks, kecuali `*.bat` dan `*.cmd` (CRLF). `.editorconfig` mengikuti aturan yang sama.

## Script dan perintah root

- Semua script otomatisasi ditulis dalam Node (`.mjs`) di `scripts/`, bukan shell, agar berjalan sama di CMD, PowerShell, Git Bash, dan Linux CI. Contoh: `scripts/prereq.mjs`.
- Script memanggil perintah eksternal lewat `spawnSync(perintah, { shell: true })` agar `pnpm.cmd`, `flutter.bat`, dan sejenisnya ditemukan di Windows.
- Nama script di `package.json` root tidak boleh sama dengan perintah bawaan pnpm (misalnya `doctor`, `init`, `test`, `ci`), karena perintah bawaan selalu menang. Cek dengan `pnpm help <nama>`: bila keluar `unrecognized subcommand`, nama itu aman (PRD D-14).
- Nama file script sama dengan nama script-nya (`pnpm prereq` → `scripts/prereq.mjs`).

## Lint dan format (Biome)

- Satu alat untuk lint dan format TypeScript, JavaScript, dan JSON: Biome, konfigurasi di `biome.json`.
- Aturan lint: preset `recommended`. Format: spasi 2, lebar baris 100, LF, kutip tunggal, titik koma selalu.
- Biome membaca `.gitignore` (`vcs.useIgnoreFile`), jadi file yang di-ignore Git tidak diperiksa.
- `pnpm lint` untuk memeriksa, `pnpm format` untuk memperbaiki otomatis.

## Belum diisi

- API (prefix, penamaan, format JSON): T-005
- Format error: T-005
- Database: T-006
- Pagination: T-008
- Clean Architecture API: T-011
- Kontrak dan client Dart: T-012
- Flutter: T-013 sampai T-016
- Test: T-005, T-006, T-013

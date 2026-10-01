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
| `firebase-tools` (image emulator) | 15.32.0, di atas `node:24-trixie-slim` + OpenJDK 21 | T-002 |
| Flutter | 3.47.5 stable (Dart 3.13.4) | T-004 |

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

## Lingkungan Flutter dan Android

Dicek oleh `pnpm prereq` sebagai prasyarat opsional (peringatan, bukan kegagalan); ditemukan di T-004.

- **Pub cache satu drive dengan repo (Windows).** Bila repo dan pub cache beda drive (misalnya repo di `D:` dan pub cache bawaan di `%LOCALAPPDATA%\Pub\Cache`), build Android gagal saat kompilasi Kotlin plugin: `Could not close incremental caches … this and base files have different roots`. Atasi di mesin, bukan di proyek: `setx PUB_CACHE D:\pub-cache`, buka terminal baru, lalu `flutter pub get` ulang. Jangan menambah `kotlin.incremental=false` ke `apps/app`.
- **NDK dan SDK Platform Android dipasang sebelum build pertama.** Gradle bisa macet bila memasangnya sendiri. Yang dibutuhkan: NDK dan `compileSdk` bawaan Flutter (dibaca `prereq` dari `FlutterExtension.kt` di Flutter SDK; Flutter 3.47.5: NDK `28.2.13676358`, platform 36) serta platform 34 untuk plugin `firebase_core` dan `firebase_auth`. Pasang dengan `%LOCALAPPDATA%\Android\Sdk\cmdline-tools\latest\bin\android.exe sdk install ndk/<versi> platforms/android-<level>` (cmdline-tools lama: `sdkmanager "ndk;<versi>"`). `prereq` menganggap paket terpasang hanya bila isinya lengkap (`source.properties` untuk NDK, `android.jar` untuk platform), jadi folder setengah jadi ikut dilaporkan.

## Belum diisi

- API (prefix, penamaan, format JSON): T-005
- Format error: T-005
- Database: T-006
- Pagination: T-008
- Clean Architecture API: T-011
- Kontrak dan client Dart: T-012
- Flutter: T-013 sampai T-016
- Test: T-005, T-006, T-013

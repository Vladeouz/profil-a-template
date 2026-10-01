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
| `hono` | 4.13.11 | T-005 |
| `@hono/zod-openapi` | 1.6.3 | T-005 |
| `@hono/node-server` | 2.1.3 | T-005 |
| `zod` | 4.6.5 | T-005 |
| `pino` | 10.3.1 | T-005 |
| `typescript` | 7.0.2 | T-005 |
| `tsx` | 4.23.15 | T-005 |
| `vitest` | 5.0.2 | T-005 |
| `@types/node` | 26.6.3 | T-005 |

Pasang dengan `pnpm --filter <paket> add -E <nama>` agar versi langsung pasti. Paket yang butuh build script saat install didaftarkan di `allowBuilds` pada `pnpm-workspace.yaml` (saat ini `esbuild`, dipakai `tsx` dan `vitest`); tanpa itu pnpm 12 keluar dengan `ERR_PNPM_IGNORED_BUILDS`.

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

## API

- Prefix `/v1` untuk semua endpoint kecuali `/health`; resource jamak; JSON camelCase; timestamp ISO 8601 UTC berakhiran `Z`; tanggal kalender `YYYY-MM-DD`.
- `src/app.ts` merakit app lewat `createApp(deps)` tanpa membaca `process.env`; `src/server.ts` satu-satunya tempat yang memanggil `loadEnv()` dan `serve()`. Test memakai `createTestApp()` (`test/helpers/test-app.ts`).
- Route didefinisikan dengan `createRoute` dari `@hono/zod-openapi` dan didaftarkan lewat fungsi `registerXxxRoutes(app)` di `features/<fitur>/http/<nama>.route.ts`. Setiap route punya `operationId`; skema yang diekspor diberi nama `.openapi('Nama')`. Contoh: `apps/api/src/features/system/http/health.route.ts`.
- Urutan middleware: `requestId` → `requestLogger` → `cors`, lalu `onError` dan `notFound`.

### Env

- Divalidasi Zod di `apps/api/src/core/config/env.ts`. Env salah atau hilang membuat server keluar dengan exit code 1 dan pesan yang menyebut nama variabelnya.
- Setiap variabel baru ditambahkan bersamaan ke skema `env.ts`, `.env.example`, dan `test/setup/env.ts` (default untuk test).
- `pnpm --filter api dev` dan `start` membaca `../../.env` lewat `--env-file-if-exists`; variabel yang sudah di-set di shell menang.
- `CORS_ORIGINS` wajib, daftar origin dipisah koma (misalnya `http://localhost:8081` untuk Flutter web). Origin lain tidak mendapat `Access-Control-Allow-Origin`. Lihat `apps/api/src/core/http/cors.ts`.

### Logger

- pino, JSON ke stdout (`apps/api/src/core/logger.ts`). Di handler pakai `c.var.log` (child logger dengan `requestId`).
- Field `authorization`/`Authorization`, `token`, `idToken`, `email`, `phone` diredaksi menjadi `[REDACTED]` sampai kedalaman 4. Field sensitif baru ditambahkan ke `SENSITIVE_KEYS` beserta test-nya.
- Log request hanya berisi method, path (tanpa query string), status, durasi, dan `requestId`. Header tidak pernah dicatat.

## Format error

Bentuk dan daftar `ErrorCode` mengikuti PRD bagian 5. Implementasi di `apps/api/src/core/http/errors.ts` dan `error-codes.ts`.

- Lempar `new AppError('NOT_FOUND', 'Note not found')` dari use case atau middleware; status HTTP diturunkan dari `code`. `message` bahasa Inggris untuk developer. `AppError` tidak membawa `details`.
- `details` hanya untuk `VALIDATION_ERROR` (`ValidationError`). Validasi Zod di route ditangani otomatis oleh `defaultHook`; validasi manual di luar route memakai `new ValidationError(validationDetails(issues, input))`.
- Kunci `details`: path digabung titik (`items.0.name`), `_root` bila tanpa path (body bukan objek, `refine` di level objek). Nilai: array `{ code, message }` dengan kode issue Zod (`invalid_type`, `too_small`, `too_big`, `invalid_format`, `custom`, …), kecuali field yang tidak dikirim (`undefined` di input mentah) memakai `{ code: 'required', message: 'Required' }`. Field yang dikirim `null` tetap `invalid_type`.
- `HTTPException` 4xx dari Hono dipetakan ke `ErrorCode` menurut status (JSON rusak → `400 BAD_REQUEST`; 4xx lain yang tidak ada di daftar → `BAD_REQUEST`). Error lain dan 5xx → `500 INTERNAL_ERROR` dengan pesan umum; error aslinya dicatat di log.
- Respons error di OpenAPI memakai `errorResponse('deskripsi')` agar semua route merujuk komponen `ErrorBody` → `ApiError` → `ErrorIssue`, `ErrorCode`.

## Test API

- Unit test di `apps/api/test/unit/`, mengikuti struktur `src/` (`src/core/http/errors.ts` → `test/unit/core/http/errors.test.ts`). Dijalankan `pnpm --filter api test`.
- Integration test di `apps/api/test/int/` dengan akhiran `.int.test.ts` (mulai T-006).
- `test/setup/env.ts` mengisi env default test tanpa menimpa nilai dari shell.
- Test HTTP memanggil `app.request()` pada `createTestApp()`, bukan server sungguhan. Route khusus test didaftarkan di app hasil `createTestApp()` di dalam file test-nya (contoh: `test/unit/core/http/errors.test.ts`).
- Log diperiksa dengan `createLogger({ level: 'info' }, stream)` memakai `Writable` yang menampung baris JSON (contoh: `test/unit/core/logger.test.ts`).

## Belum diisi

- Database: T-006
- Pagination: T-008
- Clean Architecture API: T-011
- Kontrak dan client Dart: T-012
- Flutter: T-013 sampai T-016
- Test: T-006 (integration test API), T-013 (Flutter)

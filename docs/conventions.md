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
| `drizzle-orm` | 0.45.3 | T-006 |
| `drizzle-kit` | 0.31.11 | T-006 |
| `pg` | 8.23.0 | T-006 |
| `@types/pg` | 8.23.1 | T-006 |
| `firebase-admin` | 14.5.0 | T-007 |

Pasang dengan `pnpm --filter <paket> add -E <nama>` agar versi langsung pasti. Paket yang butuh build script saat install didaftarkan di `allowBuilds` pada `pnpm-workspace.yaml` (saat ini `esbuild`, dipakai `tsx` dan `vitest`); tanpa itu pnpm 12 keluar dengan `ERR_PNPM_IGNORED_BUILDS`. Build script yang tidak dibutuhkan didaftarkan dengan nilai `false` beserta alasannya di komentar (saat ini `@firebase/util` dan `protobufjs`, dependency `firebase-admin`); jangan biarkan nilai placeholder `set this to true or false` yang ditulis pnpm.

pnpm 12 menolak versi yang rilis kurang dari sehari (`minimumReleaseAge`). Bila `pnpm add` menambah `minimumReleaseAgeExclude` ke `pnpm-workspace.yaml`, batalkan perubahan itu (`pnpm-workspace.yaml`, `pnpm-lock.yaml`, `package.json`) dan pin versi sebelumnya; jangan melonggarkan policy.

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
- File hasil generate yang formatnya ditentukan generatornya dikecualikan lewat `files.includes` di `biome.json` (saat ini `apps/api/drizzle/meta`), agar tidak bentrok saat di-generate ulang.

## Lingkungan Flutter dan Android

Dicek oleh `pnpm prereq` sebagai prasyarat opsional (peringatan, bukan kegagalan); ditemukan di T-004.

- **Pub cache satu drive dengan repo (Windows).** Bila repo dan pub cache beda drive (misalnya repo di `D:` dan pub cache bawaan di `%LOCALAPPDATA%\Pub\Cache`), build Android gagal saat kompilasi Kotlin plugin: `Could not close incremental caches … this and base files have different roots`. Atasi di mesin, bukan di proyek: `setx PUB_CACHE D:\pub-cache`, buka terminal baru, lalu `flutter pub get` ulang. Jangan menambah `kotlin.incremental=false` ke `apps/app`.
- **NDK dan SDK Platform Android dipasang sebelum build pertama.** Gradle bisa macet bila memasangnya sendiri. Yang dibutuhkan: NDK dan `compileSdk` bawaan Flutter (dibaca `prereq` dari `FlutterExtension.kt` di Flutter SDK; Flutter 3.47.5: NDK `28.2.13676358`, platform 36) serta platform 34 untuk plugin `firebase_core` dan `firebase_auth`. Pasang dengan `%LOCALAPPDATA%\Android\Sdk\cmdline-tools\latest\bin\android.exe sdk install ndk/<versi> platforms/android-<level>` (cmdline-tools lama: `sdkmanager "ndk;<versi>"`). `prereq` menganggap paket terpasang hanya bila isinya lengkap (`source.properties` untuk NDK, `android.jar` untuk platform), jadi folder setengah jadi ikut dilaporkan.

## API

- Prefix `/v1` untuk semua endpoint kecuali `/health`; resource jamak; JSON camelCase; timestamp ISO 8601 UTC berakhiran `Z`; tanggal kalender `YYYY-MM-DD`.
- `src/app.ts` merakit app lewat `createApp(deps)` tanpa membaca `process.env`; `src/server.ts` satu-satunya tempat yang memanggil `loadEnv()` dan `serve()`. Test memakai `createTestApp()` (`test/helpers/test-app.ts`).
- Route didefinisikan dengan `createRoute` dari `@hono/zod-openapi` dan didaftarkan lewat fungsi `registerXxxRoutes(app)` di `features/<fitur>/http/<nama>.route.ts`. Setiap route punya `operationId`; skema yang diekspor diberi nama `.openapi('Nama')`. Contoh: `apps/api/src/features/system/http/health.route.ts`.
- Urutan middleware: `requestId` → `requestLogger` → `cors`, lalu `onError` dan `notFound`; route publik (`/health`) didaftarkan sebelum `authenticate` di `/v1/*`.
- Dependency luar (database, verifier token) masuk lewat `AppDeps`; `createApp` merakit repository dan use case (composition root). Contoh: `apps/api/src/app.ts`.

### Env

- Divalidasi Zod di `apps/api/src/core/config/env.ts`. Env salah atau hilang membuat server keluar dengan exit code 1 dan pesan yang menyebut nama variabelnya.
- Setiap variabel baru ditambahkan bersamaan ke skema `env.ts`, `.env.example`, dan `test/setup/env.ts` (default untuk test).
- `pnpm --filter api dev` dan `start` membaca `../../.env` lewat `--env-file-if-exists`; variabel yang sudah di-set di shell menang.
- `FIREBASE_PROJECT_ID` wajib. `FIREBASE_AUTH_EMULATOR_HOST` (`host:port`) opsional; bila di-set, firebase-admin memverifikasi token ke Auth Emulator. Ditolak bila `NODE_ENV=production`.
- `CORS_ORIGINS` wajib, daftar origin dipisah koma (misalnya `http://localhost:8081` untuk Flutter web). Origin lain tidak mendapat `Access-Control-Allow-Origin`. Lihat `apps/api/src/core/http/cors.ts`.

### Logger

- pino, JSON ke stdout (`apps/api/src/core/logger.ts`). Di handler pakai `c.var.log` (child logger dengan `requestId`).
- Field `authorization`/`Authorization`, `token`, `idToken`, `email`, `phone` diredaksi menjadi `[REDACTED]` sampai kedalaman 4. Field sensitif baru ditambahkan ke `SENSITIVE_KEYS` beserta test-nya.
- Log request hanya berisi method, path (tanpa query string), status, durasi, dan `requestId`. Header tidak pernah dicatat.

## Autentikasi

- Semua route `/v1/*` dilindungi middleware `authenticate` (`apps/api/src/core/auth/authenticate.ts`) yang dipasang sekali di `app.ts` (`app.use('/v1/*', …)`); route tidak memasang auth sendiri. Route publik hanya di luar `/v1` dan wajib didaftarkan di `PUBLIC_ROUTES` pada `test/int/security/all-routes-require-auth.int.test.ts`.
- Header `Authorization: Bearer <ID token>`. Header tidak ada atau bukan Bearer → `401` `Missing bearer token`; token tidak valid, kedaluwarsa, atau untuk project lain → `401` `Invalid or expired token`. Kegagalan verifikasi yang bukan kesalahan token (`auth/internal-error`, misalnya sertifikat Google tidak bisa diambil) → `500`.
- Verifikasi lewat port `TokenVerifier` (`core/auth/firebase-admin.ts`), implementasinya `createFirebaseTokenVerifier(auth)`. firebase-admin diinisialisasi dengan `projectId` saja (tanpa service account) lewat `createFirebaseAdmin(projectId)` dengan nama app unik.
- Setelah token valid, use case `syncUser` (`features/users/usecases/sync-user.ts`) melakukan upsert `users` (`ON CONFLICT (firebase_uid)`) dengan email lowercase, `display_name` dari klaim `name`, dan `last_seen_at`; token adalah sumber kebenaran email dan nama. Hasilnya tersedia di handler sebagai `c.var.user` (entity `User`).
- Route terautentikasi memakai `security: bearerSecurity` dan `401: errorResponse(…)` di `createRoute`. Contoh: `apps/api/src/features/users/http/me.route.ts`.

## Database

- Drizzle ORM + `pg` (node-postgres). Skema di `apps/api/src/db/schema/`, satu file per tabel, diekspor ulang dari `schema/index.ts`. Contoh: `apps/api/src/db/schema/users.ts`.
- Tabel snake_case jamak; properti TypeScript camelCase dengan nama kolom ditulis eksplisit (`firebaseUid: text('firebase_uid')`).
- Kolom bersama dari `schema/columns.ts`: `id()` (`uuid` default `gen_random_uuid()`), `createdAt()`, `updatedAt()` (`$onUpdate`, hanya berlaku lewat `db.update()` Drizzle), `timestamptz(nama)` untuk timestamp lain. Semua timestamp `timestamptz` dengan `mode: 'date'`; kolom `date` memakai `mode: 'string'`.
- Constraint diberi nama eksplisit `<tabel>_<kolom>_<jenis>` (`users_firebase_uid_unique`, `users_email_lowercase_check`) agar test dan penanganan error bisa merujuknya. Enum ditulis sebagai `text` + `check`.
- Migrasi: ubah skema → `pnpm --filter api db:generate --name <ringkas>` → commit file `apps/api/drizzle/NNNN_<ringkas>.sql` beserta `meta/`. Migrasi yang sudah di-commit tidak diedit. `db:generate` tanpa perubahan skema harus mencetak `No schema changes`.
- `pnpm --filter api db:migrate` (`src/db/migrate.ts`) menerapkan migrasi ke `DATABASE_URL`; idempoten. Hanya butuh `DATABASE_URL` (`loadDatabaseUrl()`), bukan seluruh env server.
- Koneksi dibuat lewat `createDb(url)` dari `src/db/client.ts` (mengembalikan `{ db, pool, close }`).
- Tabel pg-boss ada di schema `pgboss`, dikelola pg-boss sendiri, bukan lewat migrasi Drizzle.

## Format error

Bentuk dan daftar `ErrorCode` mengikuti PRD bagian 5. Implementasi di `apps/api/src/core/http/errors.ts` dan `error-codes.ts`.

- Lempar `new AppError('NOT_FOUND', 'Note not found')` dari use case atau middleware; status HTTP diturunkan dari `code`. `message` bahasa Inggris untuk developer. `AppError` tidak membawa `details`.
- `details` hanya untuk `VALIDATION_ERROR` (`ValidationError`). Validasi Zod di route ditangani otomatis oleh `defaultHook`; validasi manual di luar route memakai `new ValidationError(validationDetails(issues, input))`.
- Kunci `details`: path digabung titik (`items.0.name`), `_root` bila tanpa path (body bukan objek, `refine` di level objek). Nilai: array `{ code, message }` dengan kode issue Zod (`invalid_type`, `too_small`, `too_big`, `invalid_format`, `custom`, …), kecuali field yang tidak dikirim (`undefined` di input mentah) memakai `{ code: 'required', message: 'Required' }`. Field yang dikirim `null` tetap `invalid_type`.
- `HTTPException` 4xx dari Hono dipetakan ke `ErrorCode` menurut status (JSON rusak → `400 BAD_REQUEST`; 4xx lain yang tidak ada di daftar → `BAD_REQUEST`). Error lain dan 5xx → `500 INTERNAL_ERROR` dengan pesan umum; error aslinya dicatat di log.
- Respons error di OpenAPI memakai `errorResponse('deskripsi')` agar semua route merujuk komponen `ErrorBody` → `ApiError` → `ErrorIssue`, `ErrorCode`.

## Test API

- Unit test di `apps/api/test/unit/`, mengikuti struktur `src/` (`src/core/http/errors.ts` → `test/unit/core/http/errors.test.ts`). Dijalankan `pnpm --filter api test`.
- Integration test di `apps/api/test/int/<area>/` dengan akhiran `.int.test.ts`, dijalankan `pnpm --filter api test:int` (butuh `docker compose up -d --wait`). Contoh: `test/int/db/schema.int.test.ts`.
- Global setup `test/setup/db.ts` membuat ulang database `<nama database DATABASE_URL>_test` (default `template_test`) setiap run dan menjalankan migrasi yang di-commit. Database utama hanya dipakai untuk `DROP`/`CREATE DATABASE`; datanya tidak disentuh. Bila PostgreSQL tidak bisa dihubungi, pesan error menyebut Docker.
- Setiap file integration test memanggil `const getDb = useTestDb();` (`test/helpers/db.ts`) di level atas: membuka pool ke database test dan men-`TRUNCATE` semua tabel `public` sebelum setiap test. File berjalan berurutan (`fileParallelism: false`).
- Pelanggaran constraint diperiksa lewat SQLSTATE dan nama constraint (`23505` unique, `23514` check, `23503` FK).
- `test/setup/env.ts` mengisi env default test tanpa menimpa nilai dari shell.
- `createTestApp()` memakai `db` yang belum terkoneksi dan `rejectAllTokens`, jadi unit test tidak butuh Docker. Integration test yang butuh login memberi `db: getDb().db` dan `tokenVerifier: createEmulatorTokenVerifier()`.
- Token login dibuat lewat Auth Emulator dengan `signUp()` / `updateAccount()` dari `test/helpers/emulator-token.ts` (email acak, emulator tidak dibersihkan). Token kedaluwarsa atau untuk project lain dibuat dengan `unsignedIdToken({ exp, aud, … })`. Contoh: `test/int/users/me.int.test.ts`.
- Test HTTP memanggil `app.request()` pada `createTestApp()`, bukan server sungguhan. Route khusus test didaftarkan di app hasil `createTestApp()` di dalam file test-nya (contoh: `test/unit/core/http/errors.test.ts`).
- Log diperiksa dengan `createLogger({ level: 'info' }, stream)` memakai `Writable` yang menampung baris JSON (contoh: `test/unit/core/logger.test.ts`).

## Belum diisi

- Pagination: T-008
- Clean Architecture API: T-011
- Kontrak dan client Dart: T-012
- Flutter: T-013 sampai T-016
- Test: T-013 (Flutter)

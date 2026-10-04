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
| `pg-boss` | 12.36.0 | T-009 |
| `swagger_parser` (Dart, dev) | 1.45.0 | T-012 |
| `build_runner` (Dart, dev) | 2.16.1 | T-012 |
| `json_serializable` (Dart, dev) | 6.14.1 | T-012 |
| `retrofit_generator` (Dart, dev) | 10.2.11 | T-012 |
| `test` (Dart, dev) | 1.32.0 | T-012 |
| `dio` (Dart) | 5.11.1 | T-012 |
| `retrofit` (Dart) | 4.10.0 | T-012 |
| `json_annotation` (Dart) | 4.12.0 | T-012 |
| `firebase_core` (Flutter) | 4.15.0 | T-004 (spike), T-013 |
| `firebase_auth` (Flutter) | 6.7.0 | T-004 (spike), T-013 |
| `get_it` (Flutter) | 9.3.0 | T-013 |
| `go_router` (Flutter) | 18.0.2 | T-013 |
| `equatable` (Flutter) | 3.0.0 | T-013 |
| `flutter_lints` (Flutter, dev) | 6.0.0 | T-004 (spike), T-013 |
| `mocktail` (Flutter, dev) | 1.0.5 | T-013 |
| `flutter_bloc` (Flutter) | 9.1.1 (`bloc` 9.2.1 transitif) | T-014 |
| `bloc_test` (Flutter, dev) | 10.0.0 | T-014 |

Pasang dengan `pnpm --filter <paket> add -E <nama>` agar versi langsung pasti. Paket Dart/Flutter: `flutter pub add <nama>:<versi>` (atau `flutter pub add <nama>` lalu hapus `^` di `pubspec.yaml`); `dio` di app sama persis dengan `packages/contract/dart`. Paket yang butuh build script saat install didaftarkan di `allowBuilds` pada `pnpm-workspace.yaml` (saat ini `esbuild`, dipakai `tsx` dan `vitest`); tanpa itu pnpm 12 keluar dengan `ERR_PNPM_IGNORED_BUILDS`. Build script yang tidak dibutuhkan didaftarkan dengan nilai `false` beserta alasannya di komentar (saat ini `@firebase/util` dan `protobufjs`, dependency `firebase-admin`); jangan biarkan nilai placeholder `set this to true or false` yang ditulis pnpm.

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

Dicek oleh `pnpm prereq` sebagai prasyarat opsional (peringatan, bukan kegagalan); ditemukan di T-004, dipakai untuk `apps/app` sejak T-013.

- **Pub cache satu drive dengan repo (Windows).** Bila repo dan pub cache beda drive (misalnya repo di `D:` dan pub cache bawaan di `%LOCALAPPDATA%\Pub\Cache`), build Android gagal saat kompilasi Kotlin plugin: `Could not close incremental caches … this and base files have different roots`. Atasi di mesin, bukan di proyek: `setx PUB_CACHE D:\pub-cache`, buka terminal baru, lalu `flutter pub get` ulang. `prereq` memperingatkan bila drive repo berbeda dengan drive `PUB_CACHE` (atau lokasi bawaannya) dan menyarankan nilai `setx` yang tepat. Jangan menambah `kotlin.incremental=false` ke `apps/app/android/gradle.properties`; pengaturan itu hanya ada di spike T-004.
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
- `RUN_WORKER` opsional, hanya `true` atau `false` (tidak di-set = `false`). Lihat bagian Job.
- `PUSH_ADAPTER` (`none`/`fake`/`fcm`) dan `STORAGE_ADAPTER` (`none`/`fake`/`firebase`) opsional, default `none`; `fake` ditolak bila `NODE_ENV=production`. `FIREBASE_STORAGE_BUCKET` wajib bila `STORAGE_ADAPTER=firebase`. `FIREBASE_STORAGE_EMULATOR_HOST` (`host:port`) opsional, ditolak bila `NODE_ENV=production`. Lihat bagian Port push dan storage.
- `CORS_ORIGINS` wajib, daftar origin dipisah koma (misalnya `http://localhost:8081` untuk Flutter web). Origin lain tidak mendapat `Access-Control-Allow-Origin`. Lihat `apps/api/src/core/http/cors.ts`.

### Logger

- pino, JSON ke stdout (`apps/api/src/core/logger.ts`). Di handler pakai `c.var.log` (child logger dengan `requestId`).
- Field `authorization`/`Authorization`, `token`, `idToken`, `email`, `phone` diredaksi menjadi `[REDACTED]` sampai kedalaman 4. Field sensitif baru ditambahkan ke `SENSITIVE_KEYS` beserta test-nya.
- Log request hanya berisi method, path (tanpa query string), status, durasi, dan `requestId`. Header tidak pernah dicatat.

## Job (pg-boss)

D-05: pg-boss berjalan di proses API, hanya bila `RUN_WORKER=true`. Implementasi di `apps/api/src/core/jobs/boss.ts`, contoh job di `apps/api/src/core/jobs/heartbeat.job.ts`.

- Satu job adalah `JobDefinition` (`name`, `handler`, `cron` opsional) yang dibuat fungsi `xxxJob(deps)` di file `<nama>.job.ts`, lalu didaftarkan di array `jobs` pada `startBoss()` di `src/server.ts`. Job milik fitur ditaruh di `features/<fitur>/jobs/`; `core/jobs` hanya untuk job sistem.
- Nama queue `<area>.<aksi>` (`system.heartbeat`). Jadwal cron 5 field, zona UTC (`*/5 * * * *`).
- `startBoss()` mengembalikan `null` tanpa membuka koneksi bila `runWorker` false. Bila true: start, lalu untuk setiap job `createQueue`, `schedule` (bila ada `cron`), dan `work`. Gagal di tengah jalan menghentikan pg-boss lalu melempar ulang error; `server.ts` keluar dengan exit code 1.
- pg-boss memakai pool sendiri dari `DATABASE_URL` dan schema `pgboss` (dibuat pg-boss, bukan migrasi Drizzle). Listener `error` selalu dipasang dan menulis ke log.
- Handler menerima array job (`Job<T>[]`) dan memakai logger yang diteruskan ke fungsi job, dengan field `job` dan `jobId`.

### Shutdown

`createShutdown()` di `apps/api/src/core/shutdown.ts`, dipasang untuk `SIGINT` dan `SIGTERM` di `src/server.ts`. Urutan:

1. `server.close()`: tolak koneksi baru dan tunggu request yang sedang berjalan. Koneksi keep-alive yang idle ditutup setiap 100 ms; tanpa itu Node menunggu `keepAliveTimeout` (beberapa detik).
2. `boss.stop({ graceful: true })`: tunggu job yang sedang berjalan.
3. Tutup koneksi lain di `closers` (pool database, firebase-admin). Koneksi baru yang perlu ditutup saat shutdown ditambahkan di sini.
4. `exit(0)`; bila ada langkah yang gagal, error dicatat, langkah berikutnya tetap jalan, dan exit code 1. Sinyal kedua tidak memulai shutdown baru.

Test: `test/int/jobs/boss.int.test.ts` (start, jadwal, job diproses, `RUN_WORKER` mati), `test/int/jobs/shutdown.int.test.ts` (urutan dengan server HTTP dan pg-boss sungguhan, fungsi shutdown dipanggil langsung tanpa sinyal). Koneksi pg-boss di `pg_stat_activity` memakai `application_name` `pgboss:<id>`.

## Autentikasi

- Semua route `/v1/*` dilindungi middleware `authenticate` (`apps/api/src/core/auth/authenticate.ts`) yang dipasang sekali di `app.ts` (`app.use('/v1/*', …)`); route tidak memasang auth sendiri. Route publik hanya di luar `/v1` dan wajib didaftarkan di `PUBLIC_ROUTES` pada `test/int/security/all-routes-require-auth.int.test.ts`.
- Header `Authorization: Bearer <ID token>`. Header tidak ada atau bukan Bearer → `401` `Missing bearer token`; token tidak valid, kedaluwarsa, atau untuk project lain → `401` `Invalid or expired token`. Kegagalan verifikasi yang bukan kesalahan token (`auth/internal-error`, misalnya sertifikat Google tidak bisa diambil) → `500`.
- Verifikasi lewat port `TokenVerifier` (`core/auth/firebase-admin.ts`), implementasinya `createFirebaseTokenVerifier(auth)`. firebase-admin diinisialisasi dengan `projectId` saja (tanpa service account) lewat `createFirebaseAdmin(projectId)` dengan nama app unik.
- Setelah token valid, use case `syncUser` (`features/users/usecases/sync-user.ts`) melakukan upsert `users` (`ON CONFLICT (firebase_uid)`) dengan email lowercase, `display_name` dari klaim `name`, dan `last_seen_at`; token adalah sumber kebenaran email dan nama. Hasilnya tersedia di handler sebagai `c.var.user` (entity `User`).
- Route terautentikasi memakai `security: bearerSecurity` dan `401: errorResponse(…)` di `createRoute`. Contoh: `apps/api/src/features/users/http/me.route.ts`.

## Port push dan storage

D-06: layanan luar yang tidak punya emulator atau aturannya berbeda per proyek dipakai lewat port (interface) di `apps/api/src/core/ports/`, dengan adapter di `core/ports/adapters/`. Use case hanya mengimpor port, tidak pernah firebase-admin.

- Adapter `none` (`adapters/none.ts`) adalah default bila env adapter tidak di-set: server tetap start, tetapi setiap pemakaian port melempar `PortNotConfiguredError` yang menyebut env yang harus di-set (`PushSender is not configured: set PUSH_ADAPTER to fcm or fake`). Di route, error ini menjadi `500 INTERNAL_ERROR` dan pesannya tercatat di log. Proyek yang tidak memakai push atau storage cukup membiarkannya `none`.
- Adapter `fake` hanya untuk development dan test; `loadEnv()` menolaknya bila `NODE_ENV=production` (sama seperti host emulator), sehingga server tidak start.
- `PushSender.send({ token, title, body, data? })` (`push-sender.ts`) → `{ status: 'sent', messageId }` atau `{ status: 'invalid-token' }` (token tidak terdaftar atau formatnya salah; pemanggil menghapus token itu). Kegagalan lain dilempar. Adapter: `fake-push.ts` (mencatat pesan di `sent`, `markInvalid(token)` untuk mensimulasikan token mati) dan `fcm-push.ts` (firebase-admin messaging; tidak ada emulator FCM, jadi hanya diuji dengan mock; di produksi butuh Application Default Credentials).
- `FileStorage` (`file-storage.ts`): `save(path, data, { contentType })` menimpa file lama, `read(path)` → `{ data, contentType }` atau `null`, `delete(path)` tidak error bila file tidak ada. Adapter: `fake-storage.ts` (di memori, `paths()` untuk test) dan `firebase-storage.ts` (bucket firebase-admin; memakai Storage Emulator bila `FIREBASE_STORAGE_EMULATOR_HOST` di-set). Akses lewat firebase-admin tidak terikat `storage.rules`.
- Path file relatif dengan segmen dipisah `/` (`users/<id>/avatar.png`), divalidasi `assertValidFilePath` di setiap adapter: tanpa `/` di awal atau akhir, segmen kosong, `.`/`..`, backslash, karakter kontrol, maksimal 1024 karakter. Path tidak valid → `InvalidFilePathError` sebelum ada request ke Storage.
- Adapter dipilih dari env oleh `createPorts(env, firebaseApp)` (`core/ports/create-ports.ts`) di `src/server.ts`, lalu masuk ke `createApp` lewat `AppDeps.ports` untuk dirakit ke use case. Klien firebase-admin hanya dibuat untuk adapter yang dipakai. Server mencatat adapter yang dipilih di log `API listening`.
- Test: `createTestApp()` memakai kedua adapter palsu; test yang perlu memeriksa pesan atau file memberi `ports` sendiri. Integration test Storage Emulator di `test/int/ports/firebase-storage.int.test.ts` memakai prefix acak per run dan menghapus file-nya sendiri (emulator tidak dibersihkan).
- Layanan luar baru (email, SMS, pembayaran) mengikuti pola yang sama: port + adapter `none` (default, melempar saat dipakai) + adapter `fake` (ditolak di produksi) + adapter sungguhan + pilihan `XXX_ADAPTER` di env.

## Pagination

Helper di `apps/api/src/core/http/pagination.ts`. Contoh route: `listNotesRoute` di `apps/api/src/features/notes/http/notes.route.ts`; contoh repository: `listByUser` di `features/notes/infrastructure/drizzle-note-repository.ts`.

- Query `?limit=20&cursor=<opaque>`: pakai `PaginationQuerySchema` sebagai `request.query`, atau `PaginationQuerySchema.extend({ ... })` bila route punya filter. `limit` 1–100, default 20. Handler menerima `cursor` yang sudah di-decode (`{ createdAt, id }` atau `undefined`).
- Cursor rusak → `422 VALIDATION_ERROR` dengan `details.cursor` (`custom`, `Invalid cursor`). Hanya bentuk kanonis hasil `encodeCursor` yang diterima.
- Respons `{ items, nextCursor }` dengan skema `pageSchema(ItemSchema, '<Item>Page')`; nama kedua menjadi nama komponen OpenAPI dan kelas Dart. `nextCursor` `null` di halaman terakhir.
- Cursor adalah base64url dari `createdAt|id`, urutan `created_at DESC, id DESC`. Repository mengambil `limit + 1` baris dengan kondisi `(created_at, id) < (cursor.createdAt, cursor.id)`, lalu `buildPage(rows, limit, positionOf)` membuang baris tambahan dan membentuk `nextCursor`.
- **Presisi timestamp.** Semua timestamp berpresisi milidetik (lihat Database), sama dengan `Date`, jadi repository memberi `positionOf` nilai `createdAt` (`Date`) dari baris apa adanya dan membandingkan `(created_at, id) < (${cursor.createdAt}::timestamptz, ${cursor.id}::uuid)`. Baris yang jatuh di milidetik yang sama diurutkan `id DESC` tanpa duplikat (dijaga `test/int/notes/notes.int.test.ts` › tidak ada duplikat bila beberapa note jatuh di milidetik yang sama). Decoder cursor tetap menerima 0–6 digit pecahan.
- Index pagination per pemilik: `index(...).on(table.userId, table.createdAt.desc().nullsFirst(), table.id.desc().nullsFirst())`. `nullsFirst()` wajib: tanpa itu Drizzle menulis `DESC NULLS LAST`, yang tidak cocok dengan `ORDER BY ... DESC`, sehingga PostgreSQL tetap melakukan `Sort` (dicek dengan `EXPLAIN` di `test/int/notes/notes-schema.int.test.ts`).
- Jangan menambah `.openapi()` pada `limit`: override itu menghapus `minimum`, `maximum`, dan `default` dari OpenAPI (dijaga test).

## Database

- Drizzle ORM + `pg` (node-postgres). Skema di `apps/api/src/db/schema/`, satu file per tabel, diekspor ulang dari `schema/index.ts`. Contoh: `apps/api/src/db/schema/users.ts`.
- Tabel snake_case jamak; properti TypeScript camelCase dengan nama kolom ditulis eksplisit (`firebaseUid: text('firebase_uid')`).
- Kolom bersama dari `schema/columns.ts`: `id()` (`uuid` default `gen_random_uuid()`), `createdAt()`, `updatedAt()` (`$onUpdate`, hanya berlaku lewat `db.update()` Drizzle), `timestamptz(nama)` untuk timestamp lain. Kolom `date` memakai `mode: 'string'`.
- **Semua timestamp presisi milidetik:** `timestamptz(3)` dengan `mode: 'date'`, selalu lewat helper di `schema/columns.ts`, tidak pernah `timestamp(...)` langsung. `Date` di JavaScript hanya milidetik, jadi nilai di database, entity, respons API, dan cursor pagination selalu sama persis; nilai yang lebih presisi dibulatkan PostgreSQL ke milidetik. Dijaga `test/int/db/schema.int.test.ts` › semua kolom timestamp di schema public berpresisi milidetik (tabel baru otomatis ikut diperiksa). Akibatnya dua penulisan bisa mendapat timestamp yang sama: test yang membandingkan `updated_at` sebelum dan sesudah update mengisi nilai awal di masa lalu, bukan mengandalkan `toBeGreaterThan` antara dua `now()`.
- Constraint dan index diberi nama eksplisit `<tabel>_<kolom>_<jenis>` (`users_firebase_uid_unique`, `users_email_lowercase_check`, `notes_title_length_check`, `notes_user_id_fk`, `notes_user_id_created_at_id_index`) agar test dan penanganan error bisa merujuknya. Foreign key ditulis dengan `foreignKey({ name, columns, foreignColumns })`, bukan `.references()`, karena nama bawaan Drizzle tidak mengikuti pola ini. Enum ditulis sebagai `text` + `check`. Contoh: `apps/api/src/db/schema/notes.ts`.
- Data milik user memakai `user_id` FK ke `users.id` `ON DELETE CASCADE`. Batas panjang teks ditegakkan dengan CHECK `char_length(...)` selain skema Zod route; batas Zod sama atau lebih ketat (Zod menghitung UTF-16 code unit, `char_length` menghitung karakter), jadi input yang lolos Zod tidak pernah melanggar CHECK.
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
- Setiap use case punya unit test dengan repository palsu di memori yang meniru perilaku implementasi Drizzle (pembatasan pemilik, urutan, cursor). Repository palsu fitur ditaruh di `test/unit/features/<fitur>/fake-<nama>-repository.ts` (bukan `*.test.ts`, jadi tidak dijalankan sendiri). Contoh: `test/unit/features/notes/fake-note-repository.ts`, `test/unit/features/notes/usecases/*.test.ts`.
- Unit test route memeriksa pemetaan DTO dan dokumen OpenAPI (operationId, security, status, nama skema); perilaku route yang butuh login diuji di integration test. Contoh: `test/unit/features/notes/http/notes.route.test.ts`, `test/int/notes/notes.int.test.ts`.
- Keadaan awal integration test dibuat dengan `insertUser`, `insertNote`, `insertNotes` dari `test/helpers/factories.ts`; data yang diuji lewat HTTP tetap dibuat lewat route. Integration test yang butuh `userId` login memanggil `GET /v1/me` dulu (helper `login()` di `test/int/notes/notes.int.test.ts`).

## Clean Architecture API

Contoh lengkap: `apps/api/src/features/notes/` (fitur CONTOH yang ditiru lalu dihapus di proyek).

```
features/<fitur>/
├── domain/<entity>.ts                         # entity, input, interface repository; tanpa import Hono/Drizzle
├── usecases/<aksi>-<entity>.ts                # satu use case per file
├── infrastructure/drizzle-<entity>-repository.ts
└── http/<fitur>.route.ts                      # skema Zod, createRoute, DTO, registerXxxRoutes
```

- Arah dependency: `http` → `usecases` → `domain` ← `infrastructure`. Use case hanya mengimpor `domain`, `AppError` (`core/http/errors.ts`), port (`core/ports`), dan tipe `Page`/`CursorPosition` (`core/http/pagination.ts`); tidak pernah Hono, Drizzle, atau firebase-admin.
- Use case adalah fungsi pabrik `xxxNote({ notes })` yang mengembalikan fungsi, dengan tipe `export type XxxNote = ReturnType<typeof xxxNote>`. Dependency (repository, port, `now`) masuk lewat objek pertama agar test bisa memberi versi palsu. Contoh: `features/notes/usecases/get-note.ts`.
- Entity domain memakai `Date` untuk timestamp. Konversi ke JSON (`toISOString()`, membuang field internal seperti `userId`) hanya di `http` lewat fungsi `toXxxDto`.
- Repository dibatasi pemilik: setiap metode menerima `userId` dan memfilter `user_id` di query yang sama (bukan ambil dulu lalu cek), lalu mengembalikan `null`/`false` bila tidak ada atau milik user lain. Use case mengubahnya menjadi `AppError('NOT_FOUND', ...)` (D-07: `404`, bukan `403`).
- `createApp()` di `src/app.ts` adalah composition root: buat repository dari `db`, rakit use case, lalu `registerXxxRoutes(app, { ...useCases })`. Route menerima use case lewat parameter, bukan membuatnya sendiri.
- Route: path param `id` divalidasi `z.uuid()` (bukan UUID → `422 details.id`); body POST/PATCH memakai `request.body.required: true`; PATCH memakai skema dengan semua field opsional + `.refine()` minimal satu field (→ `details._root`); `DELETE` mengembalikan `c.body(null, 204)`. Skema request dan respons diberi nama `.openapi('Note')`, `'CreateNoteInput'`, `'UpdateNoteInput'`, `'NotePage'`.

## Kontrak dan client Dart

D-01, D-02: route Hono adalah satu-satunya sumber kebenaran. `packages/contract/openapi.json` (OpenAPI 3.1) dan package Dart `api_client` di `packages/contract/dart/` adalah hasil generate yang di-commit; jangan diedit manual.

- `pnpm contract:generate` (`scripts/contract.mjs`): `apps/api/scripts/export-openapi.ts` menulis `openapi.json` dari `createApp()` (tanpa `.env`, Docker, atau koneksi database), lalu `dart pub get`, hapus `dart/lib/src/api/`, `dart run swagger_parser`, `dart run build_runner build`, dan `dart analyze`. Jalankan setiap kali route atau skema Zod berubah, lalu commit hasilnya bersama perubahan route.
- `pnpm contract:check`: generate ulang di salinan sementara (working tree tidak disentuh), lalu membandingkan byte per byte `openapi.json` dan semua file di `dart/lib/src/api/`. Gagal (exit 1) dengan daftar file yang berbeda, belum ada di repo, atau tidak lagi dihasilkan generator.
- `openapi.json` diformat Biome setelah export (lewat stdin, memakai `biome.json`), sehingga `pnpm lint` bersih dan hasilnya deterministik.
- File Dart hasil generate **tidak** diformat ulang (`dart format` tidak dijalankan pada `lib/src/api/`); `contract:check` membandingkan hasil generate apa adanya. Hasilnya deterministik selama versi generator sama, karena itu `dart/pubspec.lock` di-commit.
- Yang ditulis tangan di package: `pubspec.yaml`, `swagger_parser.yaml`, `lib/api_client.dart` (mengekspor `src/api/export.dart`), dan `test/api_client_test.dart`. Test dijalankan dengan `dart test` di `packages/contract/dart`.
- Nama komponen OpenAPI menjadi nama kelas Dart: setiap skema request, respons, dan objek bersarang yang penting diberi `.openapi('Nama')`. Tanpa nama, swagger_parser membuat nama sendiri (objek error tanpa nama menjadi kelas `Error` yang menutupi `dart:core`). Satu tag OpenAPI menjadi satu client (`NotesClient`, `UsersClient`, `SystemClient`), dirangkum `ApiClient`.
- `ErrorCode` menjadi enum Dart dengan nilai `$unknown` untuk kode yang belum dikenal (`unknown_enum_value: true`); Flutter memetakan `$unknown` ke teks umum. Respons error sampai di dio sebagai `DioException` dengan `response.data` berupa `Map`, dibaca dengan `ErrorBody.fromJson`.
- Waktu: `build_runner` pertama ~35–45 detik (kompilasi builder; juga berlaku untuk `contract:check` bila `dart/.dart_tool` belum ada, misalnya di CI). Setelah itu `contract:check` ~6 detik karena `.dart_tool` ikut disalin ke folder sementara.

## Flutter

Aplikasi di `apps/app` (package `app`, platform web, Android, iOS), dibuat dengan `flutter create --empty`. Lint `flutter_lints` + `strict-casts`, `strict-inference`, `strict-raw-types`, `always_use_package_imports`, `prefer_single_quotes` (`analysis_options.yaml`); format dengan `dart format` (lebar bawaan 80). `flutter analyze` dan `flutter test` dijalankan di `apps/app`.

```
lib/
├── main.dart                 # config → Firebase → useAuthEmulator → tunggu authStateChanges().first → configureDependencies → runApp
├── app.dart                  # MaterialApp.router: tema, locale id, router
└── core/
    ├── config/app_config.dart
    ├── di/injection.dart
    ├── error/                # failure.dart, result.dart
    ├── l10n/                 # app_locale.dart, failure_messages.dart
    ├── network/              # create_dio.dart, auth_interceptor.dart, token_provider.dart, error_mapper.dart, api_call.dart
    ├── router/app_router.dart
    └── theme/app_theme.dart
```

Fitur di `lib/features/<fitur>/` (contoh lengkap: `features/auth/`):

```
features/auth/
├── auth_dependencies.dart    # registerAuthDependencies(GetIt), dipanggil configureDependencies
├── domain/
│   ├── entities/             # auth_user.dart (Dart murni + equatable)
│   ├── repositories/         # auth_repository.dart (abstract interface class)
│   └── usecases/             # satu kelas per file, satu metode call: sign_in.dart, register.dart, sign_out.dart, watch_auth_user.dart
├── data/                     # auth_mapper.dart (SDK/DTO → entity, exception → Failure), firebase_auth_repository.dart
└── presentation/
    ├── cubit/                # <nama>_cubit.dart + <nama>_state.dart (sealed)
    ├── pages/                # satu halaman per rute
    └── widgets/
```

### Config

- D-04: nilai dibaca dari `--dart-define-from-file=config/dev.json` (`flutter run -d chrome --web-port 8081 --dart-define-from-file=config/dev.json`). Kunci: `API_BASE_URL`, `FIREBASE_PROJECT_ID` (`demo-template`), `FIREBASE_API_KEY`, `FIREBASE_APP_ID`, `FIREBASE_MESSAGING_SENDER_ID` (dummy, satu nilai untuk semua platform), `USE_EMULATOR`, `AUTH_EMULATOR_HOST`, `AUTH_EMULATOR_PORT`. Tanpa `flutterfire configure` dan `google-services.json`.
- `AppConfig.fromEnvironment()` (`core/config/app_config.dart`) membaca `String.fromEnvironment`, lalu `AppConfig.fromMap()` memvalidasi. Nilai kosong atau salah → `ConfigException` yang menyebut nama kunci. Kunci baru ditambahkan bersamaan ke `config/dev.json`, `fromEnvironment`, `fromMap`, dan test-nya.
- Di Android (bukan web), host `localhost`/`127.0.0.1` di `API_BASE_URL` dan `AUTH_EMULATOR_HOST` diganti `10.0.2.2` oleh kode (`resolveHost`), bukan config terpisah per platform.
- Build debug Android mengizinkan HTTP (`android:usesCleartextTraffic="true"` hanya di `android/app/src/debug/AndroidManifest.xml`) karena API lokal dan Auth Emulator memakai HTTP.
- `useAuthEmulator` dipanggil di `main.dart` setelah `Firebase.initializeApp` dan sebelum operasi Auth apa pun. Peringatan Android `FirebaseApp failed to initialize because no default options were found` wajar.

### Result dan Failure

- Repository dan use case mengembalikan `Result<T>` (`core/error/result.dart`): sealed `Ok(value)` / `Err(failure)`, dibaca dengan `switch`. Exception tidak dilempar melewati batas repository.
- `Failure` (`core/error/failure.dart`) adalah kelas Dart murni (tanpa dio atau DTO) berisi `FailureCode`, `message` (Inggris, untuk log), dan `fieldErrors` (`Map<String, List<FieldIssue>>`, dari `details` 422 dengan kunci path yang sama: `title`, `items.0.name`, `_root`).
- `FailureCode` = setiap `ErrorCode` kontrak + `network` (gagal koneksi/timeout) + `unknown` (kode belum dikenal atau body tidak terbaca).

### Network

- Dio dibuat `createDio()` (`core/network/create_dio.dart`) dengan `baseUrl` dari config dan `AuthInterceptor`; `ApiClient` dari `api_client` memakai Dio itu.
- `AuthInterceptor` menambahkan `Authorization: Bearer <ID token>` dari `TokenProvider` (`FirebaseTokenProvider` → `currentUser.getIdToken()`) bila user login. Respons `401` → token di-refresh sekali (`forceRefresh`) dan request diulang sekali (penanda `extra['authRetried']`); `401` kedua, gagal refresh, atau user tidak login → error diteruskan.
- Repository memanggil `api_client` lewat `apiCall(() => client.notes.getNote(id: id), map: noteFromDto)` (`core/network/api_call.dart`): `DioException` → `Err(failureFromDioException(e))`. Exception lain (bug mapper) tidak ditangkap.
- `failureFromDioException` (`core/network/error_mapper.dart`) membaca body `ErrorBody` dan memetakan `ErrorCode` lewat `failureCodeOf` (switch tanpa `default`: kode baru di kontrak membuat `flutter analyze` gagal sampai dipetakan).

### Teks UI dan l10n

- Teks UI Bahasa Indonesia ditulis langsung di widget (satu bahasa, tanpa ARB). `AppLocale` (`core/l10n/app_locale.dart`) memasang locale `id` dan delegate Material/Cupertino agar teks bawaan widget juga Bahasa Indonesia.
- D-03: teks kegagalan untuk user hanya dari `failureMessage(FailureCode)` dan `fieldIssueMessage(FieldIssue)` di `core/l10n/failure_messages.dart`, dengan `genericFailureMessage` sebagai cadangan. `Failure.message` dari server tidak pernah ditampilkan.

### DI dan router

- get_it dengan registrasi manual. `configureDependencies({config, auth, container})` (`core/di/injection.dart`) mendaftarkan `AppConfig`, `FirebaseAuth`, `TokenProvider`, `Dio`, `ApiClient`, lalu memanggil `registerXxxDependencies(container)` setiap fitur. `FirebaseAuth` diberikan dari luar agar test memakai mock; test memakai `GetIt.asNewInstance()`.
- `getIt` hanya dipanggil di composition root (`main.dart`, router, `registerXxxDependencies`); widget dan Cubit menerima dependency lewat konstruktor.
- go_router: path di `AppRoutes`, rute di `createRouter({container, initialLocation})` (`core/router/app_router.dart`), rute tidak dikenal → `NotFoundPage`. `App` menerima `router` opsional untuk test.
- Registrasi: repository dan use case `registerLazySingleton`; Cubit halaman `registerFactory` dan dipasang router dengan `BlocProvider(create: (_) => c<LoginCubit>(), child: const LoginPage())`; Cubit sepanjang umur app (`AuthSessionCubit`) `registerLazySingleton` dengan `dispose`.

### Autentikasi Flutter

- Firebase Auth email/password lewat `AuthRepository` (`features/auth/domain/repositories/auth_repository.dart`); implementasi `FirebaseAuthRepository` memakai SDK Firebase langsung sebagai data source. `FirebaseAuthException.code` → `FailureCode` di `failureFromFirebaseAuth` (`features/auth/data/auth_mapper.dart`); `invalid-credential`/`wrong-password`/`user-not-found` sama-sama `invalidCredentials` (tidak membocorkan apakah akun ada).
- `FailureCode` memuat kode Firebase Auth (`invalidCredentials`, `emailAlreadyInUse`, `weakPassword`, `invalidEmail`, `tooManyRequests`) di samping kode API, sehingga semua teks kegagalan tetap di `failure_messages.dart`.
- Status login: `AuthSessionCubit` (sealed `Authenticated(user)` / `Unauthenticated`), state awal dari `currentUser`; `main.dart` menunggu `authStateChanges().first` sebelum `runApp` agar sesi tersimpan (web) sudah dipulihkan. Logout lewat `AuthSessionCubit.signOut()` (`SignOutButton`); state berubah lewat stream user, bukan langsung.
- Rute terlindungi secara default: `redirect` di `createRouter` mengarahkan semua rute selain `AppRoutes.public` (`/login`, `/register`) ke login bila belum login, dan rute publik ke beranda bila sudah login. Dievaluasi ulang setiap `AuthSessionCubit` berubah (`refreshListenable`). Rute terlindungi ditaruh di `ShellRoute` yang memasang `AuthSessionCubit` (untuk `SignOutButton`). Halaman terlindungi memasang `SignOutButton` di `AppBar.actions`.
- Form login dan daftar: `AuthForm` + `AuthFormState` (sealed `Idle`/`Submitting`/`Failed(failure)`/`Succeeded`). Validasi lokal hanya "wajib diisi"; aturan lain dari Firebase. Perpindahan halaman setelah berhasil dilakukan router, bukan halaman.
- Cubit yang menunggu `Future` memeriksa `isClosed` sebelum `emit` dan mengabaikan submit kedua saat `Submitting` (`features/auth/presentation/cubit/login_cubit.dart`).

### Test Flutter

- Test di `apps/app/test/` mengikuti struktur `lib/` (`lib/core/network/auth_interceptor.dart` → `test/core/network/auth_interceptor_test.dart`). Helper test yang bukan test tanpa akhiran `_test.dart` (contoh: `test/core/network/fake_http_adapter.dart`).
- Mock dengan `mocktail` (`class MockFirebaseAuth extends Mock implements FirebaseAuth {}`). Mock per fitur dikumpulkan di `test/features/<fitur>/mocks.dart` (`MockAuthRepository`, `MockLoginCubit extends MockCubit<AuthFormState> implements LoginCubit`).
- Use case: satu file test per use case, repository di-mock (`test/features/auth/domain/usecases/sign_in_test.dart`). Cubit: `blocTest` (`test/features/auth/presentation/cubit/login_cubit_test.dart`). Halaman: widget test dengan Cubit mock + `whenListen` (`test/features/auth/presentation/pages/login_page_test.dart`).
- Router: widget test dengan wiring fitur asli (`registerAuthDependencies` pada `GetIt.asNewInstance()`) dan repository diganti fake dalam memori (`test/features/auth/fake_auth_repository.dart`), lalu `App(router: createRouter(container: c))` (`test/core/router/app_router_test.dart`).
- HTTP diuji lewat Dio sungguhan dengan `FakeHttpAdapter` (mencatat request, menjawab per request), bukan mock Dio. Contoh: `test/core/network/auth_interceptor_test.dart`, `test/core/network/error_mapper_test.dart`.
- Test `config/dev.json` membaca file aslinya, jadi kunci yang hilang terdeteksi (`test/core/config/app_config_test.dart`).

## Belum diisi

- Flutter: fitur notes (T-015, T-016)

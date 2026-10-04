# Template Starter Profil A

Template untuk proyek Profil A: Flutter (web, Android, iOS) + API Hono + PostgreSQL + Firebase.
Rencana dan status pembangunan template ada di `docs/PRD.md` dan `docs/TASKS.md`; konvensi proyek ada di `docs/conventions.md`.

> Template masih dibangun. Bagian di bawah diperbarui setiap task selesai.

## Prasyarat

| Prasyarat | Wajib | Catatan |
| --- | --- | --- |
| Node.js 24 LTS | ya | versi ada di `.nvmrc` |
| pnpm 12.6.0 | ya | dipin lewat `packageManager`; aktifkan dengan `corepack enable` |
| Git | ya | |
| Docker Desktop (engine hidup) | ya | |
| Flutter stable 3.47.5 (Dart 3.13.4) | ya | versi yang juga dipakai CI; di Windows, Smart App Control dapat memblokir `dart.exe` |
| Android SDK + emulator | tidak | hanya untuk verifikasi Android |
| File `.env` | ya | salin sendiri dari `.env.example` |

## Dari clone sampai `pnpm check` hijau

Perintah dijalankan dari root repo (kecuali disebut lain) dan berlaku di CMD, PowerShell, Git Bash, maupun Linux.

1. Pasang prasyarat di atas, lalu aktifkan pnpm dan pasang dependency:

   ```sh
   corepack enable
   pnpm install
   ```

2. Buat `.env` dari contohnya (sesuaikan isinya bila perlu):

   ```sh
   copy .env.example .env
   ```

   Di Git Bash atau Linux: `cp .env.example .env`.

3. Periksa prasyarat sampai semua baris wajib berstatus OK:

   ```sh
   pnpm prereq
   ```

4. Nyalakan Docker Desktop, lalu jalankan layanan lokal (build pertama image emulator butuh sekitar 5–7 menit):

   ```sh
   docker compose up -d --wait
   ```

5. Jalankan seluruh verifikasi:

   ```sh
   pnpm check
   ```

   Hijau bila ringkasan di akhir menampilkan `Semua 7 langkah OK.`

### `pnpm prereq`

`pnpm prereq` menampilkan tabel status setiap prasyarat beserta perintah perbaikannya, dan keluar dengan exit code bukan 0 bila ada prasyarat wajib yang gagal. Script ini tidak pernah membuat atau mengubah file.

> Jangan tertukar dengan `pnpm doctor`: itu perintah bawaan pnpm untuk mendiagnosa instalasi pnpm sendiri.

## `pnpm check`

Menjalankan berurutan: Biome (`pnpm lint`), typecheck API, unit test API, integration test API, `pnpm contract:check`, `flutter analyze`, dan `flutter test`. Langkah yang gagal tidak menghentikan langkah berikutnya; di akhir tampil ringkasan status dan waktu per langkah, dan exit code bukan 0 bila ada langkah yang gagal. Output langkah yang gagal ada di atas ringkasan.

- Integration test butuh layanan lokal (`docker compose up -d --wait`). Bila Docker mati, langkah itu gagal dengan pesan yang menyebut Docker.
- Waktu total sekitar 1 menit di laptop pengembang (target di bawah 5 menit), setelah dependency terpasang dan image emulator sudah ada. `contract:check` pertama kali bisa lebih lama karena `dart pub get`.
- Integration test memakai database `<POSTGRES_DB>_test` tersendiri, jadi aman dijalankan saat API sedang berjalan.

## Menjalankan API dan Flutter

Butuh layanan lokal (`docker compose up -d --wait`) dan `.env`.

1. Migrasi database utama (sekali, dan setiap ada migrasi baru):

   ```sh
   pnpm --filter api db:migrate
   ```

2. Jalankan API di `http://localhost:3000` (reload otomatis saat kode berubah); cek dengan membuka `http://localhost:3000/health`:

   ```sh
   pnpm --filter api dev
   ```

3. Di terminal lain, jalankan Flutter dari folder `apps/app`:

   ```sh
   cd apps/app
   flutter run -d chrome --web-port 8081 --dart-define-from-file=config/dev.json
   ```

   Port web harus `8081`, karena hanya origin itu yang diizinkan `CORS_ORIGINS` di `.env`.

   Android emulator: nyalakan emulator, lihat id-nya dengan `flutter devices` (misalnya `emulator-5554`), lalu:

   ```sh
   flutter run -d emulator-5554 --dart-define-from-file=config/dev.json
   ```

   Di Android, host `localhost` di `config/dev.json` otomatis diganti `10.0.2.2`. Lihat juga bagian "Lingkungan Flutter dan Android" di `docs/conventions.md` sebelum build Android pertama.

Akun dibuat lewat tombol daftar di aplikasi dan disimpan di Auth Emulator (hanya di memori: hilang saat container emulator di-restart atau dibuat ulang).

## Layanan lokal

```sh
docker compose up -d --wait
```

| Service | Port | Isi |
| --- | --- | --- |
| `postgres` | 5432 | PostgreSQL 17, data disimpan di volume `postgres-data` |
| `firebase-auth` | 9099 | Firebase Auth Emulator, project `demo-template` |
| `firebase-storage` | 9199 | Firebase Storage Emulator, bucket `demo-template.appspot.com` |

- Build pertama image emulator (`docker/firebase-emulator/Dockerfile`) butuh sekitar 5–7 menit; setelah itu `up` selesai dalam hitungan detik.
- Nilai diambil dari `.env` bila ada, dengan default yang sama dengan `.env.example`.
- `firebase.json` dan `storage.rules` di-mount ke container. Setelah mengubahnya, jalankan `docker compose up -d --wait --force-recreate firebase-storage`; tidak perlu build ulang.
- `storage.rules` menolak semua akses client. API mengakses Storage lewat firebase-admin, yang tidak terikat aturan ini.
- Cek cepat: `curl http://localhost:9099/` berisi `"ready": true`.
- Berhenti: `docker compose down` (data PostgreSQL tetap ada); hapus data: `docker compose down -v`.
- `pnpm prereq` ikut menampilkan status ketiga layanan sebagai prasyarat opsional.

## Perintah

| Perintah | Fungsi |
| --- | --- |
| `pnpm prereq` | Memeriksa prasyarat lingkungan |
| `pnpm check` | Menjalankan semua verifikasi (lint, typecheck, test API, kontrak, Flutter) |
| `pnpm lint` | Lint dan cek format dengan Biome (`biome check .`) |
| `pnpm format` | Memperbaiki format dan lint yang bisa diperbaiki otomatis |

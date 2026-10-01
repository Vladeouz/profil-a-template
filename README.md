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

## Mulai

```sh
corepack enable
pnpm install
pnpm prereq
```

`pnpm prereq` menampilkan tabel status setiap prasyarat beserta perintah perbaikannya, dan keluar dengan exit code bukan 0 bila ada prasyarat wajib yang gagal. Script ini tidak pernah membuat atau mengubah file.

> Jangan tertukar dengan `pnpm doctor`: itu perintah bawaan pnpm untuk mendiagnosa instalasi pnpm sendiri.

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
| `pnpm lint` | Lint dan cek format dengan Biome (`biome check .`) |
| `pnpm format` | Memperbaiki format dan lint yang bisa diperbaiki otomatis |

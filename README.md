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
| Flutter stable | ya | di Windows, Smart App Control dapat memblokir `dart.exe` |
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

## Perintah

| Perintah | Fungsi |
| --- | --- |
| `pnpm prereq` | Memeriksa prasyarat lingkungan |
| `pnpm lint` | Lint dan cek format dengan Biome (`biome check .`) |
| `pnpm format` | Memperbaiki format dan lint yang bisa diperbaiki otomatis |

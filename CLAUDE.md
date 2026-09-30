# Aturan kerja untuk Claude Code

## Di awal setiap sesi

- Baca `docs/PRD.md`, `docs/conventions.md` (jika sudah ada), dan log task terakhir di `docs/logs/`.
- Ambil task berikutnya dari `docs/TASKS.md`: task pertama yang belum dicentang dan semua `depends_on`-nya sudah dicentang.

## Mengerjakan task

- Kerjakan SATU task per sesi. Setelah task selesai atau terhenti, berhenti dan lapor, lalu tunggu instruksi user.
- Buat branch baru dari `master` bernama `<type>/t-xxx-<ringkas>` (type: feat, fix, chore, docs, test). Pesan commit: `<type>: <ringkasan> (T-xxx)`. Jangan merge ke `master`; merge dilakukan user setelah meninjau hasilnya.
- Ikuti konvensi di bagian 3 dan 5 PRD serta `docs/conventions.md`. Jika konvensi belum mengatur sesuatu, pilih yang paling sederhana, catat di log sebagai keputusan mandiri, dan usulkan agar ditambahkan ke `docs/conventions.md`.
- Hanya sentuh file yang relevan dengan task. Jika perlu membuat file di luar daftar `files`, sebutkan beserta alasannya di log.
- Jangan membuat atau mengubah `.env` dan secret apa pun. Jika dibutuhkan, minta user melakukannya.
- Jangan mengubah keputusan di bagian 8 PRD atau kriteria *done when* tanpa persetujuan user. Jika ada kendala, jelaskan dan tawarkan pilihan beserta konsekuensinya.

## Verifikasi

- Centang task di `docs/TASKS.md` hanya setelah SEMUA kriteria *done when* terbukti. Jalankan ulang seluruh kriteria dari awal sebelum mencentang, bukan hanya bagian yang terakhir diperbaiki.
- Untuk kriteria bertanda **(manual)**, tuliskan langkah verifikasi yang jelas untuk user, lalu tunggu konfirmasinya.
- Jika ada kriteria yang tidak bisa dipenuhi, jangan mencentang. Laporkan penyebabnya dengan jujur.
- Setelah `pnpm check` tersedia (T-017), perintah itu harus hijau sebelum task apa pun dicentang.

## Log per task

Setelah menyelesaikan atau menghentikan task, tulis `docs/logs/T-xxx.md` dan commit bersama task-nya, dengan bagian:

- **Status** dan nama branch.
- **Ringkasan** pekerjaan.
- **Verifikasi:** tabel perintah dan hasilnya, dipetakan ke setiap kriteria *done when*.
- **File yang diubah.**
- **Keputusan yang diambil sendiri**, beserta alasannya.
- **Hasil spike** (khusus task spike): berhasil atau tidak, dan rekomendasi untuk keputusan terkait di bagian 8 PRD.
- **Kendala.**
- **Task berikutnya.**

## Lingkungan

- Mesin pengembang memakai Windows. Semua script otomatisasi ditulis dalam Node (`.mjs`), bukan shell. Hindari heredoc untuk menulis banyak file; tulis file satu per satu.
- Layanan lokal berjalan lewat Docker Desktop. Jika Docker tidak merespons, minta user menyalakannya; jangan mencoba mengakalinya.

## Rujukan

- Repo uji `D:\dev\gym-membership` (jika user memberi akses ke folder itu) boleh dibaca sebagai rujukan untuk Docker Compose, image emulator Firebase, logger, format error, setup Drizzle, dan database test. Jangan menyalin apa pun yang spesifik gym. Format `details` pada error 422 di template ini BERBEDA dari repo itu; ikuti bagian 5 PRD.

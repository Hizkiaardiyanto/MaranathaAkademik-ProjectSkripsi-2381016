# Maranatha Akademik

Portal akademik SD–SMP Kristen Maranatha untuk administrator, siswa, dan guru.
Data induk serta data akademik disimpan di MySQL melalui koneksi TLS.

## Menjalankan aplikasi

Persyaratan: Node.js 20.9 atau lebih baru dan npm.

```bash
npm install
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000). Jika port 3000 sedang
digunakan, jalankan `npm run dev -- --port 3001` dan buka port tersebut.

## Konfigurasi database dan sesi

1. Salin `.env.example` menjadi `.env.local`.
2. Di Aiven Console, buka layanan **Aiven for MySQL** > **Overview** >
   **Connection information**, lalu isi `MYSQL_HOST`, `MYSQL_PORT`,
   `MYSQL_USER`, `MYSQL_PASSWORD`, dan `MYSQL_DATABASE` dari sana. Gunakan
   port yang diberikan Aiven, bukan otomatis `3306`.
3. Unduh **CA Certificate** dari halaman layanan Aiven dan simpan sebagai
   `ca.pem` pada direktori proyek. Atau atur `MYSQL_SSL_CA_PATH` ke lokasi
   sertifikat tersebut.
4. Ganti `SESSION_SECRET` dengan nilai acak yang kuat dan simpan rahasia itu
   hanya di `.env.local` atau konfigurasi environment deployment.
5. Atur kredensial login bawaan melalui variabel `ADMIN_*`,
   `HEADMASTER_*`, dan `TEACHER_*`. Jangan gunakan password contoh untuk
   deployment.

`.env.local` dan `ca.pem` memuat konfigurasi sensitif; jangan commit atau
membagikannya.

Untuk menjalankan situs tanpa XAMPP/MySQL lokal, gunakan database Aiven di
atas. Untuk menjalankannya tanpa VS Code atau komputer lokal, deploy aplikasi
ke Vercel (atau hosting Node.js lain), kemudian tambahkan variabel yang sama
dan tambahkan isi penuh CA certificate sebagai secret `MYSQL_SSL_CA` pada
environment deployment. Nilai PEM boleh berupa beberapa baris atau memakai
`\\n` sebagai pemisah baris. Jangan upload `ca.pem` ke Git.
Setelah deploy, buka `/api/test-db` sekali untuk memeriksa koneksi database.

## Menyiapkan skema MySQL

Jalankan `database/schema.sql` pada database yang dipilih. Untuk database yang
sudah berisi tabel akun portal versi sebelumnya, jalankan
`database/migrations/001-student-account-approval.sql` setelahnya. Migrasi ini
idempotent dan menambahkan status verifikasi serta tautan akun siswa ke data
induk.

Endpoint `GET /api/test-db` memeriksa koneksi database. Data akademik perlu
dimasukkan sebelum ringkasan dan laporan menampilkan isi; aplikasi tidak
mengganti data kosong dengan angka contoh.

## Alur penggunaan data

1. Admin membuat data guru dan siswa.
2. Admin mendaftarkan kelas.
3. Admin membuat mata pelajaran dan memilih guru aktif.
4. Admin menyusun jadwal dari kelas, mata pelajaran, dan guru terdaftar.
5. Nilai dan kehadiran dikaitkan dengan siswa dari data induk. Akun siswa hasil
   pendaftaran baru dapat login setelah admin menautkannya ke data induk.
6. Guru hanya dapat melihat dan mencatat nilai/kehadiran untuk kelas serta
   mata pelajaran yang tercantum pada jadwal mengajarnya. Catatan ganda perlu
   diperbarui dari data yang sudah ada.

Ekspor laporan saat ini berisi seluruh data yang tersimpan; model periode atau
semester akademik belum tersedia. Data pembayaran, pengumuman resmi, agenda
acara/QR, poin karakter, dan konfigurasi tahun ajaran belum mempunyai model
data dalam aplikasi.

## Pemeriksaan

```bash
npm run lint
npx tsc --noEmit
npm run build
```

# Toko Online

Aplikasi toko online sederhana: pengunjung melihat katalog, pembeli memesan dan mengunggah bukti transfer, admin mengelola produk, pesanan, dan isi toko.

Cocok untuk belajar fullstack maupun untuk dijalankan di komputer sendiri. Backend memakai **Express + MySQL**. Tampilan memakai **React + Vite**.

| Bagian | Alamat setelah dijalankan |
|--------|---------------------------|
| Toko (browser) | http://localhost:5173 |
| API | http://localhost:5000 |

---

## Yang bisa dilakukan

**Pengunjung** (tanpa login)

- Melihat beranda, katalog, dan hasil pencarian produk
- Membuka detail produk dan artikel
- Mengirim pesan lewat formulir kontak

**Pembeli** (setelah daftar)

- Login, belanja, dan checkout
- Melihat rekening tujuan transfer lalu mengunggah bukti pembayaran
- Melihat struk dan riwayat pesanan
- Mengubah profil

**Admin**

- Melihat ringkasan toko
- Mengelola produk (termasuk stok dan status aktif)
- Mengelola kategori, kurir, dan rekening bank
- Memeriksa pesanan dan bukti transfer, lalu mengubah status
- Mengunduh laporan, mengelola artikel, pesan kontak, dan info toko

---

## Yang perlu dipasang dulu

1. [Node.js](https://nodejs.org/) versi LTS (disarankan 20 atau lebih baru)
2. MySQL atau MariaDB. Di Windows, [Laragon](https://laragon.org/) atau [XAMPP](https://www.apachefriends.org/) sudah cukup
3. Git

Cek pemasangan:

```bash
node -v
npm -v
```

---

## Cara menjalankan

Gunakan **dua terminal**. Terminal pertama untuk API, terminal kedua untuk tampilan web. Keduanya harus tetap hidup saat toko dipakai.

### 1. Ambil kode

```bash
git clone https://github.com/pcintav/toko.git
cd toko
```

### 2. Buat database

1. Nyalakan MySQL (lewat Laragon atau XAMPP).
2. Buka phpMyAdmin, biasanya di http://localhost/phpmyadmin.
3. Buat database baru bernama **`toko_online`**. Pilih collation `utf8mb4_general_ci`.
4. Pilih database itu, lalu impor file berikut **berurutan**:

| Urutan | File | Isi |
|--------|------|-----|
| 1 | `backend/database/schema-latihan-toko.sql` | Tabel, kategori, kurir, bank, dan info toko awal |
| 2 | `backend/database/seed-admin.sql` | Akun admin |
| 3 | `backend/database/seed-lengkapi-toko-online.sql` | Opsional. Produk dan artikel contoh |

Lewat terminal MySQL (dari folder proyek):

```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS toko_online CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;"
mysql -u root -p toko_online < backend/database/schema-latihan-toko.sql
mysql -u root -p toko_online < backend/database/seed-admin.sql
mysql -u root -p toko_online < backend/database/seed-lengkapi-toko-online.sql
```

Jika MySQL lokal tidak memakai password, hilangkan `-p`.

Nama database harus sama dengan `DB_NAME` di `backend/.env` (bawaan: `toko_online`).

### 3. Jalankan backend

**PowerShell**

```powershell
cd backend
Copy-Item .env.example .env
npm install
npm run dev
```

**CMD atau macOS / Linux**

```bash
cd backend
copy .env.example .env
npm install
npm run dev
```

Di macOS / Linux, ganti `copy` dengan `cp .env.example .env`.

Buka `backend/.env` jika user atau password MySQL berbeda dari bawaan (`root` tanpa password):

```env
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=toko_online
PORT=5000
JWT_SECRET=ganti_dengan_string_panjang_acak
```

Ganti `JWT_SECRET` dengan teks acak yang panjang sebelum toko dipakai di luar latihan.

API siap jika terminal menampilkan `Server jalan di port 5000`. Buka http://localhost:5000 — halaman itu menampilkan tulisan **API jalan**.

### 4. Jalankan frontend

Buka terminal **baru**, kembali ke folder proyek.

**PowerShell**

```powershell
cd frontend
Copy-Item .env.example .env.development
npm install
npm run dev
```

**CMD atau macOS / Linux**

```bash
cd frontend
copy .env.example .env.development
npm install
npm run dev
```

Di macOS / Linux: `cp .env.example .env.development`.

Isi `frontend/.env.development`:

```env
VITE_API_URL=http://localhost:5000
```

Buka http://localhost:5173.

---

## Akun untuk mencoba

| Peran | Login | Password |
|-------|--------|----------|
| Admin | `admin@toko.local` atau `admintoko` | `Admin123!` |

Akun pembeli dibuat sendiri di http://localhost:5173/daftar.

Login admin dan pembeli memakai halaman yang sama: http://localhost:5173/login. Setelah masuk, admin diarahkan ke `/admin`, pembeli ke `/akun`.

Password admin di atas hanya untuk latihan. Ganti sebelum toko dibuka untuk orang lain.

---

## Alur pemakaian singkat

1. Buka beranda, cari produk, lalu buka detailnya.
2. Daftar sebagai pembeli, lalu klik **Beli**.
3. Selesaikan checkout. Catat rekening yang tampil, lalu unggah foto bukti transfer.
4. Keluar, lalu masuk sebagai admin.
5. Buka **Pesanan**, lihat bukti, dan ubah status pesanan.
6. Buka **Produk** untuk menambah barang, mengatur stok, atau menonaktifkan produk. Produk nonaktif tidak muncul di katalog.

Halaman utama:

| URL | Untuk siapa |
|-----|-------------|
| `/` | Beranda |
| `/toko` | Katalog |
| `/produk/:id` | Detail produk |
| `/artikel` | Daftar artikel |
| `/login` | Masuk |
| `/daftar` | Daftar pembeli |
| `/akun` | Panel pembeli |
| `/admin` | Panel admin |

---

## Jika database sudah pernah dipakai

Skema baru menambah master kategori, kurir, bank, bukti transfer, stok, dan status aktif produk. Dari folder `backend`:

```bash
npm run db:migrate-foto-bukti
npm run db:migrate-stok-aktif
npm run db:migrate-bank-atas-nama
npm run db:seed-demo
```

`db:seed-demo` mengisi produk, artikel, dan info toko contoh. Aman dijalankan ulang.

File SQL migrasi ada di `backend/database/` jika lebih nyaman diimpor lewat phpMyAdmin.

---

## Struktur folder

```
toko/
├── backend/                 API Express
│   ├── server.js            Pintu masuk server
│   ├── config/              Koneksi MySQL
│   ├── routes/              URL API
│   ├── controllers/         Aturan bisnis
│   ├── models/              Query database
│   ├── database/            Skema, migrasi, dan seed
│   ├── docs/ALUR-CODING.md  Penjelasan alur untuk belajar
│   └── .env.example         Contoh konfigurasi (salin jadi .env)
├── frontend/                Tampilan React
│   └── src/
│       ├── pages/           Halaman publik, admin, dan pembeli
│       ├── api/             Pemanggilan API
│       └── components/
├── CONTRIBUTING.md
└── LICENSE
```

---

## Masalah yang sering muncul

**Halaman toko memuat terus atau muncul *Failed to fetch***  
Backend belum jalan, atau `VITE_API_URL` tidak mengarah ke http://localhost:5000. Nyalakan `npm run dev` di folder `backend`, lalu muat ulang browser.

**MySQL menolak koneksi (`Access denied` atau `ECONNREFUSED`)**  
Pastikan MySQL sudah nyala. Samakan `DB_USER` dan `DB_PASS` di `backend/.env` dengan akun MySQL di komputer Anda.

**`Unknown database 'toko_online'`**  
Database belum dibuat, atau namanya tidak sama dengan `DB_NAME`. Buat database lalu impor skema.

**Login admin gagal**  
File `backend/database/seed-admin.sql` belum diimpor, atau password sudah diganti.

**Port 5000 atau 5173 sudah terpakai**  
Ubah `PORT` di `backend/.env`, samakan `VITE_API_URL` di `frontend/.env.development`, lalu jalankan ulang kedua aplikasi.

---

## Build untuk dipakai di server

```bash
cd frontend
npm run build
```

Sebelum build, buat `frontend/.env.production` berisi URL API yang sebenarnya, misalnya:

```env
VITE_API_URL=https://api.domain-anda.com
```

Hasil build ada di `frontend/dist`. Di server, jalankan backend dengan `npm start` (bukan `npm run dev`), ganti `JWT_SECRET`, dan jangan mengunggah file `.env`.

---

## Untuk yang ingin memahami kodenya

Baca [backend/docs/ALUR-CODING.md](backend/docs/ALUR-CODING.md). Dokumen itu menjelaskan perjalanan data dari halaman React sampai query MySQL.

Kontribusi: [CONTRIBUTING.md](CONTRIBUTING.md).

## Lisensi

[MIT](LICENSE). Bebas dipakai untuk belajar dan dimodifikasi.

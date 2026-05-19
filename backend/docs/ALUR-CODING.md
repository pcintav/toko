# Panduan alur coding — Toko Mango (fullstack SMK)

Dokumen ini membantu siswa memahami **bagaimana frontend admin dan backend API bekerja bersama**, lalu **alur sistem**, **alur coding**, dan **alur folder/file**.

**Cara pakai:** baca bagian **1 → 2 → 3 → 4** berurutan. Bagian 5–8 adalah referensi (endpoint, SQL, upload).

---

## 0. Gambaran project (dua folder utama)

```
e:\testfullstack\          ← folder project (buka di VS Code / Cursor)
├── backend/               ← API Express + MySQL  → http://localhost:5000
└── frontend/              ← React + Vite         → http://localhost:5173
```

| Yang dijalankan | Terminal | Perintah | URL |
|-----------------|----------|----------|-----|
| **API** | 1 | `cd backend` lalu `npm run dev` | `:5000` |
| **Web** | 2 | `cd frontend` lalu `npm run dev` | `:5173` |

Jalankan **kedua terminal** — web butuh API sudah hidup dulu.

**Penting:** panel admin di browser **tidak bisa** mengambil data jika backend mati — akan muncul error seperti *Failed to fetch* atau loading terus.

---

## 1. Frontend ↔ Backend — panel admin (baca ini dulu)

### 1.1 Dua “aplikasi” terpisah

| Lapisan | Teknologi | Tugas |
|---------|-----------|--------|
| **Frontend** | React (Vite) | Tampilan halaman, form, tabel, modal |
| **Backend** | Express + MySQL | Simpan/baca data, cek login, kirim **JSON** |

Browser hanya menampilkan React. React **memanggil** API lewat `fetch` ke `http://localhost:5000`.

### 1.2 Login admin — dari tombol sampai data muncul

```
[Siswa buka http://localhost:5173/login]
        │
        ▼
LoginPage.jsx  →  POST http://localhost:5000/api/users/login
        │              body: { email, passwd }
        ▼
usersController (backend)  →  cek password  →  JWT + role: "admin"
        │
        ▼
AuthContext.jsx  menyimpan token di localStorage
        │
        ▼
Navigate ke /admin  →  RequireAuth cek role === "admin"
        │
        ▼
AdminLayout (sidebar + konten)
```

- **Satu login** dipakai admin dan pembeli (`/api/users/login`).
- **Perbedaan akses** ada di field **`role`** di JWT: `"admin"` vs `"pembeli"`.
- Route `/admin/*` hanya boleh dibuka jika `role === "admin"`.

### 1.3 Satu halaman admin = satu “layar” React + banyak endpoint API

Contoh halaman **Produk** (`/admin/produk`):

| Di browser (frontend) | Di server (backend) |
|----------------------|-------------------|
| `AdminProdukPage.jsx` — tabel + tombol Tambah / Detail / Ubah / Hapus | `GET /api/admin/produk` — daftar |
| Klik **Detail** → modal | `GET /api/admin/produk/:id` |
| Klik **Ubah** → form modal | `PUT /api/admin/produk/:id` |
| Klik **Hapus** → konfirmasi | `DELETE /api/admin/produk/:id` |
| Tombol **Tambah** | `POST /api/admin/produk` |
| Upload gambar produk | `POST /api/admin/upload-gambar` → path disimpan di kolom `gambar` |

**Semua** request admin memakai header:

```
Authorization: Bearer <token dari localStorage>
```

Itu diatur di `frontend/src/api/http.js` (`authHeaders()`).

### 1.4 Peta URL frontend admin ↔ API backend

| Menu / halaman (React) | File halaman | Fungsi utama API (`/api/admin/...`) |
|------------------------|--------------|-------------------------------------|
| Dashboard | `AdminOverviewPage.jsx` | `GET /stats` |
| Produk | `AdminProdukPage.jsx` | CRUD `/produk`, upload gambar |
| Pembeli | `AdminPembeliPage.jsx` | `GET /pembeli`, CRUD `/users/:id` |
| Pesanan | `AdminPembelianPage.jsx` | `GET/PUT/DELETE /pembelian` |
| Artikel | `AdminArtikelPage.jsx` | CRUD `/artikel` |
| Kontak | `AdminKontakPage.jsx` | `GET/PUT/DELETE /kontak` |
| Info toko | `AdminInfoTokoPage.jsx` | `GET/PUT /info-toko` |
| Profil | `AdminProfilPage.jsx` | `GET/PUT /me` |

Routing React ada di `frontend/src/App.jsx`. Pemanggilan API terpusat di `frontend/src/api/adminApi.js`.

### 1.4b Beranda, detail produk/artikel, tombol Beli

| Halaman (React) | File | API publik (`/api/users/...`) |
|-----------------|------|-------------------------------|
| Beranda | `HomePage.jsx` | `GET /produk`, `/artikel`, `/info-toko` |
| Detail produk | `ProductDetailPage.jsx` → `/produk/:id` | `GET /produk/:id_produk` |
| Detail artikel | `ArtikelDetailPage.jsx` → `/artikel/:id` | `GET /artikel/:id` |
| Kartu produk | `ProductCard.jsx` | Tombol **Beli** → login (jika perlu) → `/akun/belanja?produk=<id>` |

**Alur Beli dari beranda:** pengunjung klik **Beli** → `LoginPage` (state `from`) → setelah login pembeli → `PembeliBelanjaPage` membuka modal checkout otomatis dari query `?produk=`.

Pemanggilan API publik: `frontend/src/api/client.js`.

### 1.4c Panel pembeli (`/akun/*`)

| Menu | File halaman | API (`/api/users/...`) |
|------|--------------|------------------------|
| Dashboard | `PembeliOverviewPage.jsx` | `GET /dashboard` |
| Belanja | `PembeliBelanjaPage.jsx` | `GET /produk`, `POST /pembelian` |
| Pesanan | `PembeliPesananPage.jsx` | `GET /pembelian`, `GET /pembelian/:id` |
| Profil | `PembeliProfilPage.jsx` | `GET/PUT /me`, upload gambar |

Layout: `PembeliLayout.jsx` + `PembeliSidebar.jsx`. API: `frontend/src/api/pembeliApi.js`.

### 1.5 Komponen frontend yang dipakai ulang (admin)

| File | Fungsi |
|------|--------|
| `layouts/AdminLayout.jsx` | Sidebar + area konten |
| `components/admin/AdminSidebar.jsx` | Menu navigasi |
| `context/AdminShopContext.jsx` | Logo + nama toko di sidebar (dari DB) |
| `components/admin/AdminRowActions.jsx` | Tombol **Detail · Ubah · Hapus** per baris |
| `components/admin/AdminDetailModal.jsx` | Modal baca saja (detail) |
| `components/admin/AdminModal.jsx` | Modal form tambah/ubah |
| `hooks/useAdminList.js` | Ambil daftar + loading/error |
| `hooks/useAdminGuard.js` | Redirect jika token habis / bukan admin |

**Alur kode di satu halaman CRUD (misalnya Kontak):**

1. `useAdminList(adminApi.getKontak)` → tampilkan tabel.
2. **Detail** → `adminApi.getKontakById(id)` → isi `AdminDetailModal`.
3. **Ubah** → buka `AdminModal` + `updateKontak`.
4. **Hapus** → `deleteKontak` + `reload()`.

---

## 2. Alur sistem (besar — siapa ngapain)

### 2.1 Diagram umum fullstack

```
┌─────────────┐     HTTP (JSON)      ┌─────────────┐     SQL      ┌──────────┐
│   Browser   │ ◄──────────────────► │   Backend   │ ◄──────────► │  MySQL   │
│  React Vite │   localhost:5000     │   Express   │              │ toko DB  │
│    :5173    │                      │             │              │          │
└─────────────┘                      └─────────────┘              └──────────┘
```

### 2.2 Tiga “pengguna” sistem

| Pengguna | Frontend (contoh) | Backend prefix | Keterangan |
|----------|-------------------|----------------|------------|
| **Pengunjung** | `/` (HomePage) | `GET /api/users/produk`, artikel, info-toko | Tanpa login |
| **Pembeli** | `/login`, `/akun` | `POST /api/users/login`, `/me`, `/pembelian` | JWT role `pembeli` |
| **Admin** | `/login` → `/admin/*` | `GET/POST/PUT/DELETE /api/admin/...` | JWT role `admin` |

**Pemisahan penting:**

- `/api/users/...` — toko publik + akun pembeli + pesanan sendiri.
- `/api/admin/...` — kelola **semua** data toko; **wajib** token admin.

Admin **tidak** memakai `GET /api/users/me` untuk profil panel; memakai `GET /api/admin/me`.

### 2.3 Alur admin mengelola toko (urutan kegiatan)

1. Import / buat database (`toko_online.sql` atau `database/schema-latihan-toko.sql`).
2. Pastikan ada user admin (`seed-admin.sql` atau data di dump).
3. Terminal 1: `cd backend` → `npm run dev`. Terminal 2: `cd frontend` → `npm run dev`.
4. Login di `/login` dengan akun admin.
5. Dashboard → lihat ringkasan (`/api/admin/stats`).
6. Kelola master data: produk, pembeli, pesanan, artikel, pesan kontak, info toko.

### 2.4 Alur pembeli

1. Lihat katalog di beranda — **tanpa** login (`GET /api/users/produk`).
2. Klik **Detail** atau **Beli** pada produk → halaman detail atau login lalu checkout.
3. Daftar / login → JWT `pembeli` → panel `/akun`.
4. Checkout → `POST /api/users/pembelian` (`id_pembeli` dari token, **bukan** dari body).
5. Riwayat & profil → menu **Pesanan Saya** / **Profil Saya**.

Detail API: lihat **Bagian 6** di bawah. Peta halaman React: **§1.4c**.

---

## 3. Alur coding (satu request masuk sampai keluar)

### 3.1 Backend — urutan eksekusi (MVC API)

Setiap klik tombol di React yang memanggil API mengikuti alur yang **sama**:

```
Browser / React (fetch)
    → server.js              (Express, CORS, JSON body, static uploads)
    → routes/admin.js        (cocokkan URL + method)
    → middlewares/           (authenticate + requireRole("admin"))
    → controllers/           (validasi, aturan bisnis, status HTTP)
    → models/                (query SQL)
    → config/db.js           (pool MySQL)
    → respons JSON balik ke React
```

**Kenapa urutannya begitu?** Supaya tanggung jawab jelas: route = peta URL, controller = logika, model = data. Ganti database nanti cukup sentuh `models/`, bukan semua file.

### 3.2 Frontend admin — urutan eksekusi

```
AdminProdukPage.jsx (atau halaman lain)
    → adminApi.getProduk()     (adminApi.js)
    → http.js apiRequest()     (tambah Bearer token, base URL)
    → fetch → backend
    → setState(rows) → render tabel
    → AdminRowActions → modal Detail / Ubah / Hapus
```

Konfigurasi URL API: `frontend/.env.development` → `VITE_API_URL=http://localhost:5000`.

### 3.3 Contoh konkret: admin klik “Hapus produk”

| Langkah | Lapisan | Apa yang terjadi |
|--------|---------|------------------|
| 1 | UI | `onDelete(id)` + `window.confirm` |
| 2 | `adminApi.js` | `DELETE /api/admin/produk/5` + header Bearer |
| 3 | `routes/admin.js` | Route ke `adminController.deleteProduk` |
| 4 | Middleware | Cek JWT + `role === admin` |
| 5 | Controller | Validasi id, panggil model |
| 6 | Model | `DELETE FROM produk WHERE id_produk = ?` |
| 7 | UI | `reload()` — panggil `getProduk` lagi |

---

## 4. Alur folder & file (mulai baca dari mana)

### 4.1 Pohon folder backend (prioritas baca)

```
backend/
├── server.js                 ← ① PINTU MASUK: pasang route, listen port
├── .env                      ← ② PORT, JWT_SECRET, DB_*
├── config/
│   └── db.js                 ← ③ pool koneksi MySQL
├── routes/
│   ├── users.js              ← ④ publik + pembeli
│   └── admin.js              ← ⑤ semua /api/admin (wajib token admin)
├── middlewares/
│   ├── authMiddleware.js     ← ⑥ baca JWT → req.user
│   ├── roleMiddleware.js     ← ⑦ requireRole("admin"|"pembeli")
│   └── uploadGambar.js       ← multipart upload
├── controllers/
│   ├── usersController.js    ← register, login, profil /me
│   ├── pembeliController.js  ← katalog, pesanan pembeli
│   ├── pesanController.js    ← formulir kontak publik
│   ├── adminController.js    ← CRUD panel admin
│   └── uploadController.js   ← respons path file upload
├── models/
│   ├── usersModel.js
│   ├── produkModel.js
│   ├── pembelianModel.js
│   ├── artikelModel.js
│   ├── kontakModel.js
│   ├── infoTokoModel.js
│   ├── statsModel.js
│   └── pesanModel.js         ← insert kontak dari pengunjung
├── uploads/images/           ← file gambar hasil upload
├── toko_online.sql           ← dump DB acuan
└── database/                 ← skema baru, migrasi, seed
```

### 4.2 Pohon folder frontend (prioritas baca — admin)

```
frontend/src/
├── main.jsx                  ← ① render App
├── App.jsx                   ← ② routing: /, /login, /admin/*
├── context/
│   ├── AuthContext.jsx       ← ③ login, token, role
│   └── AdminShopContext.jsx  ← nama/logo toko di sidebar
├── api/
│   ├── http.js               ← ④ base URL + Bearer + error
│   └── adminApi.js           ← ⑤ semua fungsi panggil /api/admin
├── layouts/
│   └── AdminLayout.jsx       ← ⑥ kerangka panel admin
├── pages/admin/
│   ├── AdminOverviewPage.jsx
│   ├── AdminProdukPage.jsx
│   ├── AdminPembeliPage.jsx
│   ├── AdminPembelianPage.jsx
│   ├── AdminArtikelPage.jsx
│   ├── AdminKontakPage.jsx
│   ├── AdminInfoTokoPage.jsx
│   └── AdminProfilPage.jsx
├── hooks/
│   ├── useAdminList.js
│   └── useAdminGuard.js
└── components/admin/         ← modal, tabel aksi, upload, dll.
```

### 4.3 Urutan belajar yang disarankan (siswa)

| Urutan | Baca / kerjakan | Kenapa |
|--------|-----------------|--------|
| 1 | Jalankan backend + frontend (`npm run dev` di masing-masing folder) + login admin + menu `/admin` | Pahami **hasil** dulu |
| 2 | `frontend/src/App.jsx` + satu halaman `AdminProdukPage.jsx` | Hubungkan URL browser ↔ API |
| 3 | `frontend/src/api/adminApi.js` + `http.js` | Cara React memanggil backend |
| 4 | `backend/routes/admin.js` | Daftar endpoint admin |
| 5 | `backend/controllers/adminController.js` | Logika setelah request masuk |
| 6 | `backend/models/produkModel.js` (contoh) | SQL & struktur tabel |
| 7 | `backend/server.js` + `middlewares/authMiddleware.js` | Bagaimana server “menyambungkan” semuanya |
| 8 | Postman — uji endpoint tanpa React | Latihan API murni |

### 4.4 Peran folder vs MVC

| Folder backend | Peran | Catatan |
|----------------|-------|---------|
| `routes/` | Routing | URL → middleware → controller |
| `controllers/` | Controller | Validasi + JSON response |
| `models/` | Model | SQL dengan parameter `?` |
| `middlewares/` | Filter | Auth, role, upload |
| `config/` | Infrastruktur | Bukan aturan bisnis toko |

**View HTML tidak ada** di API ini — “tampilan” admin ada di **React**, backend hanya **JSON**.

---

## 5. Ringkasan endpoint `/api/admin` (referensi)

Semua route di bawah **`router.use(authenticate, requireRole("admin"))`** di `routes/admin.js`.

| Method | Path | Fungsi |
|--------|------|--------|
| GET | `/me` | Profil admin login |
| PUT | `/me` | Ubah profil admin |
| GET | `/stats` | Angka dashboard (jumlah produk, pesanan, dll.) |
| GET | `/pembeli` | Daftar pembeli (ringkas) |
| GET | `/users` | Daftar user (`?role=pembeli`) |
| POST | `/users` | Tambah akun pembeli |
| GET | `/users/:id` | Detail pembeli |
| PUT | `/users/:id` | Ubah pembeli |
| DELETE | `/users/:id` | Hapus pembeli |
| GET/POST | `/produk` | Daftar / tambah produk |
| GET/PUT/DELETE | `/produk/:id_produk` | Detail / ubah / hapus |
| GET | `/pembelian` | Semua pesanan |
| GET/PUT/DELETE | `/pembelian/:id` | Detail / ubah status / hapus |
| GET/POST | `/artikel` | Daftar / tambah artikel |
| GET/PUT/DELETE | `/artikel/:id` | Detail / ubah / hapus |
| GET | `/kontak` | Daftar pesan kontak |
| GET/PUT/DELETE | `/kontak/:id` | Detail / ubah / hapus pesan |
| GET/PUT | `/info-toko` | Baca / ubah data toko (logo, alamat, dll.) |
| POST | `/upload-gambar` | Upload file (field `gambar`) → `data.path` |

---

## 6. Alur belanja pembeli (API `/api/users`)

| Langkah | Endpoint | Auth |
|---------|----------|------|
| Lihat katalog | `GET /produk`, `GET /produk/:id_produk` | Tidak |
| Info toko & artikel | `GET /info-toko`, `GET /artikel` | Tidak |
| Daftar / login | `POST /register`, `POST /login` | Tidak |
| Form kontak pengunjung | `POST /contact` | Tidak |
| Profil | `GET/PUT /me` | Bearer pembeli |
| Buat pesanan | `POST /pembelian` | Bearer pembeli |
| Riwayat | `GET /pembelian`, `GET /pembelian/:id` | Bearer pembeli |

**Keamanan pesanan:** `id_pembeli` diambil dari **`req.user.id`** (JWT), bukan dari body — pembeli tidak bisa memesan atas nama orang lain.

**File terkait:** `routes/users.js` → `pembeliController.js` → `pembelianModel.js`, `produkModel.js`, dll.

---

## 7. File SQL & database

| File | Fungsi |
|------|--------|
| `toko_online.sql` | Dump database acuan (phpMyAdmin) |
| `database/schema-latihan-toko.sql` | Buat tabel dari nol |
| `seed-admin.sql` | User admin jika belum ada |
| `seed-lengkapi-toko-online.sql` | Contoh produk/artikel/info toko |
| `database/alter-database-yang-sudah-ada.sql` | Selaraskan DB lama |
| `scripts/migrate-foto-bukti.js` | Tambah kolom `pembelian.foto_bukti` (`npm run db:migrate-foto-bukti`) |

---

## 8. Upload gambar

| Topik | Nilai |
|-------|--------|
| Folder penyimpanan | `backend/uploads/images/` |
| Akses file | `http://localhost:5000/uploads/images/<namafile>` |
| Admin upload | `POST /api/admin/upload-gambar` (Bearer admin, field `gambar`) |
| Pembeli upload | `POST /api/users/upload-gambar` (profil / bukti bayar) |
| Aturan | JPEG/PNG/GIF/WebP, maks 5 MB |
| Path di JSON | Bentuk `/uploads/images/...` |

---

## 9. Ringkasan satu kalimat

**Panel admin:** React di `:5173` menampilkan halaman `/admin/*` dan memanggil JSON API di `:5000/api/admin/*` dengan token JWT admin.

**Backend:** setiap request mengalir `server.js` → `routes` → `middlewares` → `controllers` → `models` → MySQL, lalu balik sebagai JSON ke React.

---

**Versi halaman (tanpa audit):** buka `backend/docs/materi-alur-backend.html` di browser — isi paralel untuk presentasi kelas.

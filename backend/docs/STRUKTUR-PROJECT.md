# Struktur Project — Toko Mango (Fullstack SMK)

Dokumen ini memetakan **seluruh folder dan file** project latihan, membedakan yang **bawaan** vs **dibuat sendiri**, file bawaan yang **perlu diedit**, serta **alur komunikasi** antar bagian.

**Cara menjalankan (2 terminal):**

| Terminal | Folder | Perintah | URL |
|----------|--------|----------|-----|
| 1 | `backend/` | `npm run dev` | http://localhost:5000 |
| 2 | `frontend/` | `npm run dev` | http://localhost:5173 |

---

## Legenda

| Simbol | Arti |
|--------|------|
| **[B]** | Bawaan — dari `npm create vite`, `npm init`, atau tool instalasi |
| **[BUAT]** | Dibuat sendiri — untuk kebutuhan latihan Toko Mango |
| **[EDIT]** | File bawaan yang **wajib/diperlukan diedit** agar project jalan |
| **[OPS]** | Operasional — dihasilkan otomatis atau isinya dari penggunaan (upload, build) |
| **[DOC]** | Dokumentasi / materi belajar |

---

## Tree folder & file (tanpa `node_modules` dan `dist`)

```
testfullstack/                          ← folder project (buka di VS Code / Cursor)
│
├── STRUKTUR-PROJECT.md                 [BUAT][DOC]  ← file ini
│
├── backend/                            [BUAT] folder utama API (Express + MySQL)
│   ├── server.js                       [BUAT][EDIT]  pintu masuk API — daftarkan route, CORS, static uploads
│   ├── package.json                    [B][EDIT]     dependensi: express, mysql2, bcrypt, jwt, multer, cors, dotenv
│   ├── package-lock.json               [B][OPS]
│   ├── .env                            [BUAT][EDIT]   rahasia: PORT, DB_*, JWT_SECRET (jangan di-commit)
│   ├── ALUR-CODING.md                  [BUAT][DOC]    panduan alur coding backend + frontend admin
│   │
│   ├── config/
│   │   └── db.js                       [BUAT]          pool koneksi MySQL (mysql2)
│   │
│   ├── routes/
│   │   ├── users.js                    [BUAT]          /api/users — publik, pembeli, login, register
│   │   └── admin.js                    [BUAT]          /api/admin — semua endpoint panel admin (wajib JWT admin)
│   │
│   ├── controllers/
│   │   ├── usersController.js          [BUAT]          register, login, profil /me
│   │   ├── pembeliController.js        [BUAT]          katalog publik, dashboard & pesanan pembeli
│   │   ├── adminController.js          [BUAT]          CRUD admin: produk, artikel, pembeli, pesanan, info toko
│   │   ├── pesanController.js          [BUAT]          form kontak beranda → tabel kontak
│   │   └── uploadController.js         [BUAT]          respons JSON setelah upload gambar
│   │
│   ├── models/
│   │   ├── usersModel.js               [BUAT]          query tabel users
│   │   ├── produkModel.js              [BUAT]          query tabel produk
│   │   ├── artikelModel.js             [BUAT]          query tabel artikel
│   │   ├── pembelianModel.js           [BUAT]          query tabel pembelian / pesanan
│   │   ├── kontakModel.js              [BUAT]          query tabel kontak
│   │   ├── infoTokoModel.js            [BUAT]          query tabel info_toko (satu baris)
│   │   ├── pesanModel.js               [BUAT]          (jika dipakai terpisah dari kontak)
│   │   └── statsModel.js               [BUAT]          agregat untuk dashboard admin
│   │
│   ├── middlewares/
│   │   ├── authMiddleware.js           [BUAT]          verifikasi JWT → req.user
│   │   ├── roleMiddleware.js           [BUAT]          cek role admin / pembeli
│   │   └── uploadGambar.js             [BUAT]          multer → simpan ke uploads/images/
│   │
│   ├── utils/
│   │   └── kelamin.js                  [BUAT]          normalisasi nilai kelamin
│   │
│   ├── database/                       [BUAT]          skrip SQL latihan
│   │   ├── schema-latihan-toko.sql     [BUAT]          CREATE TABLE + data awal
│   │   ├── toko_online.sql             [BUAT]          dump lengkap (alternatif import)
│   │   ├── seed-admin.sql              [BUAT]          user admin contoh
│   │   ├── seed-lengkapi-toko-online.sql
│   │   ├── contoh-database.sql         [DOC]
│   │   ├── schema-latihan-toko.dbml    [DOC]
│   │   ├── migration-info-toko-tentang-banner.sql
│   │   └── migration-pembelian-foto-bukti.sql
│   │
│   ├── scripts/
│   │   └── migrate-foto-bukti.js       [BUAT]          migrasi kolom opsional (jalan manual)
│   │
│   ├── docs/
│   │   └── materi-alur-backend.html    [BUAT][DOC]    versi HTML dari ALUR-CODING
│   │
│   └── uploads/
│       └── images/                     [BUAT][OPS]      file gambar hasil upload
│           ├── .gitignore              [BUAT]            abaikan isi gambar di git
│           └── *.jpg / *.png           [OPS]             file nyata dari unggahan admin/pembeli
│
└── frontend/                           [B] folder utama React + Vite
    ├── index.html                      [B][EDIT]         judul & meta Toko Mango
    ├── vite.config.js                  [B][EDIT]         port 5173, plugin React
    ├── package.json                    [B][EDIT]         dependensi: react, react-router-dom, bootstrap
    ├── package-lock.json               [B][OPS]
    ├── eslint.config.js                [B]               aturan ESLint (boleh tidak disentuh)
    ├── README.md                       [B]               readme default Vite (opsional diperbarui)
    ├── .gitignore                      [B]
    ├── .env.development                [BUAT][EDIT]      VITE_API_URL=http://localhost:5000
    │
    ├── public/                         [B] folder aset statis (tidak lewat bundler)
    │   ├── favicon.svg                 [B][EDIT]         ikon tab browser
    │   ├── icons.svg                   [BUAT]            ikon tambahan (jika dipakai)
    │   └── placeholder.png             [BUAT]            gambar default saat belum ada upload
    │
    ├── dist/                           [OPS]             hasil `npm run build` (boleh diabaikan saat belajar)
    │
    └── src/
        ├── main.jsx                    [B][EDIT]         mount React + import Bootstrap + index.css
        ├── App.jsx                     [B][EDIT]         AuthProvider + BrowserRouter (kerangka aplikasi)
        ├── index.css                   [B][EDIT]         gaya global + panel admin/pembeli + beranda
        │
        ├── api/                        [BUAT]            layer HTTP ke backend
        │   ├── http.js                 [BUAT]            fetch dasar, token, pesan error
        │   ├── client.js               [BUAT]            API publik (produk, artikel, login, register)
        │   ├── adminApi.js             [BUAT]            API /api/admin/*
        │   └── pembeliApi.js           [BUAT]            API /api/users/* (pembeli login)
        │
        ├── context/
        │   ├── AuthContext.jsx         [BUAT]            token, role, login/logout (localStorage)
        │   └── AdminShopContext.jsx    [BUAT]            cache info toko untuk sidebar admin
        │
        ├── hooks/
        │   ├── useBerandaData.js       [BUAT]            data beranda (produk, artikel, info)
        │   ├── useAdminGuard.js        [BUAT]            redirect jika bukan admin
        │   ├── useAdminList.js         [BUAT]            pola load list CRUD admin
        │   ├── usePembeliGuard.js     [BUAT]            redirect jika bukan pembeli
        │   └── usePembeliList.js       [BUAT]            pola load list area pembeli
        │
        ├── layouts/
        │   ├── AdminLayout.jsx         [BUAT]            sidebar + topbar + `<Outlet />` admin
        │   └── PembeliLayout.jsx       [BUAT]            sidebar + topbar + `<Outlet />` pembeli
        │
        ├── pages/
        │   ├── HomePage.jsx            [BUAT]            beranda /
        │   ├── TokoPage.jsx            [BUAT]            katalog semua produk /toko
        │   ├── ArtikelListPage.jsx     [BUAT]            daftar artikel /artikel
        │   ├── ProductDetailPage.jsx   [BUAT]            detail produk /produk/:id
        │   ├── ArtikelDetailPage.jsx   [BUAT]            detail artikel /artikel/:id
        │   ├── LoginPage.jsx           [BUAT]            /login
        │   ├── RegisterPage.jsx        [BUAT]            /daftar
        │   │
        │   ├── admin/                  [BUAT]            halaman panel admin
        │   │   ├── AdminOverviewPage.jsx
        │   │   ├── AdminProdukPage.jsx
        │   │   ├── AdminPembeliPage.jsx
        │   │   ├── AdminPembelianPage.jsx
        │   │   ├── AdminArtikelPage.jsx
        │   │   ├── AdminKontakPage.jsx
        │   │   ├── AdminInfoTokoPage.jsx
        │   │   └── AdminProfilPage.jsx
        │   │
        │   └── pembeli/                [BUAT]            halaman panel pembeli
        │       ├── PembeliOverviewPage.jsx
        │       ├── PembeliBelanjaPage.jsx
        │       ├── PembeliPesananPage.jsx
        │       └── PembeliProfilPage.jsx
        │
        ├── components/
        │   ├── layout/
        │   │   ├── Header.jsx          [BUAT]            navbar beranda & halaman publik
        │   │   └── SiteBottomBar.jsx   [BUAT]            footer navigasi
        │   ├── home/                   [BUAT]            section beranda
        │   │   ├── HeroSection.jsx
        │   │   ├── KategoriGrid.jsx
        │   │   ├── ProductCard.jsx
        │   │   ├── BannerMid.jsx
        │   │   ├── ContactSection.jsx
        │   │   ├── NewsletterStrip.jsx
        │   │   ├── PromoKategori.jsx
        │   │   └── TrustBar.jsx
        │   ├── admin/                  [BUAT]            komponen reusable panel admin
        │   │   ├── AdminSidebar.jsx
        │   │   ├── AdminModal.jsx
        │   │   ├── ImageUploadField.jsx
        │   │   ├── PageHeader.jsx
        │   │   └── ...
        │   ├── pembeli/
        │   │   ├── PembeliSidebar.jsx
        │   │   └── BankTransferInfo.jsx
        │   ├── auth/
        │   │   └── RequireAuth.jsx     [BUAT]            lindungi route /admin dan /akun
        │   └── profile/
        │       └── ProfilePasswordFields.jsx
        │
        ├── constants/
        │   ├── publicNav.js            [BUAT]            menu header/footer publik
        │   └── adminEnums.js           [BUAT]            enum kategori produk, kelamin, dll.
        │
        ├── utils/
        │   ├── media.js                [BUAT]            URL gambar + placeholder
        │   ├── format.js               [BUAT]            rupiah, tanggal, jam operasional
        │   ├── kategori.js             [BUAT]            filter kategori produk
        │   ├── beli.js                 [BUAT]            URL belanja / redirect login
        │   ├── profileSubmit.js        [BUAT]            payload ganti password profil
        │   ├── beranda.js              [BUAT]            teks tagline beranda
        │   ├── auth.js                 [BUAT]            helper token (jika ada)
        │   └── kelamin.js              [BUAT]            mirror frontend untuk form
        │
        ├── routes/
        │   └── index.jsx               [BUAT]            semua `<Route>` — peta URL (publik, admin, pembeli)
        │
        ├── services/                   [B]               folder kosong (tidak dipakai)
        │
        └── assets/                     [B]               aset import di kode
            ├── react.svg               [B]               default Vite (boleh tidak dipakai)
            ├── vite.svg                [B]               default Vite (boleh tidak dipakai)
            └── hero.png                [BUAT]            gambar opsional beranda
```

**Tidak ditulis di tree (bawaan npm):**

- `backend/node_modules/` — [B][OPS] paket Node backend  
- `frontend/node_modules/` — [B][OPS] paket Node frontend  
- `frontend/node_modules/.vite/` — [B][OPS] cache dev Vite  

---

## Ringkasan: bawaan vs buat sendiri

### Folder level atas

| Folder | Asal | Keterangan |
|--------|------|------------|
| `backend/` | **[BUAT]** | Seluruh isi API dibuat untuk latihan; tidak dari template Vite |
| `frontend/` | **[B]** kerangka + **[BUAT]** isi `src/` | Kerangka dari `npm create vite@latest`; hampir semua file di `src/` buatan latihan |
| `node_modules/` (di masing-masing) | **[B][OPS]** | Hasil `npm install` |

### File bawaan frontend yang **perlu diedit**

| File | Yang biasanya diubah |
|------|----------------------|
| `index.html` | Judul halaman, meta description |
| `vite.config.js` | Port dev `5173` |
| `package.json` | Tambah `bootstrap`, `react-router-dom` |
| `.env.development` | **[BUAT]** `VITE_API_URL=http://localhost:5000` |
| `src/main.jsx` | Import Bootstrap + `index.css` + `App` |
| `src/App.jsx` | `AuthProvider` + `BrowserRouter` + memanggil `AppRoutes` |
| `src/routes/index.jsx` | **[BUAT]** Semua `<Route>` aplikasi Toko Mango |
| `src/index.css` | Seluruh tampilan custom |

### File bawaan frontend yang **boleh dibiarkan**

| File | Keterangan |
|------|------------|
| `eslint.config.js` | Aturan lint default |
| `README.md` | Dokumentasi Vite |
| `src/assets/react.svg`, `vite.svg` | Logo demo Vite (tidak wajib dipakai) |

### File backend — semuanya **[BUAT]** untuk latihan

Tidak ada scaffold Express otomatis seperti Vite. Yang paling mendekati “bawaan npm”:

| File | Asal |
|------|------|
| `package.json` | **[B]** dari `npm init`, lalu **[EDIT]** isi dependencies & script `dev` |
| `package-lock.json` | **[B][OPS]** |

Semua file `.js` di `config/`, `routes/`, `controllers/`, `models/`, `middlewares/` adalah **[BUAT]**.

---

## Alur komunikasi antar folder & file

### 1. Gambaran besar (dua aplikasi terpisah)

```
Browser (:5173)                    Browser / Postman (:5000)
     │                                      │
     │  fetch JSON + JWT                      │
     └──────────────────────────────────────►│  backend/server.js
                                             │       │
                                             │       ├─► routes/*.js
                                             │       ├─► middlewares/
                                             │       ├─► controllers/
                                             │       ├─► models/
                                             │       └─► config/db.js → MySQL
                                             │
     ◄──────────────────────────────────────┘  JSON + file /uploads/...
```

Frontend **tidak** memanggil MySQL langsung. Semua data lewat **REST API** di `backend/`.

---

### 2. Alur request backend (satu kali panggilan API)

```
HTTP request
    → server.js          (CORS, JSON body, static /uploads)
    → routes/users.js    atau routes/admin.js   (cocokkan path + method)
    → middlewares/       (opsional: JWT, role, multer upload)
    → controllers/       (validasi, aturan bisnis)
    → models/            (SQL SELECT / INSERT / UPDATE / DELETE)
    → config/db.js       (koneksi pool mysql2)
    → MySQL
    ← JSON response ke client
```

**Contoh:** Admin ubah produk  
`AdminProdukPage` → `adminApi.updateProduk()` → `PUT /api/admin/produk/:id` → `admin.js` → `adminController.updateProduk` → `produkModel.updateProduk` → database.

---

### 3. Alur frontend (dari buka halaman sampai tampil data)

```
index.html
    → main.jsx              (render React)
    → App.jsx               (AuthProvider + BrowserRouter)
    → routes/index.jsx      (semua <Route> — AppRoutes)
    → halaman di pages/     (HomePage, TokoPage, AdminProdukPage, …)
    → komponen di components/
    → hooks/ & context/     (state global: auth, data beranda)
    → api/http.js           (fetch + header Authorization)
    → api/client.js | adminApi.js | pembeliApi.js
    → backend API
```

**Contoh:** Beranda menampilkan produk  
`HomePage` → `useBerandaData()` → `api.getProduk()` + `getArtikel()` + `getInfoToko()` → `GET /api/users/produk` dll. → `pembeliController` → model → tampil di `ProductCard`.

---

### 4. Autentikasi (login → request berikutnya)

```
LoginPage
    → api.login()  →  POST /api/users/login
    → usersController.loginUser  →  bcrypt + jwt.sign
    → AuthContext.login(token, role)  →  localStorage "toko_token"

Request berikutnya (admin/pembeli):
    → http.js authHeaders()  →  Header: Authorization: Bearer <token>
    → authMiddleware  →  req.user { id, role }
    → roleMiddleware("admin" | "pembeli")
    → controller
```

| Role | Prefix API | Halaman frontend |
|------|------------|------------------|
| Publik | `GET /api/users/produk`, `artikel`, `info-toko` | `/`, `/toko`, `/artikel`, detail |
| Pembeli | `GET/POST /api/users/me`, `pembelian`, `upload-gambar` | `/akun/*` |
| Admin | `GET/POST/PUT/DELETE /api/admin/*` | `/admin/*` |

`RequireAuth.jsx` di `routes/index.jsx` memblokir `/admin` dan `/akun` jika belum login atau role salah.

---

### 5. Upload gambar

```
ImageUploadField (frontend)
    → adminApi.uploadGambar / pembeliApi.uploadGambar
    → POST multipart /api/admin/upload-gambar  atau  /api/users/upload-gambar
    → middlewares/uploadGambar.js  (multer)
    → uploads/images/<file>
    → uploadController  →  JSON { path: "/uploads/images/..." }
    → path disimpan di DB (kolom gambar, foto, logo_toko, …)

Tampil di browser:
    → utils/media.js  →  http://localhost:5000/uploads/images/...  atau  /placeholder.png
```

---

### 6. Peta halaman → file utama

| URL browser | File halaman | API utama |
|-------------|--------------|-----------|
| `/` | `HomePage.jsx` | `client.js` — produk, artikel, info |
| `/toko` | `TokoPage.jsx` | `GET /api/users/produk` |
| `/artikel` | `ArtikelListPage.jsx` | `GET /api/users/artikel` |
| `/produk/:id` | `ProductDetailPage.jsx` | `GET /api/users/produk/:id` |
| `/artikel/:id` | `ArtikelDetailPage.jsx` | `GET /api/users/artikel/:id` |
| `/login`, `/daftar` | `LoginPage`, `RegisterPage` | `POST login`, `register` |
| `/admin/*` | `pages/admin/*` + `AdminLayout` | `adminApi.js` → `/api/admin/*` |
| `/akun/*` | `pages/pembeli/*` + `PembeliLayout` | `pembeliApi.js` → `/api/users/*` |

Menu header: `constants/publicNav.js` → `Header.jsx` + `SiteBottomBar.jsx`.

---

### 7. Database (MySQL) — hubungan dengan kode

| Tabel (SQL di `backend/database/`) | Model | Dipakai untuk |
|-----------------------------------|-------|----------------|
| `users` | `usersModel.js` | login, register, profil, admin kelola pembeli |
| `produk` | `produkModel.js` | katalog toko |
| `artikel` | `artikelModel.js` | blog / artikel |
| `pembelian` | `pembelianModel.js` | pesanan pembeli |
| `kontak` | `kontakModel.js` | pesan form kontak |
| `info_toko` | `infoTokoModel.js` | logo, banner, rekening, sosial media (1 baris) |

Import awal: jalankan `schema-latihan-toko.sql` atau `toko_online.sql` di MySQL, lalu isi `.env` backend.

---

## Urutan belajar file (siswa)

1. `backend/database/schema-latihan-toko.sql` — pahami tabel  
2. `backend/server.js` → `routes/users.js` → `controllers/usersController.js`  
3. `frontend/src/main.jsx` → `App.jsx` → `routes/index.jsx` → `pages/HomePage.jsx`  
4. `frontend/src/api/http.js` → `client.js`  
5. Login: `LoginPage` + `AuthContext` + JWT di backend  
6. Admin: `AdminLayout` → `AdminProdukPage` → `adminApi.js` → `routes/admin.js`  
7. Dokumen lanjutan: `backend/ALUR-CODING.md`

---

## Catatan project

- **Tidak ada** `package.json` di root project — backend dan frontend dijalankan **terpisah** (2 terminal).  
- Folder `frontend/dist/` hanya muncul setelah `npm run build`; untuk latihan cukup `npm run dev`.  
- File gambar di `backend/uploads/images/` adalah hasil upload nyata; jangan commit ke git (sudah ada `.gitignore` di folder tersebut).

---

*Terakhir disesuaikan dengan struktur project Toko Mango fullstack latihan SMK.*

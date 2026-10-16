/**
 * routes/admin.js — daftar URL API untuk panel admin.
 *
 * Semua path di file ini otomatis diawali prefix /api/admin (lihat server.js).
 * Contoh: router.get("/produk") → GET http://localhost:5000/api/admin/produk
 *
 * Alur satu request:
 *   Client (frontend admin + token JWT)
 *     → server.js
 *     → routes/admin.js (file ini)
 *     → middleware authenticate (cek token)
 *     → middleware requireRole("admin") (cek role di token)
 *     → controller (logika bisnis)
 *     → model (query MySQL)
 */

const express = require("express");
// Router mini-app Express: kumpulan route yang diekspor ke server.js
const router = express.Router();

// Controller = fungsi yang menangani req/res setelah URL cocok
const { getMyProfile, updateMyProfile } = require("../controllers/usersController");
const adminController = require("../controllers/adminController");
const masterController = require("../controllers/masterController");
const uploadController = require("../controllers/uploadController");

// Middleware = penjaga sebelum masuk controller
const { authenticate } = require("../middlewares/authMiddleware"); // baca Bearer token → isi req.user
const { requireRole } = require("../middlewares/roleMiddleware"); // pastikan req.user.role === "admin"
const { middlewareUploadGambar } = require("../middlewares/uploadGambar"); // terima file multipart field "gambar"

// ---------------------------------------------------------------------------
// Middleware global untuk SEMUA route di file ini (baris di bawahnya)
// Tanpa token valid + role admin → 401/403, controller tidak dijalankan
// ---------------------------------------------------------------------------
router.use(authenticate, requireRole("admin"));

// ---------------------------------------------------------------------------
// Profil admin yang sedang login (sama modul usersController, beda prefix URL)
// ---------------------------------------------------------------------------
// GET /api/admin/me — ambil data profil admin dari req.user.id (dari JWT)
router.get("/me", getMyProfile);
// PUT /api/admin/me — ubah nama, foto, password, dll.
router.put("/me", updateMyProfile);

// ---------------------------------------------------------------------------
// Dashboard — angka ringkas di halaman /admin
// ---------------------------------------------------------------------------
// GET /api/admin/stats → jumlah pembeli, transaksi, pendapatan, dll.
router.get("/stats", adminController.getStats);

// ---------------------------------------------------------------------------
// Pembeli — daftar khusus role pembeli (shortcut, tanpa filter query)
// ---------------------------------------------------------------------------
// GET /api/admin/pembeli → array user role=pembeli untuk tabel admin
router.get("/pembeli", adminController.listPembeli);

// ---------------------------------------------------------------------------
// Kelola akun user (CRUD pembeli lewat endpoint /users)
// ---------------------------------------------------------------------------
// GET /api/admin/users — daftar user (bisa difilter role di controller)
router.get("/users", adminController.listUsers);
// POST /api/admin/users — buat akun pembeli baru (admin isi form + password)
router.post("/users", adminController.createUser);
// GET /api/admin/users/5 — detail satu user untuk modal edit
router.get("/users/:id", adminController.getUserById);
// PUT /api/admin/users/5 — simpan perubahan data pembeli
router.put("/users/:id", adminController.updatePembeli);
// DELETE /api/admin/users/5 — hapus akun (hati-hati: pesanan terkait bisa blokir)
router.delete("/users/:id", adminController.deleteUser);

// ---------------------------------------------------------------------------
// Produk — CRUD katalog toko
// ---------------------------------------------------------------------------
// GET /api/admin/produk — semua baris tabel produk
router.get("/produk", adminController.listProduk);
// GET /api/admin/produk/3 — satu produk (untuk form edit, path param :id_produk)
router.get("/produk/:id_produk", adminController.getProdukById);
// POST /api/admin/produk — tambah produk (body JSON: nama, harga, gambar path, kategori)
router.post("/produk", adminController.createProduk);
// PUT /api/admin/produk/3 — update penuh satu produk
router.put("/produk/:id_produk", adminController.updateProduk);
// DELETE /api/admin/produk/3 — hapus produk dari database
router.delete("/produk/:id_produk", adminController.deleteProduk);

// ---------------------------------------------------------------------------
// Pesanan (pembelian) — admin kelola status & pembayaran
// ---------------------------------------------------------------------------
// GET /api/admin/pembelian — join produk + user, untuk tabel pesanan
router.get("/pembelian", adminController.listPembelian);
// GET /api/admin/pembelian/12 — detail satu pesanan + gambar produk
router.get("/pembelian/:id", adminController.getPembelianById);
// PUT /api/admin/pembelian/12 — ubah status pengiriman, pembayaran, catatan
router.put("/pembelian/:id", adminController.updatePembelian);
// DELETE /api/admin/pembelian/12 — hapus record pesanan
router.delete("/pembelian/:id", adminController.deletePembelian);

// ---------------------------------------------------------------------------
// Artikel blog — CRUD konten beranda / halaman artikel
// ---------------------------------------------------------------------------
router.get("/artikel", adminController.listArtikel);
router.get("/artikel/:id", adminController.getArtikelById);
router.post("/artikel", adminController.createArtikel);
router.put("/artikel/:id", adminController.updateArtikel);
router.delete("/artikel/:id", adminController.deleteArtikel);

// ---------------------------------------------------------------------------
// Pesan kontak — dari form beranda (tabel kontak)
// ---------------------------------------------------------------------------
router.get("/kontak", adminController.listKontak);
router.get("/kontak/:id", adminController.getKontakById);
router.put("/kontak/:id", adminController.updateKontak);
router.delete("/kontak/:id", adminController.deleteKontak);

// ---------------------------------------------------------------------------
// Master data — kategori, pengiriman (kurir), bank (rekening)
// ---------------------------------------------------------------------------
router.get("/kategori", masterController.listKategori);
router.post("/kategori", masterController.createKategori);
router.put("/kategori/:id", masterController.updateKategori);
router.delete("/kategori/:id", masterController.deleteKategori);

router.get("/pengiriman", masterController.listPengiriman);
router.post("/pengiriman", masterController.createPengiriman);
router.put("/pengiriman/:id", masterController.updatePengiriman);
router.delete("/pengiriman/:id", masterController.deletePengiriman);

router.get("/bank", masterController.listBank);
router.post("/bank", masterController.createBank);
router.put("/bank/:id", masterController.updateBank);
router.delete("/bank/:id", masterController.deleteBank);

// ---------------------------------------------------------------------------
// Upload gambar — dipanggil SEBELUM simpan path ke produk/profil/info toko
// Urutan middleware: auth (di atas) → multer (file) → controller (JSON path)
// ---------------------------------------------------------------------------
// POST /api/admin/upload-gambar — body multipart, field name harus "gambar"
// Respons: { path: "/uploads/images/..." } → path itu yang dikirim di PUT produk/profil
router.post("/upload-gambar", middlewareUploadGambar, uploadController.sendHasilUpload);

// ---------------------------------------------------------------------------
// Info toko — satu baris setting (logo, banner, sosial media; bank di /bank)
// ---------------------------------------------------------------------------
// GET /api/admin/info-toko — baca baris info_toko (+ banks)
router.get("/info-toko", adminController.getInfoToko);
// PUT /api/admin/info-toko — simpan seluruh form info toko (full update)
router.put("/info-toko", adminController.updateInfoToko);

// Ekspor router agar server.js bisa: app.use("/api/admin", adminRoutes)
module.exports = router;

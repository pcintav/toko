/**
 * routes/users.js — daftar URL API publik + pembeli.
 *
 * Prefix di server.js: /api/users
 * Contoh: POST /api/users/login → http://localhost:5000/api/users/login
 *
 * Dua zona keamanan:
 * 1. Route TANPA token (register, login, katalog, artikel, kontak)
 * 2. Route WAJIB login pembeli (profil, pesanan, upload) — middleware per baris
 */

const express = require("express");
const router = express.Router();

const { registerUser, loginUser, getMyProfile, updateMyProfile } = require("../controllers/usersController");
const { pesanContact } = require("../controllers/pesanController");
const pembeliController = require("../controllers/pembeliController");
const masterController = require("../controllers/masterController");
const uploadController = require("../controllers/uploadController");
const { authenticate } = require("../middlewares/authMiddleware");
const { requireRole } = require("../middlewares/roleMiddleware");
const { middlewareUploadGambar } = require("../middlewares/uploadGambar");

// =============================================================================
// ZONA PUBLIK — tidak perlu header Authorization
// Siapa saja (termasuk pengunjung belum daftar) boleh memanggil endpoint ini
// =============================================================================

// POST /api/users/register — daftar akun baru, body: nama, email, uname, passwd, ...
router.post("/register", registerUser);

// POST /api/users/login — body: { credential, passwd }; credential = email ATAU username
router.post("/login", loginUser);

// POST /api/users/contact — form "Hubungi kami" di beranda → INSERT tabel kontak
router.post("/contact", pesanContact);

// --- Katalog & konten toko (halaman beranda, /toko, /artikel) ---
// GET /api/users/produk — katalog aktif; query opsional ?q=&kategori=
router.get("/produk", pembeliController.listProduk);
// GET /api/users/produk/7 — detail satu produk aktif (halaman /produk/:id)
router.get("/produk/:id_produk", pembeliController.getProdukById);

// GET /api/users/info-toko — logo, alamat, jam buka + banks[] (Header, Hero, Footer, checkout)
router.get("/info-toko", pembeliController.getInfoTokoPublik);

// Master data publik — isi dropdown kategori / kurir / rekening
router.get("/kategori", masterController.listKategori);
router.get("/pengiriman", masterController.listPengiriman);
router.get("/bank", masterController.listBank);

// GET /api/users/artikel — list artikel (ringkasan; isi penuh di detail)
router.get("/artikel", pembeliController.listArtikelPublik);
// GET /api/users/artikel/2 — baca artikel lengkap
router.get("/artikel/:id", pembeliController.getArtikelPublikById);

// =============================================================================
// ZONA PEMBELI — wajib header: Authorization: Bearer <token>
// Token didapat dari login/register; role di JWT harus "pembeli"
// =============================================================================

// GET /api/users/me — profil pembeli yang login (tanpa kolom password)
router.get("/me", authenticate, requireRole("pembeli"), getMyProfile);

// PUT /api/users/me — ubah profil / ganti password (passwd + passwd_lama)
router.put("/me", authenticate, requireRole("pembeli"), updateMyProfile);

// POST /api/users/upload-gambar — unggah foto profil atau bukti transfer
// Alur: upload dulu → dapat path → kirim path di PUT /me atau POST /pembelian
router.post(
  "/upload-gambar",
  authenticate,
  requireRole("pembeli"),
  middlewareUploadGambar,
  uploadController.sendHasilUpload
);

// GET /api/users/dashboard — ringkasan pesanan untuk /akun (overview)
router.get("/dashboard", authenticate, requireRole("pembeli"), pembeliController.getDashboard);

// POST /api/users/pembelian — checkout: buat pesanan baru
// id_pembeli diambil dari JWT (req.user.id), BUKAN dari body — mencegah pembelian atas nama orang lain
router.post("/pembelian", authenticate, requireRole("pembeli"), pembeliController.createPembelian);

// GET /api/users/pembelian — riwayat pesanan saya (join nama produk + gambar)
router.get("/pembelian", authenticate, requireRole("pembeli"), pembeliController.listMyPembelian);

// GET /api/users/pembelian/9 — detail satu pesanan milik saya saja
// Route /pembelian/:id harus di bawah GET /pembelian agar Express tidak menganggap "pembelian" sebagai :id
router.get("/pembelian/:id", authenticate, requireRole("pembeli"), pembeliController.getMyPembelianById);

// PUT /api/users/pembelian/:id/bukti — unggah/ganti bukti transfer
router.put(
  "/pembelian/:id/bukti",
  authenticate,
  requireRole("pembeli"),
  pembeliController.updateBuktiPembelian
);

module.exports = router;

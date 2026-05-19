/**
 * Controller — alur **belanja pembeli** (katalog + pesanan).
 * Dipanggil dari routes/users.js.
 *
 * Pola keamanan:
 * - Katalog produk, artikel, info toko (GET) → **tanpa login** (isi halaman toko).
 * - Upload gambar & ubah profil & buat / lihat pesanan → **wajib JWT** + role `pembeli`.
 * - `id_pembeli` pada pesanan dari token, bukan dari body.
 */

const produkModel = require("../models/produkModel");
const pembelianModel = require("../models/pembelianModel");
const artikelModel = require("../models/artikelModel");
const infoTokoModel = require("../models/infoTokoModel");

/** Nilai ENUM MySQL harus sama persis dengan skema latihan. */
const METODE_BAYAR = ["Bank Transfer", "COD"];
const SHIPPING = ["JNT Express", "JNE"];

// =============================================================================
// Helper — parsing ID URL & validasi path upload
// =============================================================================

function parseIdPositive(param) {
  const n = parseInt(String(param), 10);
  if (Number.isNaN(n) || n < 1) return null;
  return n;
}

/** Path hasil upload server (bukan URL luar) — cegah penyisipan string sembarangan. */
function isAllowedUploadPath(s) {
  if (s == null || s === "") return true;
  const t = String(s).trim();
  if (t.length > 500) return false;
  return /^\/uploads\/images\/[a-zA-Z0-9._-]+$/.test(t);
}

// =============================================================================
// Katalog & konten publik (tanpa req.user)
// =============================================================================

/** GET /api/users/produk — katalog (publik). */
exports.listProduk = async (req, res) => {
  try {
    const data = await produkModel.findAllProduk();
    res.status(200).json({ message: "Daftar produk", data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/** GET /api/users/produk/:id_produk — detail satu produk (publik). */
exports.getProdukById = async (req, res) => {
  try {
    const id = parseIdPositive(req.params.id_produk);
    if (!id) return res.status(400).json({ message: "ID produk tidak valid" });

    const row = await produkModel.findProdukById(id);
    if (!row) return res.status(404).json({ message: "Produk tidak ditemukan" });

    res.status(200).json({ message: "Detail produk", data: row });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/** GET /api/users/info-toko — data toko untuk footer / halaman kontak (publik). */
exports.getInfoTokoPublik = async (req, res) => {
  try {
    const row = await infoTokoModel.findInfoToko();
    if (!row) return res.status(404).json({ message: "Data toko belum diatur" });
    res.status(200).json({ message: "Info toko", data: row });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/** GET /api/users/artikel — daftar artikel (ringkasan, tanpa isi penuh di list model). */
exports.listArtikelPublik = async (req, res) => {
  try {
    const data = await artikelModel.findAllArtikel();
    res.status(200).json({ message: "Daftar artikel", data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/** GET /api/users/artikel/:id — baca satu artikel lengkap (publik). */
exports.getArtikelPublikById = async (req, res) => {
  try {
    const id = parseIdPositive(req.params.id);
    if (!id) return res.status(400).json({ message: "ID artikel tidak valid" });

    const row = await artikelModel.findArtikelById(id);
    if (!row) return res.status(404).json({ message: "Artikel tidak ditemukan" });

    res.status(200).json({ message: "Detail artikel", data: row });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// =============================================================================
// Pesanan pembeli — wajib login; id_pembeli dari JWT, bukan body
// =============================================================================

/**
 * POST /api/users/pembelian — buat pesanan (login pembeli).
 * Body: id_produk, nama_pembeli, alamat_pembeli, phone_pembeli,
 *       metode_pembayaran (opsional), pengiriman (opsional), catatan (opsional),
 *       foto_bukti (opsional) — path dari POST /upload-gambar, mis. bukti transfer.
 */
exports.createPembelian = async (req, res) => {
  try {
    // Dari JWT middleware — pembeli tidak bisa checkout atas nama user lain
    const id_pembeli = req.user.id;
    const {
      id_produk,
      nama_pembeli,
      alamat_pembeli,
      phone_pembeli,
      metode_pembayaran = "COD",
      pengiriman = "JNT Express",
      catatan,
      foto_bukti
    } = req.body;

    const idProduk = parseIdPositive(id_produk);
    if (!idProduk) {
      return res.status(400).json({ message: "id_produk wajib dan harus angka valid" });
    }

    if (!nama_pembeli || !alamat_pembeli || phone_pembeli === undefined || phone_pembeli === null) {
      return res.status(400).json({ message: "nama_pembeli, alamat_pembeli, dan phone_pembeli wajib diisi" });
    }

    if (!METODE_BAYAR.includes(metode_pembayaran)) {
      return res.status(400).json({ message: "metode_pembayaran tidak valid", allowed: METODE_BAYAR });
    }
    if (!SHIPPING.includes(pengiriman)) {
      return res.status(400).json({ message: "pengiriman tidak valid", allowed: SHIPPING });
    }

    if (foto_bukti != null && String(foto_bukti).trim() !== "" && !isAllowedUploadPath(foto_bukti)) {
      return res.status(400).json({
        message: "foto_bukti harus path upload dari server ini (POST /api/users/upload-gambar dulu)"
      });
    }

    // Pastikan produk ada sebelum INSERT — hindari error foreign key 1452
    const produk = await produkModel.findProdukById(idProduk);
    if (!produk) {
      return res.status(400).json({ message: "Produk tidak ditemukan" });
    }

    const phoneNum = typeof phone_pembeli === "number" ? phone_pembeli : parseInt(String(phone_pembeli).replace(/\D/g, ""), 10);
    if (Number.isNaN(phoneNum)) {
      return res.status(400).json({ message: "phone_pembeli harus angka telepon yang valid" });
    }

    const result = await pembelianModel.insertPembelian({
      id_pembeli,
      id_produk: idProduk,
      nama_pembeli: String(nama_pembeli).trim(),
      alamat_pembeli: String(alamat_pembeli).trim(),
      phone_pembeli: phoneNum,
      metode_pembayaran,
      pengiriman,
      catatan: catatan != null ? String(catatan).trim() : null,
      foto_bukti: foto_bukti != null && String(foto_bukti).trim() !== "" ? String(foto_bukti).trim() : null
    });

    res.status(201).json({
      message: "Pesanan berhasil dibuat",
      data: { id_pesanan: result.insertId }
    });
  } catch (error) {
    console.error(error);
    /** Foreign key / referensi tidak valid (MySQL 1452) */
    if (error.errno === 1452 || error.code === "ER_NO_REFERENCED_ROW_2" || error.code === "ER_NO_REFERENCED_ROW") {
      return res.status(400).json({ message: "Data produk atau user tidak valid (referensi DB)" });
    }
    res.status(500).json({ message: "Server error" });
  }
};

/** GET /api/users/dashboard — ringkasan untuk panel pembeli. */
exports.getDashboard = async (req, res) => {
  try {
    const id_pembeli = req.user.id;
    const stats = await pembelianModel.getStatsByPembeliId(id_pembeli);
    const pesanan_terbaru = (await pembelianModel.findPembelianByPembeliIdWithDetail(id_pembeli)).slice(0, 5);
    res.status(200).json({
      message: "Dashboard pembeli",
      data: { ...stats, pesanan_terbaru }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/** GET /api/users/pembelian — riwayat pesanan pembeli yang login. */
exports.listMyPembelian = async (req, res) => {
  try {
    const data = await pembelianModel.findPembelianByPembeliIdWithDetail(req.user.id);
    res.status(200).json({ message: "Riwayat pesanan saya", data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/** GET /api/users/pembelian/:id — detail satu pesanan milik saya saja. */
exports.getMyPembelianById = async (req, res) => {
  try {
    const id = parseIdPositive(req.params.id);
    if (!id) return res.status(400).json({ message: "ID pesanan tidak valid" });

    const row = await pembelianModel.findPembelianByIdAndPembeliId(id, req.user.id);
    if (!row) {
      return res.status(404).json({ message: "Pesanan tidak ditemukan atau bukan milik Anda" });
    }

    res.status(200).json({ message: "Detail pesanan", data: row });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

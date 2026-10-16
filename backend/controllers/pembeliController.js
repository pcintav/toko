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
const pengirimanModel = require("../models/pengirimanModel");
const bankModel = require("../models/bankModel");

/** ENUM metode bayar tetap di kolom pembelian (bukan tabel master). */
const METODE_BAYAR = ["Bank Transfer", "COD"];

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

/**
 * GET /api/users/produk — katalog publik (hanya aktif).
 * Query opsional: ?q=kata&kategori=Nama
 */
exports.listProduk = async (req, res) => {
  try {
    const q = req.query.q != null ? String(req.query.q) : "";
    const kategori = req.query.kategori != null ? String(req.query.kategori) : "";
    const data = await produkModel.findAllProduk({ q, kategori, hanyaAktif: true });
    res.status(200).json({ message: "Daftar produk", data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/** GET /api/users/produk/:id_produk — detail satu produk aktif (publik). */
exports.getProdukById = async (req, res) => {
  try {
    const id = parseIdPositive(req.params.id_produk);
    if (!id) return res.status(400).json({ message: "ID produk tidak valid" });

    const row = await produkModel.findProdukById(id);
    if (!row || !row.aktif) {
      return res.status(404).json({ message: "Produk tidak ditemukan" });
    }

    res.status(200).json({ message: "Detail produk", data: row });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/** GET /api/users/info-toko — data toko + daftar rekening bank (publik). */
exports.getInfoTokoPublik = async (req, res) => {
  try {
    const row = await infoTokoModel.findInfoToko();
    if (!row) return res.status(404).json({ message: "Data toko belum diatur" });
    const banks = await bankModel.findAll();
    res.status(200).json({ message: "Info toko", data: { ...row, banks } });
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
      pengiriman,
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

    // Default ke kurir pertama di tabel master jika body kosong
    let shipNama = pengiriman != null ? String(pengiriman).trim() : "";
    if (!shipNama) {
      const daftar = await pengirimanModel.findAll();
      shipNama = daftar[0]?.nama || "";
    }
    if (!(await pengirimanModel.existsByNama(shipNama))) {
      const allowed = (await pengirimanModel.findAll()).map((r) => r.nama);
      return res.status(400).json({ message: "pengiriman tidak valid", allowed });
    }

    const buktiPath =
      foto_bukti != null && String(foto_bukti).trim() !== "" ? String(foto_bukti).trim() : null;

    if (buktiPath && !isAllowedUploadPath(buktiPath)) {
      return res.status(400).json({
        message: "foto_bukti harus path upload dari server ini (POST /api/users/upload-gambar dulu)"
      });
    }

    // Bank Transfer: bukti wajib saat checkout (bisa juga diunggah belakangan di Pesanan Saya)
    if (metode_pembayaran === "Bank Transfer" && !buktiPath) {
      return res.status(400).json({
        message: "Untuk Bank Transfer, unggah bukti transfer dulu (foto_bukti)"
      });
    }

    // Pastikan produk ada, aktif, dan punya stok
    const produk = await produkModel.findProdukById(idProduk);
    if (!produk || !produk.aktif) {
      return res.status(400).json({ message: "Produk tidak tersedia" });
    }
    if (produk.stok < 1) {
      return res.status(400).json({ message: "Stok produk habis" });
    }

    const phoneNum = typeof phone_pembeli === "number" ? phone_pembeli : parseInt(String(phone_pembeli).replace(/\D/g, ""), 10);
    if (Number.isNaN(phoneNum)) {
      return res.status(400).json({ message: "phone_pembeli harus angka telepon yang valid" });
    }

    // Kurangi stok dulu — jika gagal (race), batalkan checkout
    const stokOk = await produkModel.decrementStokIfAvailable(idProduk);
    if (!stokOk) {
      return res.status(400).json({ message: "Stok produk habis atau produk nonaktif" });
    }

    let result;
    try {
      result = await pembelianModel.insertPembelian({
        id_pembeli,
        id_produk: idProduk,
        nama_pembeli: String(nama_pembeli).trim(),
        alamat_pembeli: String(alamat_pembeli).trim(),
        phone_pembeli: phoneNum,
        metode_pembayaran,
        pengiriman: shipNama,
        catatan: catatan != null ? String(catatan).trim() : null,
        foto_bukti: buktiPath
      });
    } catch (insertErr) {
      // Kembalikan stok jika INSERT gagal
      try {
        await produkModel.incrementStok(idProduk);
      } catch (_) {
        /* abaikan error rollback stok */
      }
      throw insertErr;
    }

    // Kembalikan detail lengkap untuk unduh struk di frontend
    const detail = await pembelianModel.findPembelianByIdAndPembeliId(result.insertId, id_pembeli);
    res.status(201).json({
      message: "Pesanan berhasil dibuat",
      data: { id_pesanan: result.insertId, pesanan: detail }
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

/**
 * PUT /api/users/pembelian/:id/bukti — unggah/ganti bukti transfer (milik sendiri).
 * Body: { foto_bukti: "/uploads/images/..." } dari POST /upload-gambar.
 * Diizinkan selama status masih Tertunda / Dikemas.
 */
exports.updateBuktiPembelian = async (req, res) => {
  try {
    const id = parseIdPositive(req.params.id);
    if (!id) return res.status(400).json({ message: "ID pesanan tidak valid" });

    const existing = await pembelianModel.findPembelianByIdAndPembeliId(id, req.user.id);
    if (!existing) {
      return res.status(404).json({ message: "Pesanan tidak ditemukan atau bukan milik Anda" });
    }

    if (existing.metode_pembayaran !== "Bank Transfer") {
      return res.status(400).json({ message: "Bukti transfer hanya untuk metode Bank Transfer" });
    }

    if (!["Tertunda", "Dikemas"].includes(existing.status)) {
      return res.status(400).json({
        message: "Bukti hanya bisa diunggah saat status Tertunda atau Dikemas"
      });
    }

    const { foto_bukti } = req.body;
    const path = foto_bukti != null ? String(foto_bukti).trim() : "";
    if (!path || !isAllowedUploadPath(path)) {
      return res.status(400).json({
        message: "foto_bukti wajib — unggah dulu lewat POST /api/users/upload-gambar"
      });
    }

    await pembelianModel.updateFotoBuktiByPembeli(id, req.user.id, path);
    const row = await pembelianModel.findPembelianByIdAndPembeliId(id, req.user.id);
    res.status(200).json({ message: "Bukti transfer berhasil disimpan", data: row });
  } catch (error) {
    console.error(error);
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

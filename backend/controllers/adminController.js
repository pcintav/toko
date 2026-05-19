/**
 * Controller panel admin.
 *
 * Dipanggil dari routes/admin.js setelah authenticate + requireRole("admin").
 * Pola: validasi body → model (SQL) → respons JSON. CRUD produk, pembeli, pesanan,
 * artikel, kontak, info toko, dan statistik dashboard.
 */

const statsModel = require("../models/statsModel");
const produkModel = require("../models/produkModel");
const pembelianModel = require("../models/pembelianModel");
const artikelModel = require("../models/artikelModel");
const kontakModel = require("../models/kontakModel");
const infoTokoModel = require("../models/infoTokoModel");
const { normalizeKelamin } = require("../utils/kelamin");
const bcrypt = require("bcrypt");
const {
  findAllPembeliForAdmin,
  findAllUsersForAdmin,
  findUserByIdForAdmin,
  findUserByEmail,
  findUserByUname,
  createUserByAdmin,
  updatePembeliByAdmin,
  deletePembeliById
} = require("../models/usersModel");

// --- Nilai ENUM di MySQL harus PERSIS sama string di bawah (sesuai contoh-database.sql) ---

const KATEGORI_PRODUK = ["Mango Sticky Rice", "Mango Pudding", "Mango Milkshake"];
const METODE_BAYAR = ["Bank Transfer", "COD"];
const SHIPPING = ["JNT Express", "JNE"];
const STATUS_PROSES = ["Tertunda", "Dikemas", "Dikirim", "Diterima", "Selesai"];
const STATUS_BAYAR = ["Belum", "Dibayar"];

/**
 * Ubah :id dari URL menjadi angka bulat >= 1.
 * Jika user kirim "abc" atau "0" → null → controller balas 400.
 */
function parseIdPositive(param) {
  const n = parseInt(String(param), 10);
  if (Number.isNaN(n) || n < 1) return null;
  return n;
}

// =============================================================================
// Dashboard & daftar pembeli
// =============================================================================

/** GET /api/admin/stats — ringkasan dashboard */
exports.getStats = async (req, res) => {
  try {
    const stats = await statsModel.getAdminStats();
    const transaksi_terbaru = await statsModel.getRecentPembelian(5);
    res.status(200).json({
      message: "Statistik dashboard",
      data: { ...stats, transaksi_terbaru }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/** GET /api/admin/pembeli — daftar akun pembeli (tanpa password). */
exports.listPembeli = async (req, res) => {
  try {
    const rows = await findAllPembeliForAdmin();
    res.status(200).json({ message: "Data pembeli", data: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// =============================================================================
// Produk — CRUD katalog (validasi kategori ENUM sebelum INSERT/UPDATE)
// =============================================================================

/** GET /api/admin/produk */
exports.listProduk = async (req, res) => {
  try {
    const data = await produkModel.findAllProduk();
    res.status(200).json({ message: "Daftar produk", data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/** GET /api/admin/produk/:id_produk */
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

/** POST /api/admin/produk — body dari form AdminProdukPage setelah upload gambar */
exports.createProduk = async (req, res) => {
  try {
    const { nama_produk, deskripsi, harga, gambar, kategori } = req.body;

    // Cek field wajib sebelum sentuh database
    if (!nama_produk || !deskripsi || harga === undefined || harga === null || !kategori) {
      return res.status(400).json({ message: "nama_produk, deskripsi, harga, dan kategori wajib diisi" });
    }

    // Frontend kirim harga sebagai string; ubah ke integer Rupiah
    const hargaNum = parseInt(String(harga), 10);
    if (Number.isNaN(hargaNum) || hargaNum < 0) {
      return res.status(400).json({ message: "harga harus angka >= 0" });
    }

    // Harus cocok ENUM kolom kategori di MySQL — typo = error 400 + daftar allowed
    if (!KATEGORI_PRODUK.includes(kategori)) {
      return res.status(400).json({ message: "kategori tidak valid", allowed: KATEGORI_PRODUK });
    }

    // gambar = path "/uploads/images/..." dari POST upload-gambar; kosong → NULL di DB
    const result = await produkModel.insertProduk({
      nama_produk: String(nama_produk).trim(),
      deskripsi: String(deskripsi).trim(),
      harga: hargaNum,
      gambar: gambar != null && String(gambar).trim() !== "" ? String(gambar).trim() : null,
      kategori
    });

    res.status(201).json({
      message: "Produk berhasil ditambah",
      data: { id_produk: result.insertId }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/** PUT /api/admin/produk/:id_produk — update penuh */
exports.updateProduk = async (req, res) => {
  try {
    const id = parseIdPositive(req.params.id_produk);
    if (!id) return res.status(400).json({ message: "ID produk tidak valid" });

    const existing = await produkModel.findProdukById(id);
    if (!existing) return res.status(404).json({ message: "Produk tidak ditemukan" });

    const { nama_produk, deskripsi, harga, gambar, kategori } = req.body;
    if (!nama_produk || !deskripsi || harga === undefined || harga === null || !kategori) {
      return res.status(400).json({ message: "nama_produk, deskripsi, harga, dan kategori wajib diisi" });
    }

    const hargaNum = parseInt(String(harga), 10);
    if (Number.isNaN(hargaNum) || hargaNum < 0) {
      return res.status(400).json({ message: "harga harus angka >= 0" });
    }

    if (!KATEGORI_PRODUK.includes(kategori)) {
      return res.status(400).json({ message: "kategori tidak valid", allowed: KATEGORI_PRODUK });
    }

    await produkModel.updateProduk(id, {
      nama_produk: String(nama_produk).trim(),
      deskripsi: String(deskripsi).trim(),
      harga: hargaNum,
      gambar: gambar != null && String(gambar).trim() !== "" ? String(gambar).trim() : null,
      kategori
    });

    res.status(200).json({ message: "Produk berhasil diubah" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/** DELETE /api/admin/produk/:id_produk */
exports.deleteProduk = async (req, res) => {
  try {
    const id = parseIdPositive(req.params.id_produk);
    if (!id) return res.status(400).json({ message: "ID produk tidak valid" });

    const result = await produkModel.deleteProduk(id);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Produk tidak ditemukan" });
    }

    res.status(200).json({ message: "Produk berhasil dihapus" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// =============================================================================
// Pembelian (pesanan) — admin ubah status bayar/kirim, bukan id_pembeli
// =============================================================================

/** GET /api/admin/pembelian */
exports.listPembelian = async (req, res) => {
  try {
    const data = await pembelianModel.findAllPembelianWithDetail();
    res.status(200).json({ message: "Daftar pembelian", data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/** GET /api/admin/pembelian/:id */
exports.getPembelianById = async (req, res) => {
  try {
    const id = parseIdPositive(req.params.id);
    if (!id) return res.status(400).json({ message: "ID pembelian tidak valid" });

    const row = await pembelianModel.findPembelianById(id);
    if (!row) return res.status(404).json({ message: "Pembelian tidak ditemukan" });

    res.status(200).json({ message: "Detail pembelian", data: row });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * PUT /api/admin/pembelian/:id
 * Body: metode_pembayaran, pembayaran, pengiriman, status, catatan (opsional)
 */
exports.updatePembelian = async (req, res) => {
  try {
    const id = parseIdPositive(req.params.id);
    if (!id) return res.status(400).json({ message: "ID pembelian tidak valid" });

    const existing = await pembelianModel.findPembelianById(id);
    if (!existing) return res.status(404).json({ message: "Pembelian tidak ditemukan" });

    const { metode_pembayaran, pembayaran, pengiriman, status, catatan } = req.body;

    // Admin hanya boleh ubah kolom operasional — id_pembeli/id_produk tidak ada di body
    if (!METODE_BAYAR.includes(metode_pembayaran)) {
      return res.status(400).json({ message: "metode_pembayaran tidak valid", allowed: METODE_BAYAR });
    }
    if (!STATUS_BAYAR.includes(pembayaran)) {
      return res.status(400).json({ message: "pembayaran tidak valid", allowed: STATUS_BAYAR });
    }
    if (!SHIPPING.includes(pengiriman)) {
      return res.status(400).json({ message: "pengiriman tidak valid", allowed: SHIPPING });
    }
    if (!STATUS_PROSES.includes(status)) {
      return res.status(400).json({ message: "status tidak valid", allowed: STATUS_PROSES });
    }

    await pembelianModel.updatePembelianAdminFields(id, {
      metode_pembayaran,
      pembayaran,
      pengiriman,
      status,
      catatan
    });

    res.status(200).json({ message: "Pembelian berhasil diperbarui" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/** DELETE /api/admin/pembelian/:id */
exports.deletePembelian = async (req, res) => {
  try {
    const id = parseIdPositive(req.params.id);
    if (!id) return res.status(400).json({ message: "ID pembelian tidak valid" });

    const result = await pembelianModel.deletePembelian(id);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Pembelian tidak ditemukan" });
    }

    res.status(200).json({ message: "Pembelian berhasil dihapus" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// =============================================================================
// Artikel — konten blog toko
// =============================================================================

/** GET /api/admin/artikel */
exports.listArtikel = async (req, res) => {
  try {
    const data = await artikelModel.findAllArtikel();
    res.status(200).json({ message: "Daftar artikel", data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/** GET /api/admin/artikel/:id */
exports.getArtikelById = async (req, res) => {
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

/** POST /api/admin/artikel */
exports.createArtikel = async (req, res) => {
  try {
    const { judul, ringkasan, isi, gambar } = req.body;
    if (!judul || !ringkasan || !isi || !gambar) {
      return res.status(400).json({ message: "judul, ringkasan, isi, dan gambar wajib diisi" });
    }

    const result = await artikelModel.insertArtikel({
      judul: String(judul).trim(),
      ringkasan: String(ringkasan).trim(),
      isi: String(isi).trim(),
      gambar: String(gambar).trim()
    });

    res.status(201).json({ message: "Artikel berhasil ditambah", data: { id: result.insertId } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/** PUT /api/admin/artikel/:id */
exports.updateArtikel = async (req, res) => {
  try {
    const id = parseIdPositive(req.params.id);
    if (!id) return res.status(400).json({ message: "ID artikel tidak valid" });

    const existing = await artikelModel.findArtikelById(id);
    if (!existing) return res.status(404).json({ message: "Artikel tidak ditemukan" });

    const { judul, ringkasan, isi, gambar } = req.body;
    if (!judul || !ringkasan || !isi) {
      return res.status(400).json({ message: "judul, ringkasan, dan isi wajib diisi" });
    }

    await artikelModel.updateArtikel(id, {
      judul: String(judul).trim(),
      ringkasan: String(ringkasan).trim(),
      isi: String(isi).trim(),
      gambar: gambar != null ? String(gambar).trim() : ""
    });

    res.status(200).json({ message: "Artikel berhasil diubah" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/** DELETE /api/admin/artikel/:id */
exports.deleteArtikel = async (req, res) => {
  try {
    const id = parseIdPositive(req.params.id);
    if (!id) return res.status(400).json({ message: "ID artikel tidak valid" });

    const result = await artikelModel.deleteArtikel(id);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Artikel tidak ditemukan" });
    }

    res.status(200).json({ message: "Artikel berhasil dihapus" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// =============================================================================
// Kontak — pesan dari form beranda (tabel kontak)
// =============================================================================

/** GET /api/admin/kontak */
exports.listKontak = async (req, res) => {
  try {
    const data = await kontakModel.findAllKontak();
    res.status(200).json({ message: "Daftar pesan kontak", data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/** GET /api/admin/kontak/:id */
exports.getKontakById = async (req, res) => {
  try {
    const id = parseIdPositive(req.params.id);
    if (!id) return res.status(400).json({ message: "ID kontak tidak valid" });

    const row = await kontakModel.findKontakById(id);
    if (!row) return res.status(404).json({ message: "Pesan tidak ditemukan" });

    res.status(200).json({ message: "Detail pesan", data: row });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * PUT /api/admin/kontak/:id — ubah entri pesan kontak.
 * Body: nama_lengkap, email, no_hp, isi_pesan (semua wajib).
 */
exports.updateKontak = async (req, res) => {
  try {
    const id = parseIdPositive(req.params.id);
    if (!id) return res.status(400).json({ message: "ID kontak tidak valid" });

    const { nama_lengkap, email, no_hp, isi_pesan } = req.body;
    if (!nama_lengkap || !email || no_hp === undefined || no_hp === null || !isi_pesan) {
      return res.status(400).json({ message: "nama_lengkap, email, no_hp, dan isi_pesan wajib diisi" });
    }

    const p = typeof no_hp === "number" ? no_hp : parseInt(String(no_hp).replace(/\D/g, ""), 10);
    if (Number.isNaN(p)) {
      return res.status(400).json({ message: "no_hp harus angka valid" });
    }

    const existing = await kontakModel.findKontakById(id);
    if (!existing) return res.status(404).json({ message: "Pesan tidak ditemukan" });

    await kontakModel.updateKontak(id, {
      nama_lengkap: String(nama_lengkap).trim(),
      email: String(email).trim(),
      no_hp: p,
      isi_pesan: String(isi_pesan).trim()
    });

    const row = await kontakModel.findKontakById(id);
    res.status(200).json({ message: "Pesan kontak berhasil diubah", data: row });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/** DELETE /api/admin/kontak/:id */
exports.deleteKontak = async (req, res) => {
  try {
    const id = parseIdPositive(req.params.id);
    if (!id) return res.status(400).json({ message: "ID kontak tidak valid" });

    const result = await kontakModel.deleteKontak(id);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Pesan tidak ditemukan" });
    }

    res.status(200).json({ message: "Pesan kontak berhasil dihapus" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// =============================================================================
// User / pembeli — admin buat & kelola akun pembeli (bukan admin)
// =============================================================================

/** GET /api/admin/users?role=admin|pembeli (opsional) */
exports.listUsers = async (req, res) => {
  try {
    const role = req.query.role;
    if (role !== undefined && role !== "admin" && role !== "pembeli") {
      return res.status(400).json({ message: "Query role harus admin atau pembeli" });
    }
    const data = await findAllUsersForAdmin(role);
    res.status(200).json({ message: "Daftar user", data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/** GET /api/admin/users/:id */
exports.getUserById = async (req, res) => {
  try {
    const id = parseIdPositive(req.params.id);
    if (!id) return res.status(400).json({ message: "ID user tidak valid" });

    const row = await findUserByIdForAdmin(id);
    if (!row) return res.status(404).json({ message: "User tidak ditemukan" });

    res.status(200).json({ message: "Detail user", data: row });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * POST /api/admin/users — buat akun pembeli.
 * Body: field register + passwd (role selalu pembeli).
 */
exports.createUser = async (req, res) => {
  try {
    const {
      nama_d,
      nama_b,
      kelamin,
      lahir,
      alamat,
      phone,
      email,
      uname,
      passwd,
      foto
    } = req.body;

    // Form admin buat pembeli — field sama seperti register publik + passwd wajib
    if (!nama_d || !nama_b || !kelamin || !lahir || !alamat || phone === undefined || !email || !uname || !passwd) {
      return res.status(400).json({
        message: "nama_d, nama_b, kelamin, lahir, alamat, phone, email, uname, passwd wajib diisi"
      });
    }
    if (String(passwd).length < 6) {
      return res.status(400).json({ message: "passwd minimal 6 karakter" });
    }

    // Normalisasi nomor HP: buang karakter non-angka dari input form
    const p = typeof phone === "number" ? phone : parseInt(String(phone).replace(/\D/g, ""), 10);
    if (Number.isNaN(p)) {
      return res.status(400).json({ message: "phone harus angka valid" });
    }

    // Cegah duplikat sebelum INSERT — hemat error MySQL UNIQUE
    if (await findUserByEmail(email)) {
      return res.status(400).json({ message: "Email sudah terdaftar" });
    }
    if (await findUserByUname(uname)) {
      return res.status(400).json({ message: "Username sudah dipakai" });
    }

    const role = "pembeli"; // endpoint ini tidak boleh membuat admin lewat API

    // Path foto harus dari upload server — cegah URL eksternal disimpan di DB
    if (foto !== undefined && foto !== "") {
      const f = String(foto).trim();
      if (!/^\/uploads\/images\/[a-zA-Z0-9._-]+$/.test(f)) {
        return res.status(400).json({ message: "foto harus path /uploads/images/..." });
      }
    }

    const hashedPassword = await bcrypt.hash(String(passwd), 10);
    const result = await createUserByAdmin({
      nama_d: String(nama_d).trim(),
      nama_b: String(nama_b).trim(),
      kelamin: normalizeKelamin(kelamin),
      lahir: String(lahir).trim(),
      alamat: String(alamat).trim(),
      phone: p,
      email: String(email).trim(),
      uname: String(uname).trim(),
      passwd: hashedPassword,
      role,
      foto: foto ? String(foto).trim() : "default.jpg"
    });

    const row = await findUserByIdForAdmin(result.insertId);
    res.status(201).json({ message: "Pembeli berhasil dibuat", data: row });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * PUT /api/admin/users/:id — ubah akun pembeli.
 * Body: sama seperti buat; passwd opsional (kosong = password tidak diubah).
 */
exports.updatePembeli = async (req, res) => {
  try {
    const id = parseIdPositive(req.params.id);
    if (!id) return res.status(400).json({ message: "ID user tidak valid" });

    const existing = await findUserByIdForAdmin(id);
    if (!existing) return res.status(404).json({ message: "User tidak ditemukan" });
    if (existing.role !== "pembeli") {
      return res.status(403).json({ message: "Hanya akun pembeli yang bisa diubah dari endpoint ini" });
    }

    const {
      nama_d,
      nama_b,
      kelamin,
      lahir,
      alamat,
      phone,
      email,
      uname,
      passwd,
      foto
    } = req.body;

    if (!nama_d || !nama_b || !kelamin || !lahir || !alamat || phone === undefined || !email || !uname) {
      return res.status(400).json({
        message: "nama_d, nama_b, kelamin, lahir, alamat, phone, email, uname wajib diisi"
      });
    }

    const p = typeof phone === "number" ? phone : parseInt(String(phone).replace(/\D/g, ""), 10);
    if (Number.isNaN(p)) {
      return res.status(400).json({ message: "phone harus angka valid" });
    }

    if (await findUserByEmail(email, id)) {
      return res.status(400).json({ message: "Email sudah dipakai user lain" });
    }
    if (await findUserByUname(uname, id)) {
      return res.status(400).json({ message: "Username sudah dipakai user lain" });
    }

    let fotoPath = existing.foto;
    if (foto !== undefined) {
      const f = String(foto).trim();
      if (f !== "" && !/^\/uploads\/images\/[a-zA-Z0-9._-]+$/.test(f)) {
        return res.status(400).json({ message: "foto harus path /uploads/images/..." });
      }
      fotoPath = f || "default.jpg";
    }

    const payload = {
      nama_d: String(nama_d).trim(),
      nama_b: String(nama_b).trim(),
      kelamin: normalizeKelamin(kelamin),
      lahir: String(lahir).trim(),
      alamat: String(alamat).trim(),
      phone: p,
      email: String(email).trim(),
      uname: String(uname).trim(),
      foto: fotoPath
    };

    if (passwd !== undefined && passwd !== null && String(passwd).trim() !== "") {
      if (String(passwd).length < 6) {
        return res.status(400).json({ message: "passwd minimal 6 karakter" });
      }
      payload.passwd = await bcrypt.hash(String(passwd), 10);
    }

    const result = await updatePembeliByAdmin(id, payload);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Pembeli tidak ditemukan" });
    }

    const row = await findUserByIdForAdmin(id);
    res.status(200).json({ message: "Pembeli berhasil diubah", data: row });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/** DELETE /api/admin/users/:id — hapus akun pembeli */
exports.deleteUser = async (req, res) => {
  try {
    const id = parseIdPositive(req.params.id);
    if (!id) return res.status(400).json({ message: "ID user tidak valid" });

    const target = await findUserByIdForAdmin(id);
    if (!target) return res.status(404).json({ message: "User tidak ditemukan" });

    if (target.role !== "pembeli") {
      return res.status(403).json({ message: "Hanya akun pembeli yang bisa dihapus dari endpoint ini" });
    }

    const result = await deletePembeliById(id);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Pembeli tidak ditemukan" });
    }

    res.status(200).json({ message: "Pembeli berhasil dihapus" });
  } catch (error) {
    // Foreign key pembelian.id_pembeli → users.id — tidak bisa DELETE user yang masih punya pesanan
    if (error.code === "ER_ROW_IS_REFERENCED_2" || error.errno === 1451) {
      return res.status(409).json({
        message: "User masih punya pesanan terkait. Hapus pesanan pembeli tersebut dulu."
      });
    }
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// =============================================================================
// Info toko — satu baris setting (logo, rekening, sosial media)
// =============================================================================

/** GET /api/admin/info-toko */
exports.getInfoToko = async (req, res) => {
  try {
    const row = await infoTokoModel.findInfoToko();
    if (!row) return res.status(404).json({ message: "Data toko belum ada di database" });

    res.status(200).json({ message: "Info toko", data: row });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * PUT /api/admin/info-toko — kirim semua field bisnis (full update satu baris).
 */
exports.updateInfoToko = async (req, res) => {
  try {
    const b = req.body;

    // Daftar field teks/wajib dari form AdminInfoTokoPage (full update, bukan PATCH sebagian)
    const required = [
      "nama_toko",
      "alamat_toko",
      "email_toko",
      "tlp_toko",
      "nama_bank_a",
      "nama_bank_b",
      "no_rek_a",
      "no_rek_b",
      "jam_buka",
      "jam_tutup",
      "link_wa",
      "link_ig",
      "link_fb",
    ];

    for (const key of required) {
      if (b[key] === undefined || b[key] === null || String(b[key]).trim() === "") {
        return res.status(400).json({ message: `Field wajib kosong: ${key}` });
      }
    }

    // tentang & foto_banner boleh string panjang / path — dicek terpisah
    if (b.tentang === undefined || b.tentang === null) {
      return res.status(400).json({ message: "Field wajib: tentang" });
    }
    if (b.foto_banner === undefined || b.foto_banner === null) {
      return res.status(400).json({ message: "Field wajib: foto_banner" });
    }

    const jamBuka = parseInt(String(b.jam_buka), 10);
    const jamTutup = parseInt(String(b.jam_tutup), 10);
    if (Number.isNaN(jamBuka) || Number.isNaN(jamTutup)) {
      return res.status(400).json({ message: "jam_buka dan jam_tutup harus angka" });
    }

    // Objek lengkap untuk UPDATE satu baris info_toko (logo opsional bisa string kosong)
    const payload = {
      logo_toko: b.logo_toko != null ? String(b.logo_toko).trim() : "",
      nama_toko: String(b.nama_toko).trim(),
      tentang: String(b.tentang).trim(),
      foto_banner: String(b.foto_banner).trim(),
      alamat_toko: String(b.alamat_toko).trim(),
      email_toko: String(b.email_toko).trim(),
      tlp_toko: b.tlp_toko,
      nama_bank_a: String(b.nama_bank_a).trim(),
      nama_bank_b: String(b.nama_bank_b).trim(),
      no_rek_a: b.no_rek_a,
      no_rek_b: b.no_rek_b,
      jam_buka: jamBuka,
      jam_tutup: jamTutup,
      logo_wa: b.logo_wa != null ? String(b.logo_wa).trim() : "",
      logo_ig: b.logo_ig != null ? String(b.logo_ig).trim() : "",
      logo_fb: b.logo_fb != null ? String(b.logo_fb).trim() : "",
      link_wa: String(b.link_wa).trim(),
      link_ig: String(b.link_ig).trim(),
      link_fb: String(b.link_fb).trim()
    };

    // Upsert: jika belum ada baris (DB baru), INSERT; jika ada, UPDATE
    const upd = await infoTokoModel.updateInfoToko(payload);
    if (upd.affectedRows === 0) {
      await infoTokoModel.insertInfoToko(payload);
      return res.status(201).json({ message: "Info toko berhasil dibuat" });
    }

    res.status(200).json({ message: "Info toko berhasil diperbarui" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

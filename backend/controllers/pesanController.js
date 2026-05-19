/**
 * pesanController.js — menangani formulir "Hubungi kami" di beranda.
 *
 * Route: POST /api/users/contact (publik, tanpa login).
 * Alur: validasi body → pesanModel.createPesan → (opsional) JWT → respons 201
 */

const jwt = require("jsonwebtoken");
const { createPesan } = require("../models/pesanModel");

/**
 * POST /api/users/contact
 * Body JSON: { nama_lengkap, email, no_hp, isi_pesan }
 */
exports.pesanContact = async (req, res) => {
  try {
    const { nama_lengkap, email, no_hp, isi_pesan } = req.body;

    // Semua field wajib; no_hp boleh dikirim sebagai string "0812..." dari input HTML
    if (!nama_lengkap || !email || no_hp === undefined || no_hp === null || !isi_pesan) {
      return res.status(400).json({ message: "nama_lengkap, email, no_hp, dan isi_pesan wajib diisi" });
    }

    // INSERT ke tabel kontak — bukan tabel users
    const newPesan = await createPesan({
      nama_lengkap,
      email,
      no_hp,
      isi_pesan
    });

    /**
     * Token opsional: payload { id } = insertId baris kontak, BUKAN login user toko.
     * Frontend saat ini bisa mengabaikan; berguna jika nanti ada halaman "lacak pesan".
     */
    const token = jwt.sign(
      { id: newPesan.insertId },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(201).json({
      message: "Pesan berhasil",
      token
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

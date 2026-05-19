/**
 * =============================================================================
 * LATIHAN BACKEND — cara baca project supaya paham ALUR & FUNGSI
 * =============================================================================
 * Bayangkan satu request HTTP (misalnya login dari Postman):
 *
 *   Browser/Postman
 *        → server.js (terima koneksi, middleware global)
 *        → routes/*.js (cocokkan URL + method, contoh POST /login)
 *        → [opsional] middlewares/ (cek token JWT, cek role admin/pembeli)
 *        → controllers/ (aturan bisnis: cek password, buat token, dll.)
 *        → models/ (query ke MySQL)
 *        → config/db.js (pool koneksi ke database)
 *
 * Urutan file yang disarankan untuk dibaca pelajar:
 *   1. server.js              — mulai di sini (pintu masuk aplikasi)
 *   2. routes/users.js (publik/pembeli) & routes/admin.js (panel admin)
 *   3. middlewares/           — auth, peran, **uploadGambar** (multipart)
 *   4. controllers/         — usersController / uploadController / pesanController / pembeliController / adminController
 *   5. models/              — usersModel, pesanModel, produkModel, pembelianModel, artikelModel, kontakModel, infoTokoModel
 *   6. config/db.js           — setting koneksi database
 *   7. .env                   — nilai konfigurasi (rahasia JWT jangan dishare)
 *
 * File .sql: database/schema-latihan-toko.sql (CREATE TABLE latihan), seed-admin.sql (user admin).
 * =============================================================================
 *
 * Entry point backend Express.
 * Urutan eksekusi saat server jalan: dotenv → express → middleware global → route → listen port.
 */

/* Muat variabel dari file .env ke process.env (PORT, JWT_SECRET, DB_*, dll.) */
require("dotenv").config();

/* Framework HTTP: app = instance aplikasi web */
const express = require("express");
const path = require("path");

/**
 * CORS = Cross-Origin Resource Sharing.
 * Browser memblokir request frontend (origin A) ke API (origin B) kecuali server mengizinkan.
 * Di sini hanya origin Vite dev yang diizinkan.
 */
const cors = require("cors");

const app = express();

/* Latihan: izinkan semua origin dev agar frontend (5173) bisa panggil API (5000) langsung */
app.use(cors());

/**
 * express.json() = parse body request Content-Type: application/json
 * Hasilnya tersedia di req.body sebagai objek JavaScript.
 */
app.use(express.json());

/**
 * File hasil upload admin (gambar) dilayani sebagai file statis.
 * URL contoh: http://localhost:5000/uploads/images/namafile.jpg
 */
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/**
 * Route paling sederhana untuk cek server hidup tanpa database.
 * GET http://localhost:PORT/ → teks biasa.
 */
app.get("/", (req, res) => {
  res.send("API jalan");
});

/* Router terpisah per domain URL; logic detail ada di file routes */
const userRoutes = require("./routes/users");
const adminRoutes = require("./routes/admin");

/**
 * Semua path di userRoutes dipasang di bawah prefix /api/users
 * Contoh: router.post("/login", ...) → POST /api/users/login
 */
app.use("/api/users", userRoutes);

/**
 * Route khusus peran admin (misalnya GET /api/admin/me).
 */
app.use("/api/admin", adminRoutes);

/* Port dari .env, fallback 5000 jika PORT tidak di-set */
const PORT = process.env.PORT || 5000;

/* Bind server ke port; callback dipanggil setelah socket listening */
app.listen(PORT, () => {
  console.log(`Server jalan di port ${PORT}`);
});

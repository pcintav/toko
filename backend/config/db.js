/**
 * Konfigurasi koneksi database MySQL.
 * File ini dieksekusi saat dimuat oleh model (require("../config/db")).
 */

// Muat variabel lingkungan (.env) sebelum membaca process.env.DB_*
require("dotenv").config();

// Driver resmi Node untuk MySQL; createPool = koneksi dipinjam dari pool (efisien untuk banyak request)
const mysql = require("mysql2");

/**
 * Pool koneksi: beberapa koneksi siap pakai; query tidak membuka/tutup TCP setiap kali.
 * Nilai host/user/password/database diambil dari .env agar tidak hardcode di kode.
 */
const db = mysql.createPool({
  host: process.env.DB_HOST, // alamat server MySQL, biasanya localhost
  user: process.env.DB_USER, // user MySQL
  password: process.env.DB_PASS, // kata sandi user (boleh kosong di XAMPP default)
  database: process.env.DB_NAME, // nama database yang sudah dibuat di MySQL
});

/**
 * Uji koneksi sekali saat aplikasi start: ambil satu koneksi dari pool.
 * Jika gagal, err berisi detail (misalnya DB belum jalan atau kredensial salah).
 * connection.release() mengembalikan koneksi ke pool agar bisa dipakai query lain.
 */
db.getConnection((err, connection) => {
  if (err) {
    console.error("DB error:", err);
  } else {
    console.log("MySQL connected");
    connection.release();
  }
});

// Ekspor pool agar models bisa menjalankan db.query(...)
module.exports = db;

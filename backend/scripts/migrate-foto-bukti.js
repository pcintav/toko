/**
 * scripts/migrate-foto-bukti.js — migrasi sekali jalan untuk DB lama.
 *
 * Menambah kolom pembelian.foto_bukti jika belum ada (bukti transfer).
 * Jalankan dari folder backend: node scripts/migrate-foto-bukti.js
 */
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const db = require("../config/db");

// DDL hanya dijalankan jika kolom belum terdeteksi di information_schema
const sql = `
  ALTER TABLE pembelian
  ADD COLUMN foto_bukti VARCHAR(500) NULL
  AFTER catatan
`;

// Cek dulu agar skrip aman dijalankan berulang (idempotent)
db.query(
  `SELECT COUNT(*) AS n FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'pembelian' AND COLUMN_NAME = 'foto_bukti'`,
  [process.env.DB_NAME],
  (err, rows) => {
    if (err) {
      console.error("Cek kolom gagal:", err.message);
      process.exit(1);
    }
    if (rows[0].n > 0) {
      console.log("Kolom foto_bukti sudah ada — tidak perlu migrasi.");
      process.exit(0);
    }
    db.query(sql, (err2) => {
      if (err2) {
        console.error("ALTER gagal:", err2.message);
        process.exit(1);
      }
      console.log("Berhasil: kolom foto_bukti ditambahkan ke tabel pembelian.");
      process.exit(0);
    });
  }
);

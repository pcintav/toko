/**
 * scripts/migrate-bank-atas-nama.js — tambah kolom bank.atas_nama jika belum ada.
 * Jalankan: npm run db:migrate-bank-atas-nama
 */
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const db = require("../config/db");

const dbName = process.env.DB_NAME;

db.query(
  `SELECT COUNT(*) AS n FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'bank' AND COLUMN_NAME = 'atas_nama'`,
  [dbName],
  (err, rows) => {
    if (err) {
      console.error("Cek kolom gagal:", err.message);
      process.exit(1);
    }
    if (rows[0].n > 0) {
      console.log("Kolom atas_nama sudah ada — tidak perlu migrasi.");
      // Isi default kosong yang masih NULL agar UI tidak error
      db.query(
        `UPDATE bank SET atas_nama = 'Pemilik Toko' WHERE atas_nama IS NULL OR atas_nama = ''`,
        () => process.exit(0)
      );
      return;
    }
    db.query(
      "ALTER TABLE bank ADD COLUMN atas_nama VARCHAR(100) NULL AFTER no_rek",
      (err2) => {
        if (err2) {
          console.error("ALTER gagal:", err2.message);
          process.exit(1);
        }
        db.query(
          `UPDATE bank SET atas_nama = 'Pemilik Toko' WHERE atas_nama IS NULL OR atas_nama = ''`,
          (err3) => {
            if (err3) console.warn("Update default:", err3.message);
            console.log("Berhasil: kolom atas_nama ditambahkan ke tabel bank.");
            process.exit(0);
          }
        );
      }
    );
  }
);

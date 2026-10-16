/**
 * scripts/migrate-produk-stok-aktif.js — migrasi sekali jalan untuk DB lama.
 *
 * Menambah kolom produk.stok dan produk.aktif jika belum ada.
 * Jalankan dari folder backend: node scripts/migrate-produk-stok-aktif.js
 * atau: npm run db:migrate-stok-aktif
 */
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const db = require("../config/db");

const dbName = process.env.DB_NAME;

function hasColumn(column) {
  return new Promise((resolve, reject) => {
    db.query(
      `SELECT COUNT(*) AS n FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'produk' AND COLUMN_NAME = ?`,
      [dbName, column],
      (err, rows) => {
        if (err) return reject(err);
        resolve(rows[0].n > 0);
      }
    );
  });
}

function alter(sql) {
  return new Promise((resolve, reject) => {
    db.query(sql, (err) => (err ? reject(err) : resolve()));
  });
}

(async () => {
  try {
    const hasStok = await hasColumn("stok");
    const hasAktif = await hasColumn("aktif");

    if (!hasStok) {
      await alter(
        "ALTER TABLE produk ADD COLUMN stok INT NOT NULL DEFAULT 0 AFTER kategori"
      );
      console.log("Berhasil: kolom stok ditambahkan.");
    } else {
      console.log("Kolom stok sudah ada.");
    }

    if (!hasAktif) {
      await alter(
        "ALTER TABLE produk ADD COLUMN aktif TINYINT(1) NOT NULL DEFAULT 1 AFTER stok"
      );
      console.log("Berhasil: kolom aktif ditambahkan.");
    } else {
      console.log("Kolom aktif sudah ada.");
    }

    // Isi stok contoh jika semua masih 0 (opsional, aman untuk latihan)
    await alter(
      "UPDATE produk SET stok = 20 WHERE stok = 0 AND aktif = 1"
    );
    console.log("Selesai migrasi stok/aktif.");
    process.exit(0);
  } catch (e) {
    console.error("Migrasi gagal:", e.message);
    process.exit(1);
  }
})();

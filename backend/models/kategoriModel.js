/**
 * kategoriModel.js — tabel master `kategori_produk`.
 * Nama kategori disimpan di produk.kategori (VARCHAR), divalidasi lewat tabel ini.
 */

const db = require("../config/db");

exports.findAll = () => {
  return new Promise((resolve, reject) => {
    db.query(
      "SELECT id, nama, created_at, updated_at FROM kategori_produk ORDER BY nama ASC",
      (err, results) => {
        if (err) return reject(err);
        resolve(results || []);
      }
    );
  });
};

exports.findById = (id) => {
  return new Promise((resolve, reject) => {
    db.query(
      "SELECT id, nama, created_at, updated_at FROM kategori_produk WHERE id = ? LIMIT 1",
      [id],
      (err, results) => {
        if (err) return reject(err);
        if (!results?.length) return resolve(null);
        resolve(results[0]);
      }
    );
  });
};

/** true jika nama ada di master (untuk validasi produk) */
exports.existsByNama = (nama) => {
  return new Promise((resolve, reject) => {
    db.query(
      "SELECT id FROM kategori_produk WHERE nama = ? LIMIT 1",
      [nama],
      (err, results) => {
        if (err) return reject(err);
        resolve(Boolean(results?.length));
      }
    );
  });
};

exports.insert = (nama) => {
  return new Promise((resolve, reject) => {
    db.query(
      "INSERT INTO kategori_produk (nama) VALUES (?)",
      [nama],
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
  });
};

exports.update = (id, nama) => {
  return new Promise((resolve, reject) => {
    db.query(
      "UPDATE kategori_produk SET nama = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [nama, id],
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
  });
};

exports.remove = (id) => {
  return new Promise((resolve, reject) => {
    db.query("DELETE FROM kategori_produk WHERE id = ?", [id], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

/** Hitung produk yang memakai nama kategori ini (cegah hapus jika masih dipakai) */
exports.countProdukByNama = (nama) => {
  return new Promise((resolve, reject) => {
    db.query(
      "SELECT COUNT(*) AS n FROM produk WHERE kategori = ?",
      [nama],
      (err, results) => {
        if (err) return reject(err);
        resolve(results?.[0]?.n ?? 0);
      }
    );
  });
};

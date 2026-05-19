/**
 * artikelModel.js — query SQL ke tabel `artikel`.
 *
 * Hanya akses database (tidak ada req/res).
 * Dipanggil: pembeliController (baca publik), adminController (CRUD).
 */

const db = require("../config/db");

/**
 * SELECT semua artikel untuk list (tanpa kolom `isi` — menghemat bandwidth list).
 * ORDER BY id DESC = artikel terbaru di atas.
 */
exports.findAllArtikel = () => {
  return new Promise((resolve, reject) => {
    db.query(
      "SELECT id, judul, ringkasan, gambar, created_at, updated_at FROM artikel ORDER BY id DESC",
      (err, results) => {
        if (err) return reject(err);
        resolve(results || []);
      }
    );
  });
};

/**
 * SELECT satu artikel lengkap termasuk `isi` (konten HTML/teks panjang).
 * LIMIT 1 karena id adalah primary key (unik).
 */
exports.findArtikelById = (id) => {
  return new Promise((resolve, reject) => {
    db.query(
      "SELECT id, judul, ringkasan, isi, gambar, created_at, updated_at FROM artikel WHERE id = ? LIMIT 1",
      [id],
      (err, results) => {
        if (err) return reject(err);
        if (!results || results.length === 0) return resolve(null);
        resolve(results[0]);
      }
    );
  });
};

/** INSERT artikel baru; insertId dipakai controller untuk respons 201 */
exports.insertArtikel = (row) => {
  return new Promise((resolve, reject) => {
    const query = `
      INSERT INTO artikel (judul, ringkasan, isi, gambar)
      VALUES (?, ?, ?, ?)
    `;
    const values = [row.judul, row.ringkasan, row.isi, row.gambar];
    db.query(query, values, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

/** UPDATE semua kolom artikel (admin edit penuh dari form) */
exports.updateArtikel = (id, row) => {
  return new Promise((resolve, reject) => {
    const query = `
      UPDATE artikel SET
        judul = ?, ringkasan = ?, isi = ?, gambar = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    const values = [row.judul, row.ringkasan, row.isi, row.gambar, id];
    db.query(query, values, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

/** DELETE satu baris artikel by primary key */
exports.deleteArtikel = (id) => {
  return new Promise((resolve, reject) => {
    db.query("DELETE FROM artikel WHERE id = ?", [id], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

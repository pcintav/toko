/**
 * kontakModel.js — query SQL tabel `kontak` untuk panel admin.
 *
 * INSERT pesan pengunjung ada di pesanModel.js (POST /api/users/contact).
 * File ini hanya: baca daftar, baca satu, edit, hapus (admin).
 */

const db = require("../config/db");

/**
 * SELECT semua pesan kontak untuk tabel admin.
 * Kolom isi_pesan bisa panjang — frontend biasanya potong di preview.
 */
exports.findAllKontak = () => {
  return new Promise((resolve, reject) => {
    db.query(
      `SELECT id, nama_lengkap, email, no_hp, isi_pesan, created_at, updated_at
       FROM kontak ORDER BY id DESC`,
      (err, results) => {
        if (err) return reject(err);
        resolve(results || []);
      }
    );
  });
};

/** SELECT satu baris by id — untuk modal detail / sebelum UPDATE */
exports.findKontakById = (id) => {
  return new Promise((resolve, reject) => {
    db.query(
      `SELECT id, nama_lengkap, email, no_hp, isi_pesan, created_at, updated_at
       FROM kontak WHERE id = ? LIMIT 1`,
      [id],
      (err, results) => {
        if (err) return reject(err);
        if (!results || results.length === 0) return resolve(null);
        resolve(results[0]);
      }
    );
  });
};

/**
 * UPDATE isi pesan (admin koreksi data atau balas lewat channel lain).
 * updated_at diisi otomatis MySQL.
 */
exports.updateKontak = (id, row) => {
  return new Promise((resolve, reject) => {
    const query = `
      UPDATE kontak SET
        nama_lengkap = ?,
        email = ?,
        no_hp = ?,
        isi_pesan = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    const values = [row.nama_lengkap, row.email, row.no_hp, row.isi_pesan, id];
    db.query(query, values, (err, result) => {
      if (err) return reject(err);
      resolve(result); // result.affectedRows === 0 → id tidak ada
    });
  });
};

/** DELETE satu pesan kontak permanen dari database */
exports.deleteKontak = (id) => {
  return new Promise((resolve, reject) => {
    db.query("DELETE FROM kontak WHERE id = ?", [id], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

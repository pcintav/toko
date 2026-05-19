/**
 * pesanModel.js — INSERT pesan dari form kontak beranda.
 *
 * Beda dengan kontakModel.js yang dipakai admin untuk GET/PUT/DELETE.
 * Alur: POST /api/users/contact → pesanController → createPesan (file ini).
 */

const db = require("../config/db");

/**
 * Menyimpan satu pesan pengunjung ke tabel `kontak`.
 * @param {object} userPesan — { nama_lengkap, email, no_hp, isi_pesan }
 * @returns {Promise<object>} result MySQL — result.insertId = id baris baru
 */
exports.createPesan = (userPesan) => {
  return new Promise((resolve, reject) => {
    const query = `
      INSERT INTO kontak 
      (nama_lengkap, email, no_hp, isi_pesan) 
      VALUES (?, ?, ?, ?)
    `;

    // Urutan ? harus sama dengan urutan kolom di INSERT
    const values = [
      userPesan.nama_lengkap,
      userPesan.email,
      userPesan.no_hp,
      userPesan.isi_pesan
    ];

    db.query(query, values, (err, result) => {
      if (err) return reject(err); // error SQL → ditangkap catch di controller
      resolve(result); // sukses: { insertId, affectedRows, ... }
    });
  });
};

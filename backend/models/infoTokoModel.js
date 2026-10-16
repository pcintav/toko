/**
 * Model — tabel `info_toko` (satu baris: data toko di beranda / kontak).
 * Rekening bank ada di tabel `bank` (bukan kolom di sini).
 */

const db = require("../config/db");

/**
 * SELECT * LIMIT 1 — desain latihan: hanya ada satu toko (satu baris info_toko).
 * Dipakai beranda, footer, dan form admin info toko.
 */
exports.findInfoToko = () => {
  return new Promise((resolve, reject) => {
    db.query("SELECT * FROM info_toko LIMIT 1", (err, results) => {
      if (err) return reject(err);
      if (!results || results.length === 0) return resolve(null);
      resolve(results[0]);
    });
  });
};

/**
 * Update satu baris info toko (tanpa kolom bank — kelola lewat tabel bank).
 */
exports.updateInfoToko = (row) => {
  return new Promise((resolve, reject) => {
    const query = `
      UPDATE info_toko SET
        logo_toko = ?,
        nama_toko = ?,
        tentang = ?,
        foto_banner = ?,
        alamat_toko = ?,
        email_toko = ?,
        tlp_toko = ?,
        jam_buka = ?,
        jam_tutup = ?,
        logo_wa = ?,
        logo_ig = ?,
        logo_fb = ?,
        link_wa = ?,
        link_ig = ?,
        link_fb = ?,
        updated_at = CURRENT_TIMESTAMP
      LIMIT 1
    `;
    const values = [
      row.logo_toko,
      row.nama_toko,
      row.tentang,
      row.foto_banner,
      row.alamat_toko,
      row.email_toko,
      row.tlp_toko,
      row.jam_buka,
      row.jam_tutup,
      row.logo_wa,
      row.logo_ig,
      row.logo_fb,
      row.link_wa,
      row.link_ig,
      row.link_fb,
    ];
    db.query(query, values, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

/** INSERT baris pertama saat tabel info_toko masih kosong (upsert di controller). */
exports.insertInfoToko = (row) => {
  return new Promise((resolve, reject) => {
    const query = `
      INSERT INTO info_toko (
        logo_toko, nama_toko, tentang, foto_banner, alamat_toko, email_toko, tlp_toko,
        jam_buka, jam_tutup,
        logo_wa, logo_ig, logo_fb, link_wa, link_ig, link_fb
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      row.logo_toko,
      row.nama_toko,
      row.tentang,
      row.foto_banner,
      row.alamat_toko,
      row.email_toko,
      row.tlp_toko,
      row.jam_buka,
      row.jam_tutup,
      row.logo_wa,
      row.logo_ig,
      row.logo_fb,
      row.link_wa,
      row.link_ig,
      row.link_fb,
    ];
    db.query(query, values, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

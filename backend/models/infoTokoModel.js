/**
 * Model — tabel `info_toko` (biasanya satu baris: data toko di beranda / kontak).
 * Kolom mengikuti backend/toko_online.sql: tentang, foto_banner, dll.
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
 * Update satu baris info toko (semua kolom bisnis di-set ulang).
 * Tidak mengubah created_at; updated_at diisi MySQL.
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
        nama_bank_a = ?,
        nama_bank_b = ?,
        no_rek_a = ?,
        no_rek_b = ?,
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
    // Urutan values harus sama dengan urutan ? di query UPDATE di atas
    const values = [
      row.logo_toko,      // path /uploads/images/... dari upload admin
      row.nama_toko,
      row.tentang,        // teks HTML/deskripsi toko
      row.foto_banner,
      row.alamat_toko,
      row.email_toko,
      row.tlp_toko,
      row.nama_bank_a,    // rekening transfer A
      row.nama_bank_b,
      row.no_rek_a,
      row.no_rek_b,
      row.jam_buka,       // integer jam (0–23)
      row.jam_tutup,
      row.logo_wa,        // ikon + link sosial media
      row.logo_ig,
      row.logo_fb,
      row.link_wa,
      row.link_ig,
      row.link_fb,
    ];
    db.query(query, values, (err, result) => {
      if (err) return reject(err);
      resolve(result); // affectedRows 0 jika belum ada baris → controller panggil insertInfoToko
    });
  });
};

/** INSERT baris pertama saat tabel info_toko masih kosong (upsert di controller). */
exports.insertInfoToko = (row) => {
  return new Promise((resolve, reject) => {
    const query = `
      INSERT INTO info_toko (
        logo_toko, nama_toko, tentang, foto_banner, alamat_toko, email_toko, tlp_toko,
        nama_bank_a, nama_bank_b, no_rek_a, no_rek_b, jam_buka, jam_tutup,
        logo_wa, logo_ig, logo_fb, link_wa, link_ig, link_fb
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      row.logo_toko,
      row.nama_toko,
      row.tentang,
      row.foto_banner,
      row.alamat_toko,
      row.email_toko,
      row.tlp_toko,
      row.nama_bank_a,
      row.nama_bank_b,
      row.no_rek_a,
      row.no_rek_b,
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

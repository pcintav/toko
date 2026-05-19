/**
 * Model — tabel `pembelian` + JOIN produk/users.
 * Dipakai admin (semua pesanan) dan pembeli (pesanan milik sendiri — lihat fungsi filter id_pembeli).
 */

const db = require("../config/db");

/** Daftar pesanan dengan info produk dan user pembeli (tanpa password). */
exports.findAllPembelianWithDetail = () => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT
        p.id,
        p.id_pembeli,
        p.id_produk,
        p.nama_pembeli,
        p.alamat_pembeli,
        p.phone_pembeli,
        p.metode_pembayaran,
        p.pembayaran,
        p.pengiriman,
        p.status,
        p.catatan,
        p.foto_bukti,
        p.created_at,
        p.updated_at,
        pr.nama_produk AS nama_produk,
        pr.harga AS harga,
        pr.gambar AS gambar_produk,
        u.email AS email_pembeli,
        u.uname AS uname_pembeli
      FROM pembelian p
      INNER JOIN produk pr ON pr.id_produk = p.id_produk
      INNER JOIN users u ON u.id = p.id_pembeli
      ORDER BY p.id DESC
    `;
    db.query(query, (err, results) => {
      if (err) return reject(err);
      resolve(results || []);
    });
  });
};

exports.findPembelianById = (id) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT
        p.id,
        p.id_pembeli,
        p.id_produk,
        p.nama_pembeli,
        p.alamat_pembeli,
        p.phone_pembeli,
        p.metode_pembayaran,
        p.pembayaran,
        p.pengiriman,
        p.status,
        p.catatan,
        p.foto_bukti,
        p.created_at,
        p.updated_at,
        pr.nama_produk AS nama_produk,
        pr.harga AS harga,
        pr.gambar AS gambar_produk
      FROM pembelian p
      INNER JOIN produk pr ON pr.id_produk = p.id_produk
      WHERE p.id = ?
      LIMIT 1
    `;
    db.query(query, [id], (err, results) => {
      if (err) return reject(err);
      if (!results || results.length === 0) return resolve(null);
      resolve(results[0]);
    });
  });
};

/**
 * Update field yang diizinkan admin (whitelist — cegah ubah id_pembeli/id_produk sembarangan).
 */
exports.deletePembelian = (id) => {
  return new Promise((resolve, reject) => {
    db.query("DELETE FROM pembelian WHERE id = ?", [id], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

exports.updatePembelianAdminFields = (id, fields) => {
  return new Promise((resolve, reject) => {
    const query = `
      UPDATE pembelian SET
        metode_pembayaran = ?,
        pembayaran = ?,
        pengiriman = ?,
        status = ?,
        catatan = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    const values = [
      fields.metode_pembayaran,
      fields.pembayaran,
      fields.pengiriman,
      fields.status,
      fields.catatan ?? null,
      id
    ];
    db.query(query, values, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

/**
 * Pembeli membuat pesanan baru (satu baris = satu produk per skema latihan).
 * Kolom pembayaran & status memakai DEFAULT di MySQL (Belum, Tertunda).
 */
exports.insertPembelian = (row) => {
  return new Promise((resolve, reject) => {
    const query = `
      INSERT INTO pembelian (
        id_pembeli, id_produk, nama_pembeli, alamat_pembeli, phone_pembeli,
        metode_pembayaran, pengiriman, catatan, foto_bukti
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      row.id_pembeli,
      row.id_produk,
      row.nama_pembeli,
      row.alamat_pembeli,
      row.phone_pembeli,
      row.metode_pembayaran,
      row.pengiriman,
      row.catatan ?? null,
      row.foto_bukti ?? null
    ];
    db.query(query, values, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

/** Daftar pesanan satu pembeli + detail produk (hanya milik id_pembeli itu). */
exports.findPembelianByPembeliIdWithDetail = (id_pembeli) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT
        p.id,
        p.id_pembeli,
        p.id_produk,
        p.nama_pembeli,
        p.alamat_pembeli,
        p.phone_pembeli,
        p.metode_pembayaran,
        p.pembayaran,
        p.pengiriman,
        p.status,
        p.catatan,
        p.foto_bukti,
        p.created_at,
        p.updated_at,
        pr.nama_produk AS nama_produk,
        pr.harga AS harga_produk,
        pr.gambar AS gambar_produk
      FROM pembelian p
      INNER JOIN produk pr ON pr.id_produk = p.id_produk
      WHERE p.id_pembeli = ?
      ORDER BY p.id DESC
    `;
    db.query(query, [id_pembeli], (err, results) => {
      if (err) return reject(err);
      resolve(results || []);
    });
  });
};

/** Ringkasan dashboard pembeli — hanya baris WHERE id_pembeli = ? */
exports.getStatsByPembeliId = (id_pembeli) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT
        COUNT(*) AS total_pesanan,
        SUM(CASE WHEN pembayaran = 'Belum' THEN 1 ELSE 0 END) AS belum_dibayar,
        SUM(CASE WHEN status NOT IN ('Selesai', 'Diterima') THEN 1 ELSE 0 END) AS pesanan_aktif,
        (
          SELECT COALESCE(SUM(pr.harga), 0)
          FROM pembelian pb
          INNER JOIN produk pr ON pr.id_produk = pb.id_produk
          WHERE pb.id_pembeli = ? AND pb.pembayaran = 'Dibayar'
        ) AS total_belanja_dibayar
      FROM pembelian
      WHERE id_pembeli = ?
    `;
    db.query(query, [id_pembeli, id_pembeli], (err, results) => {
      if (err) return reject(err);
      resolve(results?.[0] || {});
    });
  });
};

/**
 * Detail satu pesanan — WAJIB cocok id pesanan DAN id_pembeli dari JWT.
 * Pembeli A tidak bisa membuka /pembelian/99 milik pembeli B (WHERE ... AND id_pembeli = ?).
 */
exports.findPembelianByIdAndPembeliId = (id_order, id_pembeli) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT
        p.id,
        p.id_pembeli,
        p.id_produk,
        p.nama_pembeli,
        p.alamat_pembeli,
        p.phone_pembeli,
        p.metode_pembayaran,
        p.pembayaran,
        p.pengiriman,
        p.status,
        p.catatan,
        p.foto_bukti,
        p.created_at,
        p.updated_at,
        pr.nama_produk AS nama_produk,
        pr.harga AS harga_produk,
        pr.gambar AS gambar_produk
      FROM pembelian p
      INNER JOIN produk pr ON pr.id_produk = p.id_produk
      WHERE p.id = ? AND p.id_pembeli = ?
      LIMIT 1
    `;
    db.query(query, [id_order, id_pembeli], (err, results) => {
      if (err) return reject(err);
      if (!results || results.length === 0) return resolve(null);
      resolve(results[0]);
    });
  });
};

/**
 * Model — tabel `produk` (akses data saja).
 * Dipakai **admin** (CRUD) dan **pembeli** (baca katalog lewat pembeliController).
 */

const db = require("../config/db");

const COLS =
  "id_produk, nama_produk, deskripsi, harga, gambar, kategori, stok, aktif, created_at, updated_at";

/**
 * SELECT produk dengan filter opsional.
 * @param {object} [opts]
 * @param {string} [opts.q] — cari di nama/deskripsi (LIKE)
 * @param {string} [opts.kategori] — cocok nama kategori
 * @param {boolean} [opts.hanyaAktif] — true = katalog publik (aktif = 1)
 */
exports.findAllProduk = (opts = {}) => {
  return new Promise((resolve, reject) => {
    const { q, kategori, hanyaAktif = false } = opts;
    let sql = `SELECT ${COLS} FROM produk WHERE 1=1`;
    const params = [];

    if (hanyaAktif) {
      sql += " AND aktif = 1";
    }
    if (kategori && String(kategori).trim() !== "") {
      sql += " AND kategori = ?";
      params.push(String(kategori).trim());
    }
    if (q && String(q).trim() !== "") {
      const like = `%${String(q).trim()}%`;
      sql += " AND (nama_produk LIKE ? OR deskripsi LIKE ?)";
      params.push(like, like);
    }

    sql += " ORDER BY id_produk DESC";

    db.query(sql, params, (err, results) => {
      if (err) return reject(err);
      resolve(results || []);
    });
  });
};

/** Satu produk by primary key `id_produk`. */
exports.findProdukById = (id_produk) => {
  return new Promise((resolve, reject) => {
    db.query(
      `SELECT ${COLS} FROM produk WHERE id_produk = ? LIMIT 1`,
      [id_produk],
      (err, results) => {
        if (err) return reject(err);
        if (!results || results.length === 0) return resolve(null);
        resolve(results[0]);
      }
    );
  });
};

/**
 * Tambah produk baru.
 * @param {object} row — nama_produk, deskripsi, harga, gambar, kategori, stok, aktif
 */
exports.insertProduk = (row) => {
  return new Promise((resolve, reject) => {
    const query = `
      INSERT INTO produk (nama_produk, deskripsi, harga, gambar, kategori, stok, aktif)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      row.nama_produk,
      row.deskripsi,
      row.harga,
      row.gambar ?? null,
      row.kategori,
      row.stok ?? 0,
      row.aktif ? 1 : 0
    ];
    db.query(query, values, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

/** UPDATE penuh satu produk by id_produk (admin edit form). */
exports.updateProduk = (id_produk, row) => {
  return new Promise((resolve, reject) => {
    const query = `
      UPDATE produk SET
        nama_produk = ?, deskripsi = ?, harga = ?, gambar = ?, kategori = ?,
        stok = ?, aktif = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id_produk = ?
    `;
    const values = [
      row.nama_produk,
      row.deskripsi,
      row.harga,
      row.gambar ?? null,
      row.kategori,
      row.stok ?? 0,
      row.aktif ? 1 : 0,
      id_produk
    ];
    db.query(query, values, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

/**
 * Kurangi stok 1 unit secara aman (hanya jika aktif dan stok > 0).
 * @returns {Promise<boolean>} true jika stok berhasil dikurangi
 */
exports.decrementStokIfAvailable = (id_produk) => {
  return new Promise((resolve, reject) => {
    db.query(
      `UPDATE produk SET stok = stok - 1, updated_at = CURRENT_TIMESTAMP
       WHERE id_produk = ? AND aktif = 1 AND stok > 0`,
      [id_produk],
      (err, result) => {
        if (err) return reject(err);
        resolve(result.affectedRows === 1);
      }
    );
  });
};

/** Kembalikan stok +1 (jika INSERT pesanan gagal setelah stok dikurangi). */
exports.incrementStok = (id_produk) => {
  return new Promise((resolve, reject) => {
    db.query(
      `UPDATE produk SET stok = stok + 1, updated_at = CURRENT_TIMESTAMP WHERE id_produk = ?`,
      [id_produk],
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
  });
};

exports.deleteProduk = (id_produk) => {
  return new Promise((resolve, reject) => {
    db.query("DELETE FROM produk WHERE id_produk = ?", [id_produk], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

/**
 * Model — tabel `produk` (akses data saja).
 * Dipakai **admin** (CRUD) dan **pembeli** (baca katalog lewat pembeliController).
 */

const db = require("../config/db");

/**
 * SELECT semua produk — dipakai admin (kelola) dan pembeli (katalog /toko).
 * ORDER BY id_produk DESC = produk terbaru muncul pertama.
 */
exports.findAllProduk = () => {
  return new Promise((resolve, reject) => {
    db.query(
      "SELECT id_produk, nama_produk, deskripsi, harga, gambar, kategori, created_at, updated_at FROM produk ORDER BY id_produk DESC",
      (err, results) => {
        if (err) return reject(err);
        resolve(results || []);
      }
    );
  });
};

/** Satu produk by primary key `id_produk`. */
exports.findProdukById = (id_produk) => {
  return new Promise((resolve, reject) => {
    db.query(
      "SELECT id_produk, nama_produk, deskripsi, harga, gambar, kategori, created_at, updated_at FROM produk WHERE id_produk = ? LIMIT 1",
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
 * @param {object} row — nama_produk, deskripsi, harga, gambar (opsional), kategori
 */
exports.insertProduk = (row) => {
  return new Promise((resolve, reject) => {
    const query = `
      INSERT INTO produk (nama_produk, deskripsi, harga, gambar, kategori)
      VALUES (?, ?, ?, ?, ?)
    `;
    const values = [
      row.nama_produk,
      row.deskripsi,
      row.harga,
      row.gambar ?? null, // null = tanpa gambar; path string dari upload admin
      row.kategori        // harus salah satu ENUM di MySQL (divalidasi di controller)
    ];
    db.query(query, values, (err, result) => {
      if (err) return reject(err);
      resolve(result); // result.insertId untuk respons POST
    });
  });
};

/** UPDATE penuh satu produk by id_produk (admin edit form). */
exports.updateProduk = (id_produk, row) => {
  return new Promise((resolve, reject) => {
    const query = `
      UPDATE produk SET
        nama_produk = ?, deskripsi = ?, harga = ?, gambar = ?, kategori = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id_produk = ?
    `;
    const values = [
      row.nama_produk,
      row.deskripsi,
      row.harga,
      row.gambar ?? null,
      row.kategori,
      id_produk
    ];
    db.query(query, values, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
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

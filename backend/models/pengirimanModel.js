/**
 * pengirimanModel.js — tabel master `pengiriman` (kurir/shipping).
 * Nama disimpan di pembelian.pengiriman (VARCHAR), divalidasi lewat tabel ini.
 */

const db = require("../config/db");

exports.findAll = () => {
  return new Promise((resolve, reject) => {
    db.query(
      "SELECT id, nama, created_at, updated_at FROM pengiriman ORDER BY nama ASC",
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
      "SELECT id, nama, created_at, updated_at FROM pengiriman WHERE id = ? LIMIT 1",
      [id],
      (err, results) => {
        if (err) return reject(err);
        if (!results?.length) return resolve(null);
        resolve(results[0]);
      }
    );
  });
};

exports.existsByNama = (nama) => {
  return new Promise((resolve, reject) => {
    db.query(
      "SELECT id FROM pengiriman WHERE nama = ? LIMIT 1",
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
    db.query("INSERT INTO pengiriman (nama) VALUES (?)", [nama], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

exports.update = (id, nama) => {
  return new Promise((resolve, reject) => {
    db.query(
      "UPDATE pengiriman SET nama = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
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
    db.query("DELETE FROM pengiriman WHERE id = ?", [id], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

exports.countPembelianByNama = (nama) => {
  return new Promise((resolve, reject) => {
    db.query(
      "SELECT COUNT(*) AS n FROM pembelian WHERE pengiriman = ?",
      [nama],
      (err, results) => {
        if (err) return reject(err);
        resolve(results?.[0]?.n ?? 0);
      }
    );
  });
};

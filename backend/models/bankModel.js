/**
 * bankModel.js — tabel master `bank` (rekening transfer toko).
 * Menggantikan kolom nama_bank_a/b + no_rek_a/b di info_toko.
 */

const db = require("../config/db");

const COLS = "id, nama_bank, no_rek, atas_nama, created_at, updated_at";

exports.findAll = () => {
  return new Promise((resolve, reject) => {
    db.query(`SELECT ${COLS} FROM bank ORDER BY id ASC`, (err, results) => {
      if (err) return reject(err);
      resolve(results || []);
    });
  });
};

exports.findById = (id) => {
  return new Promise((resolve, reject) => {
    db.query(
      `SELECT ${COLS} FROM bank WHERE id = ? LIMIT 1`,
      [id],
      (err, results) => {
        if (err) return reject(err);
        if (!results?.length) return resolve(null);
        resolve(results[0]);
      }
    );
  });
};

exports.insert = (row) => {
  return new Promise((resolve, reject) => {
    db.query(
      "INSERT INTO bank (nama_bank, no_rek, atas_nama) VALUES (?, ?, ?)",
      [row.nama_bank, row.no_rek, row.atas_nama || null],
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
  });
};

exports.update = (id, row) => {
  return new Promise((resolve, reject) => {
    db.query(
      `UPDATE bank SET nama_bank = ?, no_rek = ?, atas_nama = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [row.nama_bank, row.no_rek, row.atas_nama || null, id],
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
  });
};

exports.remove = (id) => {
  return new Promise((resolve, reject) => {
    db.query("DELETE FROM bank WHERE id = ?", [id], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

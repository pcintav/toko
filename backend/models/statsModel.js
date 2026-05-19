/**
 * statsModel.js — agregat angka untuk dashboard (tanpa logika HTTP).
 *
 * Dipanggil adminController.getStats dan pembeliController.getDashboard (query berbeda).
 */

const db = require("../config/db");

/**
 * Satu baris berisi banyak subquery COUNT/SUM — efisien untuk kartu statistik admin.
 * Setiap (SELECT COUNT(*) ...) dihitung terpisah di MySQL.
 */
exports.getAdminStats = () => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT
        (SELECT COUNT(*) FROM users WHERE role = 'pembeli') AS jumlah_pembeli,
        (SELECT COUNT(*) FROM pembelian) AS jumlah_transaksi,
        (SELECT COUNT(*) FROM produk) AS jumlah_produk,
        (SELECT COUNT(*) FROM pembelian) AS produk_terjual,
        (SELECT COUNT(*) FROM artikel) AS jumlah_artikel,
        (SELECT COUNT(*) FROM kontak) AS jumlah_kontak,
        (SELECT COUNT(*) FROM pembelian WHERE status NOT IN ('Selesai', 'Diterima')) AS pesanan_aktif,
        (SELECT COUNT(*) FROM pembelian WHERE pembayaran = 'Belum') AS belum_dibayar,
        (
          SELECT COALESCE(SUM(pr.harga), 0)
          FROM pembelian pb
          INNER JOIN produk pr ON pr.id_produk = pb.id_produk
          WHERE pb.pembayaran = 'Dibayar'
        ) AS total_pendapatan
    `;
    db.query(query, (err, results) => {
      if (err) return reject(err);
      resolve(results[0] || {}); // satu objek: { jumlah_pembeli, ... }
    });
  });
};

/**
 * N pesanan terakhir dengan nama produk — untuk widget "transaksi terbaru" di dashboard admin.
 * @param {number} limit — default 5 di controller
 */
exports.getRecentPembelian = (limit = 5) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT
        p.id,
        p.nama_pembeli,
        p.status,
        p.pembayaran,
        p.created_at,
        pr.nama_produk,
        pr.harga
      FROM pembelian p
      INNER JOIN produk pr ON pr.id_produk = p.id_produk
      ORDER BY p.id DESC
      LIMIT ?
    `;
    db.query(query, [limit], (err, results) => {
      if (err) return reject(err);
      resolve(results || []);
    });
  });
};

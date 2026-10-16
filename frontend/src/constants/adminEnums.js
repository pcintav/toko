/**
 * constants/adminEnums.js — konstanta pilihan yang masih ENUM di MySQL.
 *
 * Kategori produk, pengiriman, dan bank diambil dari API (tabel master).
 * File ini hanya untuk status pesanan, metode bayar, dan kelamin.
 */

export const KELAMIN = ['Laki-laki', 'Perempuan'];

/** Metode pembayaran — masih ENUM di kolom pembelian.metode_pembayaran */
export const METODE_BAYAR = ['Bank Transfer', 'COD'];

/** Status alur pesanan (admin update, pembeli lihat) — konsekuensi di utils/statusPesanan.js */
export const STATUS_PROSES = ['Tertunda', 'Dikemas', 'Dikirim', 'Diterima', 'Selesai'];
export const STATUS_BAYAR = ['Belum', 'Dibayar'];

export { STATUS_ARTI, konsekuensiStatus } from '../utils/statusPesanan';

/**
 * constants/adminEnums.js — konstanta pilihan form panel admin & pembeli.
 *
 * Nilai tetap untuk dropdown kategori produk, metode bayar, kurir, dan status pesanan.
 * Dipakai halaman admin produk/pembelian dan form pembeli.
 */

// Opsi jenis kelamin di form user/pembeli
export const KELAMIN = ['Laki-laki', 'Perempuan'];

// Dropdown kategori saat admin menambah/edit produk
export const KATEGORI_PRODUK = ['Mango Sticky Rice', 'Mango Pudding', 'Mango Milkshake'];
// Metode pembayaran di form pembelian
export const METODE_BAYAR = ['Bank Transfer', 'COD'];
// Kurir pengiriman
export const SHIPPING = ['JNT Express', 'JNE'];
// Status alur pesanan (admin update, pembeli lihat)
export const STATUS_PROSES = ['Tertunda', 'Dikemas', 'Dikirim', 'Diterima', 'Selesai'];
export const STATUS_BAYAR = ['Belum', 'Dibayar'];

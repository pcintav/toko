/**
 * utils/beli.js — helper navigasi tombol "Beli".
 *
 * Membangun URL `/akun/belanja?produk=...` agar checkout langsung memilih produk.
 * Dipakai ProductCard dan ProductDetailPage.
 */

/** URL belanja dengan produk terpilih (query untuk auto-checkout di PembeliBelanjaPage). */
export function belanjaUrl(idProduk) {
  return `/akun/belanja?produk=${idProduk}`;
}

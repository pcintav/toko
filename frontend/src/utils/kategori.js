/**
 * utils/kategori.js — logika kategori produk dari data API.
 *
 * Mengekstrak daftar kategori unik, grid beranda, dan banner promo per kategori.
 * Dipakai TokoPage, HomePage, PromoKategori, KategoriGrid, useBerandaData.
 */
export const LABEL_SEMUA = 'Semua';

/** Kategori unik dari baris produk di database (urut abjad). */
export function kategoriDariProduk(produk = []) {
  const set = new Set();
  for (const p of produk) {
    if (p.kategori) set.add(p.kategori);
  }
  return [...set].sort((a, b) => a.localeCompare(b, 'id'));
}

/** Satu produk per kategori (untuk banner promo di beranda). */
export function produkPerKategori(produk = []) {
  const map = new Map();
  for (const p of produk) {
    if (p.kategori && !map.has(p.kategori)) {
      map.set(p.kategori, p);
    }
  }
  return [...map.entries()].map(([kategori, item]) => ({ kategori, produk: item }));
}

/** Tiga kategori pertama untuk grid beranda beserta jumlah item per kategori. */
export function kategoriGridData(produk = [], limit = 3) {
  return produkPerKategori(produk)
    .slice(0, limit)
    .map(({ kategori, produk: item }) => ({
      kategori,
      produk: item,
      jumlah: produk.filter((p) => p.kategori === kategori).length,
    }));
}

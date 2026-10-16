/**
 * utils/kategori.js — logika kategori produk dari data API.
 *
 * Preferensi: daftar nama dari tabel master `kategori_produk` (GET /kategori).
 * Fallback: unik dari kolom produk.kategori jika master belum termuat.
 * Dipakai TokoPage, HomePage, PromoKategori, KategoriGrid, useBerandaData.
 */
export const LABEL_SEMUA = 'Semua';

/**
 * Nama kategori dari respons master API: [{ id, nama }, ...]
 * @returns {string[]}
 */
export function namaDariMasterKategori(rows = []) {
  return (rows || [])
    .map((r) => (r && r.nama != null ? String(r.nama).trim() : ''))
    .filter(Boolean);
}

/** Kategori unik dari baris produk (fallback jika master kosong). */
export function kategoriDariProduk(produk = []) {
  const set = new Set();
  for (const p of produk) {
    if (p.kategori) set.add(p.kategori);
  }
  return [...set].sort((a, b) => a.localeCompare(b, 'id'));
}

/**
 * Daftar filter tab: utamakan master; jika master kosong pakai dari produk.
 */
export function daftarFilterKategori(masterRows = [], produk = []) {
  const dariMaster = namaDariMasterKategori(masterRows);
  if (dariMaster.length > 0) return dariMaster;
  return kategoriDariProduk(produk);
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

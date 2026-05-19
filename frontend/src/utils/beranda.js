/**
 * utils/beranda.js — teks promosi halaman beranda.
 *
 * Mengutamakan kolom `tentang` dari info toko; fallback daftar kategori produk.
 * Dipakai BannerMid di HomePage.
 */

/**
 * Teks promosi banner tengah beranda:
 * 1. Pakai kolom tentang dari info toko jika ada
 * 2. Else susun kalimat dari daftar kategori produk
 * 3. Else kalimat generik nama toko
 */
export function taglineBeranda(info, kategoriList = []) {
  const tentang = String(info?.tentang || '').trim();
  if (tentang) return tentang;

  const nama = info?.nama_toko || 'Toko kami';
  if (kategoriList.length >= 2) {
    const cats = kategoriList.slice(0, 3).join(', ');
    const sisa = kategoriList.length > 3 ? ', dan produk lainnya' : '';
    return `${nama} menyediakan ${cats}${sisa} — pilihan lengkap, kualitas terbaik, siap memenuhi kebutuhan Anda setiap hari.`;
  }
  return `${nama} menyediakan berbagai produk segar dan berkualitas — belanja mudah, aman, dan terpercaya untuk kebutuhan harian Anda.`;
}

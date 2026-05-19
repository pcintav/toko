/**
 * utils/format.js — pemformatan tampilan angka dan tanggal (locale Indonesia).
 *
 * Rupiah, tanggal panjang, nilai input date, dan jam operasional toko.
 * Dipakai komponen produk, admin, TrustBar, dan form profil.
 */

/** Ubah angka menjadi string mata uang IDR untuk kartu produk & tabel. */
export function formatRupiah(n) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(n) || 0);
}

/** ISO dari database → tanggal panjang bahasa Indonesia. */
export function formatTanggal(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/** Nilai untuk input type="date" (YYYY-MM-DD) dari DB atau string tanggal. */
export function toDateInputValue(value) {
  if (value == null || value === '') return '';
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  const s = String(value).trim();
  const iso = s.match(/^(\d{4}-\d{2}-\d{2})/);
  if (iso) return iso[1];
  const d = new Date(s);
  if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  return '';
}

/** Gabungkan jam buka/tutup numerik menjadi teks "08:00 – 17:00 WIB". */
export function jamOperasional(jamBuka, jamTutup) {
  if (jamBuka == null || jamTutup == null) return '';
  return `${jamBuka}:00 – ${jamTutup}:00 WIB`;
}

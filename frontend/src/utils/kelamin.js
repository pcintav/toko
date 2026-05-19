/**
 * utils/kelamin.js — normalisasi nilai jenis kelamin form & tabel.
 *
 * Menyamakan data lama (L/P) ke label "Laki-laki" / "Perempuan".
 * Dipakai form register, profil admin/pembeli, dan halaman kelola pembeli.
 */
import { KELAMIN } from '../constants/adminEnums';

/** Tampilkan / pilih kelamin seragam (termasuk data lama L/P dari database). */
export function normalizeKelamin(value) {
  const s = String(value || '').trim();
  if (s === 'L') return 'Laki-laki';
  if (s === 'P') return 'Perempuan';
  if (KELAMIN.includes(s)) return s;
  return KELAMIN[0];
}

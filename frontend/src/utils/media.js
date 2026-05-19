/**
 * utils/media.js — utilitas URL gambar upload dan placeholder.
 *
 * Mengubah path dari database (`/uploads/...`) menjadi URL penuh backend.
 * Dipakai kartu produk, header, admin, dan halaman profil.
 */
const API_BASE = import.meta.env.VITE_API_URL || '';

/** Gambar default saat belum ada upload (file di frontend/public). */
export const PLACEHOLDER_IMAGE = '/placeholder.png';

// Nilai path yang dianggap "kosong" di database
const EMPTY_VALUES = new Set(['', 'default.jpg', 'default-logo.jpg']);

/** Path dari DB punya file upload yang valid (bukan kosong / default). */
export function hasMedia(path) {
  if (path == null) return false;
  const p = String(path).trim().toLowerCase();
  return p !== '' && !EMPTY_VALUES.has(p);
}

/**
 * Bangun URL tampilan untuk <img src>:
 * - path kosong → placeholder lokal
 * - sudah http(s) → pakai apa adanya
 * - /uploads/... → gabung dengan API_BASE
 */
export function mediaUrl(path) {
  if (!hasMedia(path)) return PLACEHOLDER_IMAGE;
  const p = String(path).trim();
  if (p.startsWith('http://') || p.startsWith('https://')) return p;
  if (p.startsWith('/uploads')) return `${API_BASE}${p}`;
  return `${API_BASE}/uploads/images/${p}`;
}

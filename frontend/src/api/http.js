/**
 * api/http.js — lapisan HTTP dasar frontend.
 *
 * Semua modul API (client, adminApi, pembeliApi) memakai fungsi di file ini.
 * Alur satu panggilan API:
 *   Komponen/halaman → adminApi.getProduk() → apiRequest('/api/admin/produk')
 *     → fetch(API_BASE + path, headers + Bearer token) → JSON body
 */

// Vite membaca .env.development; fallback ke backend lokal port 5000
export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Header Authorization untuk request yang butuh login.
 * Token disimpan di localStorage oleh utils/auth saat login berhasil.
 */
export function authHeaders() {
  const token = localStorage.getItem('toko_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Wrapper fetch terpusat — semua API JSON (bukan multipart) lewat sini.
 * @param {string} path — path relatif, mis. '/api/users/produk'
 * @param {RequestInit} options — method, body, headers tambahan
 * @returns {Promise<object>} body JSON dari backend (biasanya { message, data })
 */
export async function apiRequest(path, options = {}) {
  // Path absolut (http...) dipakai apa adanya; selain itu digabung dengan API_BASE
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`;

  const headers = {
    'Content-Type': 'application/json',
    ...authHeaders(), // Bearer token jika user sudah login
    ...options.headers,
  };

  let res;
  try {
    res = await fetch(url, { ...options, headers });
  } catch {
    // fetch throw = jaringan mati / backend tidak listen → pesan ramah untuk pelajar
    throw new Error(
      'Backend tidak jalan. Buka terminal di folder backend, lalu jalankan: npm run dev (port 5000).'
    );
  }

  // Backend selalu JSON; jika body kosong, pakai objek kosong agar tidak crash
  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new Error(body.message || 'Permintaan gagal');
    err.status = res.status; // 400, 401, 403, 404, 500 — dipakai handleError di hooks
    err.body = body; // mis. { allowed: [...] } dari validasi ENUM
    throw err;
  }

  return body;
}

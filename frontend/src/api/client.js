/**
 * api/client.js — klien API publik (tanpa panel admin/pembeli khusus).
 *
 * Memanggil endpoint `/api/users/*` untuk katalog, artikel, info toko, kontak,
 * login, register, dan cek sesi. Dipakai halaman beranda, toko, artikel, login/daftar.
 */
import { apiRequest } from './http';

/** Objek metode API untuk pengunjung dan autentikasi umum. */
export const api = {
  // -------------------------------------------------------------------------
  // Katalog & konten publik — tidak wajib login
  // -------------------------------------------------------------------------
  // GET /api/users/produk — daftar semua produk untuk beranda/toko
  getProduk: () => apiRequest('/api/users/produk'),
  // GET /api/users/produk/:id — detail satu produk (halaman ProductDetailPage)
  getProdukById: (id) => apiRequest(`/api/users/produk/${id}`),
  // GET /api/users/info-toko — nama, logo, jam buka, rekening (header & footer)
  getInfoToko: () => apiRequest('/api/users/info-toko'),
  // GET /api/users/artikel — daftar artikel blog
  getArtikel: () => apiRequest('/api/users/artikel'),
  // GET /api/users/artikel/:id — isi lengkap satu artikel
  getArtikelById: (id) => apiRequest(`/api/users/artikel/${id}`),
  // POST /api/users/contact — kirim pesan form kontak beranda (body: nama, email, pesan)
  postKontak: (payload) =>
    apiRequest('/api/users/contact', { method: 'POST', body: JSON.stringify(payload) }),

  // -------------------------------------------------------------------------
  // Autentikasi — dipakai LoginPage & RegisterPage
  // -------------------------------------------------------------------------
  // POST /api/users/login — body: { credential, passwd }; balasan berisi token + role
  login: (credential, passwd) =>
    apiRequest('/api/users/login', {
      method: 'POST',
      body: JSON.stringify({ credential, passwd }),
    }),

  // POST /api/users/register — body: data pendaftaran pembeli baru
  register: (payload) =>
    apiRequest('/api/users/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // -------------------------------------------------------------------------
  // Cek sesi — validasi token yang masih tersimpan di localStorage
  // -------------------------------------------------------------------------
  // GET /api/users/me — profil pembeli (RequireAuth / setelah login pembeli)
  getPembeliMe: () => apiRequest('/api/users/me'),

  // GET /api/admin/me — profil admin (validasi token admin di login ganda)
  getAdminMe: () => apiRequest('/api/admin/me'),
};

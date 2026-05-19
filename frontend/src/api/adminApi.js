/**
 * api/adminApi.js — klien API panel admin (`/api/admin/*`).
 *
 * CRUD pengguna, produk, pembelian, artikel, kontak, info toko, statistik,
 * serta upload gambar multipart. Dipakai halaman `/admin/*` dan AdminShopContext.
 */
import { API_BASE, apiRequest, authHeaders } from './http';

export { API_BASE };

/** Semua operasi data yang memerlukan peran admin (header Bearer wajib). */
export const adminApi = {
  // -------------------------------------------------------------------------
  // Dashboard & profil admin yang sedang login
  // -------------------------------------------------------------------------
  // GET /api/admin/stats — angka ringkas untuk AdminOverviewPage
  getStats: () => apiRequest('/api/admin/stats'),
  // GET /api/admin/me — data profil dari JWT
  getMe: () => apiRequest('/api/admin/me'),
  // PUT /api/admin/me — ubah nama, foto, password (body JSON)
  putMe: (payload) =>
    apiRequest('/api/admin/me', { method: 'PUT', body: JSON.stringify(payload) }),

  // -------------------------------------------------------------------------
  // Pengguna — pembeli & akun lain (AdminPembeliPage, kelola user)
  // -------------------------------------------------------------------------
  // GET /api/admin/pembeli — daftar khusus role pembeli
  getPembeli: () => apiRequest('/api/admin/pembeli'),
  // GET /api/admin/users?role= — filter opsional per role
  getUsers: (role) => apiRequest(`/api/admin/users${role ? `?role=${role}` : ''}`),
  getUser: (id) => apiRequest(`/api/admin/users/${id}`),
  createUser: (payload) =>
    apiRequest('/api/admin/users', { method: 'POST', body: JSON.stringify(payload) }),
  updateUser: (id, payload) =>
    apiRequest(`/api/admin/users/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteUser: (id) => apiRequest(`/api/admin/users/${id}`, { method: 'DELETE' }),

  // -------------------------------------------------------------------------
  // Produk — AdminProdukPage
  // -------------------------------------------------------------------------
  getProduk: () => apiRequest('/api/admin/produk'),
  getProdukById: (id) => apiRequest(`/api/admin/produk/${id}`),
  createProduk: (payload) =>
    apiRequest('/api/admin/produk', { method: 'POST', body: JSON.stringify(payload) }),
  updateProduk: (id, payload) =>
    apiRequest(`/api/admin/produk/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteProduk: (id) => apiRequest(`/api/admin/produk/${id}`, { method: 'DELETE' }),

  // -------------------------------------------------------------------------
  // Pembelian / pesanan — AdminPembelianPage
  // -------------------------------------------------------------------------
  getPembelian: () => apiRequest('/api/admin/pembelian'),
  getPembelianById: (id) => apiRequest(`/api/admin/pembelian/${id}`),
  updatePembelian: (id, payload) =>
    apiRequest(`/api/admin/pembelian/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deletePembelian: (id) => apiRequest(`/api/admin/pembelian/${id}`, { method: 'DELETE' }),

  // -------------------------------------------------------------------------
  // Artikel blog — AdminArtikelPage
  // -------------------------------------------------------------------------
  getArtikel: () => apiRequest('/api/admin/artikel'),
  getArtikelById: (id) => apiRequest(`/api/admin/artikel/${id}`),
  createArtikel: (payload) =>
    apiRequest('/api/admin/artikel', { method: 'POST', body: JSON.stringify(payload) }),
  updateArtikel: (id, payload) =>
    apiRequest(`/api/admin/artikel/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteArtikel: (id) => apiRequest(`/api/admin/artikel/${id}`, { method: 'DELETE' }),

  // -------------------------------------------------------------------------
  // Pesan kontak — AdminKontakPage
  // -------------------------------------------------------------------------
  getKontak: () => apiRequest('/api/admin/kontak'),
  getKontakById: (id) => apiRequest(`/api/admin/kontak/${id}`),
  updateKontak: (id, payload) =>
    apiRequest(`/api/admin/kontak/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteKontak: (id) => apiRequest(`/api/admin/kontak/${id}`, { method: 'DELETE' }),

  // -------------------------------------------------------------------------
  // Info toko — AdminInfoTokoPage & AdminShopContext
  // -------------------------------------------------------------------------
  getInfoToko: () => apiRequest('/api/admin/info-toko'),
  updateInfoToko: (payload) =>
    apiRequest('/api/admin/info-toko', { method: 'PUT', body: JSON.stringify(payload) }),

  // -------------------------------------------------------------------------
  // Upload gambar — FormData, tidak lewat apiRequest (multipart)
  // -------------------------------------------------------------------------
  /** POST /api/admin/upload-gambar — field "gambar"; dipakai ImageUploadField */
  uploadGambar: async (file) => {
    const fd = new FormData();
    fd.append('gambar', file);
    let res;
    try {
      res = await fetch(`${API_BASE}/api/admin/upload-gambar`, {
        method: 'POST',
        headers: authHeaders(),
        body: fd,
      });
    } catch {
      throw new Error('Backend tidak jalan. Buka terminal di folder backend, lalu jalankan: npm run dev.');
    }
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new Error(body.message || 'Upload gagal');
      err.status = res.status;
      throw err;
    }
    return body;
  },
};

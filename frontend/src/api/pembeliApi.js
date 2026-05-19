/**
 * api/pembeliApi.js — klien API area pembeli (`/api/users/*` + token pembeli).
 *
 * Semua method di bawah ini membutuhkan login role `pembeli` (kecuali getProduk/getInfoToko
 * yang juga ada di client.js untuk halaman publik).
 * Dipakai: layout /akun/*, PembeliBelanjaPage, PembeliPesananPage, PembeliProfilPage.
 */
import { API_BASE, apiRequest, authHeaders } from './http';

export const pembeliApi = {
  // -------------------------------------------------------------------------
  // Dashboard & profil — halaman /akun dan /akun/profil
  // -------------------------------------------------------------------------
  // GET /api/users/dashboard — ringkasan pesanan + 5 pesanan terbaru
  getDashboard: () => apiRequest('/api/users/dashboard'),
  // GET /api/users/me — data profil tanpa password
  getMe: () => apiRequest('/api/users/me'),
  // PUT /api/users/me — ubah profil / ganti password (passwd + passwd_lama)
  putMe: (payload) =>
    apiRequest('/api/users/me', { method: 'PUT', body: JSON.stringify(payload) }),

  // -------------------------------------------------------------------------
  // Katalog — PembeliBelanjaPage (bisa juga pakai api.getProduk dari client)
  // -------------------------------------------------------------------------
  getProduk: () => apiRequest('/api/users/produk'),
  getProdukById: (id) => apiRequest(`/api/users/produk/${id}`),

  // -------------------------------------------------------------------------
  // Pesanan — checkout & riwayat
  // -------------------------------------------------------------------------
  // GET /api/users/pembelian — hanya pesanan milik pembeli yang login
  getPembelian: () => apiRequest('/api/users/pembelian'),
  getPembelianById: (id) => apiRequest(`/api/users/pembelian/${id}`),
  // POST /api/users/pembelian — body: id_produk, alamat, metode bayar, foto_bukti, dll.
  // id_pembeli TIDAK dikirim — diambil dari JWT di backend
  createPembelian: (payload) =>
    apiRequest('/api/users/pembelian', { method: 'POST', body: JSON.stringify(payload) }),

  // GET /api/users/info-toko — rekening bank untuk BankTransferInfo saat checkout
  getInfoToko: () => apiRequest('/api/users/info-toko'),

  /**
   * POST /api/users/upload-gambar — multipart, field "gambar".
   * Tidak lewat apiRequest karena Content-Type harus multipart (browser set boundary).
   * Hasil: body.data.path → disimpan ke foto profil atau foto_bukti pesanan.
   */
  uploadGambar: async (file) => {
    const fd = new FormData();
    fd.append('gambar', file);
    let res;
    try {
      res = await fetch(`${API_BASE}/api/users/upload-gambar`, {
        method: 'POST',
        headers: authHeaders(), // hanya Bearer, tanpa Content-Type JSON
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

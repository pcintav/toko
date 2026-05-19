/**
 * utils/auth.js — utilitas sesi login di browser (localStorage).
 *
 * Menyimpan/membaca token JWT dan peran pengguna. Dipakai AuthContext dan
 * http.js (authHeaders) tanpa ketergantungan React.
 */
const TOKEN_KEY = 'toko_token';
const ROLE_KEY = 'toko_role';

// ---------------------------------------------------------------------------
// Baca sesi — dipakai saat inisialisasi AuthProvider & authHeaders
// ---------------------------------------------------------------------------
export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getRole() {
  return localStorage.getItem(ROLE_KEY);
}

// ---------------------------------------------------------------------------
// Tulis / hapus sesi — setelah login sukses atau logout
// ---------------------------------------------------------------------------
export function saveSession(token, role) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(ROLE_KEY, role);
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ROLE_KEY);
}

// ---------------------------------------------------------------------------
// Helper boolean — cek cepat tanpa React context
// ---------------------------------------------------------------------------
export function isLoggedIn() {
  return Boolean(getToken());
}

export function isAdmin() {
  return getRole() === 'admin';
}

export function isPembeli() {
  return getRole() === 'pembeli';
}

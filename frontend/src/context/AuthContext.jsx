/**
 * context/AuthContext.jsx — konteks autentikasi global React.
 *
 * Menyimpan token & peran (admin/pembeli) di state + localStorage via utils/auth.
 * Membungkus seluruh app (App.jsx); dipakai Header, RequireAuth, halaman login.
 */
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { clearSession, getRole, getToken, saveSession } from '../utils/auth';

// Instance konteks — diisi oleh AuthProvider, dibaca lewat useAuth()
const AuthContext = createContext(null);

// ---------------------------------------------------------------------------
// AuthProvider — sumber kebenaran status login di seluruh pohon komponen
// ---------------------------------------------------------------------------
/** Provider: login/logout dan flag isAdmin / isPembeli untuk anak komponen. */
export function AuthProvider({ children }) {
  // State awal dihydrate dari localStorage agar refresh halaman tetap login
  const [token, setToken] = useState(() => getToken());
  const [role, setRole] = useState(() => getRole());

  // Dipanggil setelah API login sukses — simpan ke storage + state React
  const login = useCallback((newToken, newRole) => {
    saveSession(newToken, newRole);
    setToken(newToken);
    setRole(newRole);
  }, []);

  // Kosongkan sesi lokal dan state (Header tombol keluar, guard 401)
  const logout = useCallback(() => {
    clearSession();
    setToken(null);
    setRole(null);
  }, []);

  // Nilai yang diekspor ke konsumen — di-memo agar tidak re-render berlebihan
  const value = useMemo(
    () => ({
      token,
      role,
      isLoggedIn: Boolean(token),
      isAdmin: role === 'admin',
      isPembeli: role === 'pembeli',
      login,
      logout,
    }),
    [token, role, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ---------------------------------------------------------------------------
// useAuth — hook wajib di dalam AuthProvider
// ---------------------------------------------------------------------------
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth harus di dalam AuthProvider');
  return ctx;
}

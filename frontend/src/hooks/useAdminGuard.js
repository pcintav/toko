/**
 * hooks/useAdminGuard.js — penjaga sesi admin; redirect ke login jika 401/403.
 *
 * Dipakai AdminLayout, useAdminList, dan halaman admin saat API menolak token.
 */
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function useAdminGuard() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  /**
   * Tangani error dari fetch admin:
   * 1. Jika 401/403 → logout, arahkan ke /login dengan state.from = /admin
   * 2. Kembalikan true jika sudah ditangani (caller tidak perlu setError)
   * 3. Kembalikan false agar caller menampilkan pesan error biasa
   */
  const handleError = useCallback(
    (err) => {
      if (err?.status === 401 || err?.status === 403) {
        logout();
        navigate('/login', { replace: true, state: { from: '/admin' } });
        return true;
      }
      return false;
    },
    [logout, navigate]
  );

  return { handleError };
}

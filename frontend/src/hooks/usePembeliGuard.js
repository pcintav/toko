/**
 * hooks/usePembeliGuard.js — penjaga sesi pembeli; redirect ke login jika 401/403.
 *
 * Mirip useAdminGuard; state.from mengarah ke `/akun` setelah login ulang.
 */
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function usePembeliGuard() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  /**
   * Tangani error dari fetch pembeli:
   * 1. Jika 401/403 → logout, arahkan ke /login dengan state.from = /akun
   * 2. true = sudah redirect; false = tampilkan pesan di UI
   */
  const handleError = useCallback(
    (err) => {
      if (err?.status === 401 || err?.status === 403) {
        logout();
        navigate('/login', { replace: true, state: { from: '/akun' } });
        return true;
      }
      return false;
    },
    [logout, navigate]
  );

  return { handleError };
}

/**
 * hooks/usePembeliList.js — hook daftar data area pembeli.
 *
 * Memuat array dari pembeliApi dengan penanganan sesi kedaluwarsa.
 * Dipakai PembeliPesananPage dan halaman daftar lain di `/akun`.
 */
import { useCallback, useEffect, useState } from 'react';
import { usePembeliGuard } from './usePembeliGuard';

export function usePembeliList(apiFn) {
  const { handleError } = usePembeliGuard();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Sama pola useAdminList: fetch → rows / error / loading
  const reload = useCallback(() => {
    setLoading(true);
    setError('');
    return apiFn()
      .then((r) => setRows(Array.isArray(r.data) ? r.data : []))
      .catch((err) => {
        if (!handleError(err)) setError(err.message || 'Gagal memuat data');
      })
      .finally(() => setLoading(false));
  }, [apiFn, handleError]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { rows, loading, error, reload };
}

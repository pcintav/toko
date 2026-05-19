/**
 * hooks/useAdminList.js — hook daftar data CRUD panel admin.
 *
 * Memuat array dari fungsi adminApi (mis. getProduk), dengan reload dan penanganan error sesi.
 * Dipakai hampir semua halaman admin yang menampilkan tabel.
 */
import { useCallback, useEffect, useState } from 'react';
import { useAdminGuard } from './useAdminGuard';

/** Muat daftar API admin. Pass fungsi stabil, contoh: adminApi.getProduk */
export function useAdminList(apiFn) {
  const { handleError } = useAdminGuard();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Langkah reload: set loading → panggil apiFn → isi rows atau error
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

  // Muat otomatis saat mount atau apiFn berubah
  useEffect(() => {
    reload();
  }, [reload]);

  return { rows, loading, error, reload };
}

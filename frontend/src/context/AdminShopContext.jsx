/**
 * context/AdminShopContext.jsx — konteks info toko untuk panel admin.
 *
 * Memuat data info toko sekali (nama, logo, rekening) agar form admin konsisten.
 * Hanya aktif di dalam AdminLayout; terhubung ke adminApi.getInfoToko.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { adminApi } from '../api/adminApi';

const AdminShopContext = createContext(null);

// ---------------------------------------------------------------------------
// AdminShopProvider — cache info toko untuk sidebar & form admin
// ---------------------------------------------------------------------------
export function AdminShopProvider({ children }) {
  // null = belum dimuat atau gagal; object = data dari GET /api/admin/info-toko
  const [info, setInfo] = useState(null);

  // Muat ulang dari API — dipanggil setelah simpan info toko di AdminInfoTokoPage
  const reloadInfo = useCallback(() => {
    return adminApi
      .getInfoToko()
      .then((r) => {
        setInfo(r.data);
        return r.data;
      })
      .catch(() => {
        setInfo(null);
        return null;
      });
  }, []);

  // Fetch pertama kali provider dipasang di AdminLayout
  useEffect(() => {
    reloadInfo();
  }, [reloadInfo]);

  const value = useMemo(() => ({ info, reloadInfo }), [info, reloadInfo]);

  return <AdminShopContext.Provider value={value}>{children}</AdminShopContext.Provider>;
}

// ---------------------------------------------------------------------------
// useAdminShop — akses info toko + fungsi reload
// ---------------------------------------------------------------------------
export function useAdminShop() {
  const ctx = useContext(AdminShopContext);
  if (!ctx) throw new Error('useAdminShop harus di dalam AdminShopProvider');
  return ctx;
}

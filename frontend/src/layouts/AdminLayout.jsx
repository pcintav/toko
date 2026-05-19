/**
 * [buatan] Layout shell panel admin.
 *
 * Sidebar, topbar judul halaman, avatar admin, dan Outlet untuk halaman `/admin/*`.
 * URL dasar: `/admin`, `/admin/produk`, dll. Membungkus AdminShopProvider.
 */
import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AdminSidebar from '../components/admin/AdminSidebar';
import { AdminShopProvider } from '../context/AdminShopContext';
import { adminApi } from '../api/adminApi';
import { useAdminGuard } from '../hooks/useAdminGuard';
import { mediaUrl } from '../utils/media';

// Judul topbar per pathname — sinkron dengan menu sidebar
const TITLES = {
  '/admin': 'Dashboard',
  '/admin/produk': 'Kelola Produk',
  '/admin/pembeli': 'Kelola Pembeli',
  '/admin/pembelian': 'Kelola Pesanan',
  '/admin/artikel': 'Kelola Artikel',
  '/admin/kontak': 'Pesan Kontak',
  '/admin/info-toko': 'Info Toko',
  '/admin/profil': 'Profil Admin',
};

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false); // drawer sidebar di layar kecil
  const [adminName, setAdminName] = useState(''); // nama tampilan di topbar kanan
  const [adminFoto, setAdminFoto] = useState(''); // path foto profil admin
  const location = useLocation();
  const { handleError } = useAdminGuard();

  const title = TITLES[location.pathname] || 'Panel Admin';

  // Muat nama & foto admin untuk topbar
  useEffect(() => {
    let alive = true;
    adminApi
      .getMe()
      .then((r) => {
        if (!alive) return;
        const p = r.data;
        setAdminName(`${p.nama_d || ''} ${p.nama_b || ''}`.trim() || p.uname);
        setAdminFoto(p.foto || '');
      })
      .catch((err) => {
        if (alive) handleError(err);
      });
    return () => {
      alive = false;
    };
  }, [handleError, location.pathname]);

  return (
    // Provider info toko — dipakai sidebar & form admin di halaman anak
    <AdminShopProvider>
    <div className="admin-shell">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="admin-main">
        <header className="admin-topbar">
          <button
            type="button"
            className="admin-menu-btn"
            aria-label="Menu"
            onClick={() => setSidebarOpen(true)}
          >
            ☰
          </button>
          <h1 className="admin-page-title">{title}</h1>
          <div className="admin-topbar-user">
            <img
              src={mediaUrl(adminFoto)}
              alt=""
              width={32}
              height={32}
              className="admin-thumb admin-thumb--avatar admin-topbar-avatar"
            />
            <span className="admin-topbar-name text-secondary small">{adminName}</span>
          </div>
        </header>
        {/* Outlet: halaman admin aktif (AdminProdukPage, dll.) */}
        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </div>
    </AdminShopProvider>
  );
}

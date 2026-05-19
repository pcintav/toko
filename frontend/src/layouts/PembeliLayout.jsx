/**
 * [buatan] Layout shell area pembeli.
 *
 * Sidebar, topbar, dan Outlet untuk `/akun`, `/akun/belanja`, `/akun/pesanan`, `/akun/profil`.
 */
import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import PembeliSidebar from '../components/pembeli/PembeliSidebar';
import { pembeliApi } from '../api/pembeliApi';
import { usePembeliGuard } from '../hooks/usePembeliGuard';
import { mediaUrl } from '../utils/media';

// Judul topbar per pathname area pembeli
const TITLES = {
  '/akun': 'Dashboard',
  '/akun/belanja': 'Belanja',
  '/akun/pesanan': 'Pesanan Saya',
  '/akun/profil': 'Profil Saya',
};

export default function PembeliLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false); // drawer menu mobile
  const [userName, setUserName] = useState(''); // nama di topbar
  const [userFoto, setUserFoto] = useState(''); // foto profil pembeli
  const location = useLocation();
  const { handleError } = usePembeliGuard();

  const title = TITLES[location.pathname] || 'Area Pembeli';

  // Muat nama & foto pembeli untuk topbar
  useEffect(() => {
    let alive = true;
    pembeliApi
      .getMe()
      .then((r) => {
        if (!alive) return;
        const p = r.data;
        setUserName(`${p.nama_d || ''} ${p.nama_b || ''}`.trim() || p.uname);
        setUserFoto(p.foto || '');
      })
      .catch((err) => {
        if (alive) handleError(err);
      });
    return () => {
      alive = false;
    };
  }, [handleError, location.pathname]);

  return (
    <div className="admin-shell admin-shell--pembeli">
      <PembeliSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
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
              src={mediaUrl(userFoto)}
              alt=""
              width={32}
              height={32}
              className="admin-thumb admin-thumb--avatar admin-topbar-avatar"
            />
            <span className="admin-topbar-name text-secondary small">{userName}</span>
          </div>
        </header>
        {/* Outlet: halaman /akun/* aktif */}
        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

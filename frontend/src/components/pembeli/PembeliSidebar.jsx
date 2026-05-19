/**
 * [buatan] Sidebar navigasi area pembeli (`/akun/*`).
 *
 * Menu dashboard, belanja, pesanan, profil; logo/nama toko dari getInfoToko.
 */
import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { pembeliApi } from '../../api/pembeliApi';
import { mediaUrl } from '../../utils/media';

// Menu navigasi area pembeli /akun/*
const MENU = [
  { to: '/akun', end: true, label: 'Dashboard', icon: '◫' },
  { to: '/akun/belanja', label: 'Belanja', icon: '▣' },
  { to: '/akun/pesanan', label: 'Pesanan Saya', icon: '▤' },
  { to: '/akun/profil', label: 'Profil Saya', icon: '◉' },
];

/** Props: open, onClose — sidebar mirip admin dengan tema pembeli. */
export default function PembeliSidebar({ open, onClose }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [info, setInfo] = useState(null);

  // Logo & nama toko di header sidebar
  useEffect(() => {
    pembeliApi.getInfoToko().then((r) => setInfo(r.data)).catch(() => {});
  }, []);

  const namaToko = info?.nama_toko?.trim() || 'Toko';

  const onLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  return (
    <>
      <div className={`admin-sidebar-backdrop ${open ? 'show' : ''}`} onClick={onClose} aria-hidden />
      <aside className={`admin-sidebar admin-sidebar--pembeli ${open ? 'open' : ''}`}>
        <div className="admin-sidebar-brand">
          <img
            src={mediaUrl(info?.logo_toko)}
            alt=""
            className="admin-sidebar-logo-img"
            width={40}
            height={40}
          />
          <div>
            <strong>Area Pembeli</strong>
            <small>{namaToko}</small>
          </div>
        </div>

        <nav className="admin-nav">
          {MENU.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <span className="admin-nav-icon" aria-hidden>
                {item.icon}
              </span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar-foot">
          <a href="/" className="admin-nav-link" target="_blank" rel="noreferrer">
            Lihat beranda toko
          </a>
          <button type="button" className="admin-nav-link admin-nav-logout" onClick={onLogout}>
            Keluar
          </button>
        </div>
      </aside>
    </>
  );
}

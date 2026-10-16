/**
 * [buatan] Sidebar navigasi panel admin.
 *
 * Menu CRUD toko, logo dari AdminShopContext, logout ke beranda.
 * Dipasang di AdminLayout.
 */
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAdminShop } from '../../context/AdminShopContext';
import { mediaUrl } from '../../utils/media';

// Daftar route sidebar admin — icon hanya dekoratif
const MENU = [
  { to: '/admin', end: true, label: 'Dashboard', icon: '◫' },
  { to: '/admin/produk', label: 'Produk', icon: '▣' },
  { to: '/admin/kategori', label: 'Kategori', icon: '◈' },
  { to: '/admin/pengiriman', label: 'Pengiriman', icon: '⇢' },
  { to: '/admin/bank', label: 'Bank', icon: '₴' },
  { to: '/admin/pembeli', label: 'Pembeli', icon: '◎' },
  { to: '/admin/pembelian', label: 'Pesanan', icon: '▤' },
  { to: '/admin/laporan', label: 'Laporan', icon: '▦' },
  { to: '/admin/artikel', label: 'Artikel', icon: '▥' },
  { to: '/admin/kontak', label: 'Pesan Kontak', icon: '✉' },
  { to: '/admin/info-toko', label: 'Info Toko', icon: '⌂' },
  { to: '/admin/profil', label: 'Profil Saya', icon: '◉' },
];

/** Props: open (drawer mobile), onClose — navigasi panel admin. */
export default function AdminSidebar({ open, onClose }) {
  const { logout } = useAuth();
  const { info } = useAdminShop();
  const navigate = useNavigate();

  const namaToko = info?.nama_toko?.trim() || 'Nama toko';

  const onLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  return (
    <>
      <div
        className={`admin-sidebar-backdrop ${open ? 'show' : ''}`}
        onClick={onClose}
        aria-hidden
      />
      <aside className={`admin-sidebar ${open ? 'open' : ''}`}>
        <div className="admin-sidebar-brand">
          <img
            src={mediaUrl(info?.logo_toko)}
            alt=""
            className="admin-sidebar-logo-img"
            width={40}
            height={40}
          />
          <div>
            <strong>Panel Admin</strong>
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
            Lihat beranda
          </a>
          <button type="button" className="admin-nav-link admin-nav-logout" onClick={onLogout}>
            Keluar
          </button>
        </div>
      </aside>
    </>
  );
}

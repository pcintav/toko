/**
 * [buatan] Header navigasi situs publik.
 *
 * Logo/nama toko dari info API, menu PUBLIC_NAV, WhatsApp, cari, login/daftar/akun.
 * Dipakai HomePage, TokoPage, dan halaman publik lain yang memuat info toko.
 */
import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { mediaUrl } from '../../utils/media';
import { PUBLIC_NAV } from '../../constants/publicNav';

/** Props: info (data toko dari API), loading — navigasi utama situs publik. */
export default function Header({ info, loading }) {
  const [open, setOpen] = useState(false); // menu mobile (hamburger) terbuka/tutup
  const { isLoggedIn, isAdmin, logout } = useAuth();

  const nama = info?.nama_toko;

  return (
    <header className="site-header sticky-top">
      <div className="container-xl">
        <nav className="navbar navbar-expand-lg py-3">
          <Link className="navbar-brand brand-mark" to="/">
            <img
              src={mediaUrl(info?.logo_toko)}
              alt={nama || ''}
              className="brand-logo"
              width={36}
              height={36}
            />
            <span>{loading ? '…' : nama || '—'}</span>
          </Link>
          <button
            type="button"
            className="navbar-toggler border-0 shadow-none"
            aria-label="Menu"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="navbar-toggler-icon" />
          </button>
          <div className={`collapse navbar-collapse ${open ? 'show' : ''}`}>
            {/* Menu utama: Beranda, Toko, Artikel, Kontak (dari constants/publicNav.js) */}
            <ul className="navbar-nav mx-auto gap-lg-1">
              {PUBLIC_NAV.map((item) => (
                <li key={item.to} className="nav-item">
                  {/* Kontak pakai anchor #kontak di beranda; lainnya pakai NavLink React Router */}
                  {item.hash ? (
                    <a
                      className="nav-link px-lg-3"
                      href={item.to}
                      onClick={() => setOpen(false)}
                    >
                      {item.label}
                    </a>
                  ) : (
                    <NavLink
                      className={({ isActive }) =>
                        `nav-link px-lg-3${isActive ? ' active' : ''}`
                      }
                      to={item.to}
                      end={item.end}
                      onClick={() => setOpen(false)}
                    >
                      {item.label}
                    </NavLink>
                  )}
                </li>
              ))}
            </ul>
            <div className="d-flex align-items-center gap-3 header-actions pb-3 pb-lg-0">
              {info?.link_wa && (
                <a
                  href={info.link_wa}
                  className="header-icon-link d-none d-md-flex"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="WhatsApp"
                  title="Chat WhatsApp"
                >
                  <img src={mediaUrl(info.logo_wa)} alt="" width={22} height={22} className="header-social-img" />
                </a>
              )}
              <Link to="/toko" className="header-icon-link" aria-label="Cari produk" onClick={() => setOpen(false)}>
                <SearchIcon />
              </Link>
              {/* Tombol berbeda jika sudah login vs tamu */}
              {isLoggedIn ? (
                <>
                  <Link
                    to={isAdmin ? '/admin' : '/akun'}
                    className="btn btn-sm btn-outline-dark rounded-0 px-3 text-uppercase fw-semibold"
                    onClick={() => setOpen(false)}
                  >
                    {isAdmin ? 'Admin' : 'Akun'}
                  </Link>
                  <button
                    type="button"
                    className="btn btn-sm btn-dark rounded-0 px-3 text-uppercase fw-semibold"
                    onClick={logout}
                  >
                    Keluar
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/daftar"
                    className="btn btn-sm btn-outline-dark rounded-0 px-3 text-uppercase fw-semibold"
                    onClick={() => setOpen(false)}
                  >
                    Daftar
                  </Link>
                  <Link
                    to="/login"
                    className="btn btn-sm btn-dark rounded-0 px-4 text-uppercase fw-semibold"
                    onClick={() => setOpen(false)}
                  >
                    Masuk
                  </Link>
                </>
              )}
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3-3" />
    </svg>
  );
}

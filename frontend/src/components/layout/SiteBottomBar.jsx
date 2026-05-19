/**
 * [buatan] Footer bawah situs (hak cipta + navigasi ringkas).
 *
 * Menampilkan tahun, nama toko, dan tautan PUBLIC_NAV. Dipasang di layout publik.
 */
import { Link } from 'react-router-dom';
import { PUBLIC_NAV } from '../../constants/publicNav';

/** Props: info toko, loading — footer hak cipta + PUBLIC_NAV. */
export default function SiteBottomBar({ info, loading }) {
  const tahun = new Date().getFullYear();
  const nama = loading ? '…' : info?.nama_toko || 'Toko';

  return (
    <footer className="site-bottom-bar">
      <div className="container-xl site-bottom-bar-inner">
        <p className="site-bottom-copy mb-0">
          © {tahun} {nama}. Semua hak dilindungi.
        </p>
        <nav className="site-bottom-nav" aria-label="Navigasi bawah">
          {PUBLIC_NAV.map((item) =>
            item.hash ? (
              <a key={item.to} href={item.to}>
                {item.label}
              </a>
            ) : (
              <Link key={item.to} to={item.to} end={item.end}>
                {item.label}
              </Link>
            )
          )}
        </nav>
      </div>
    </footer>
  );
}

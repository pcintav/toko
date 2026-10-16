/**
 * [buatan] Halaman 404 — URL tidak cocok dengan route mana pun.
 */
import { Link } from 'react-router-dom';
import Header from '../components/layout/Header';
import SiteBottomBar from '../components/layout/SiteBottomBar';

export default function NotFoundPage() {
  return (
    <div className="home-page">
      <Header info={null} loading={false} />
      <main className="section-pad">
        <div className="container-xl text-center py-5">
          <p className="text-secondary small text-uppercase mb-2">404</p>
          <h1 className="section-title mb-3">Halaman tidak ditemukan</h1>
          <p className="text-secondary mb-4">
            Alamat yang dibuka tidak ada. Kembali ke beranda atau lihat katalog produk.
          </p>
          <div className="d-flex flex-wrap justify-content-center gap-2">
            <Link to="/" className="btn btn-dark rounded-0 px-4">
              Beranda
            </Link>
            <Link to="/toko" className="btn btn-outline-dark rounded-0 px-4">
              Katalog
            </Link>
          </div>
        </div>
      </main>
      <SiteBottomBar info={null} loading={false} />
    </div>
  );
}

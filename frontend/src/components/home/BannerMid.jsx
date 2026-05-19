/**
 * [buatan] Banner tengah beranda dengan tagline dinamis.
 *
 * Menggunakan utils/beranda (tentang toko atau daftar kategori).
 */
import { Link } from 'react-router-dom';
import { taglineBeranda } from '../../utils/beranda';

/** Props: info toko, kategoriList — banner tengah dengan tagline dinamis. */
export default function BannerMid({ info, kategoriList }) {
  if (!info) return null;

  const teks = taglineBeranda(info, kategoriList);

  return (
    <section className="section-pad banner-mid text-center">
      <div className="container-xl py-2 col-lg-8 mx-auto">
        <h2 className="display-6 fw-semibold mb-3">{info.nama_toko}</h2>
        <p className="text-secondary mb-4">{teks}</p>
        <Link to="/toko" className="btn btn-outline-light rounded-0 px-5 text-uppercase">
          Jelajahi koleksi
        </Link>
      </div>
    </section>
  );
}

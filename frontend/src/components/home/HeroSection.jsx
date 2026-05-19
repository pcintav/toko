/**
 * [buatan] Bagian hero beranda (#beranda).
 *
 * Banner foto, nama toko, teks tentang, CTA belanja/daftar. Data dari info toko API.
 * URL: `/` (HomePage).
 */
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { mediaUrl } from '../../utils/media';

/** Props: info (data toko), loading — banner utama beranda #beranda. */
export default function HeroSection({ info, loading }) {
  const { isLoggedIn } = useAuth();

  if (loading) {
    return (
      <section id="beranda" className="hero-banner">
        <div className="container-xl">
          <div className="row g-4 align-items-center">
            <div className="col-lg-6">
              <div className="skeleton-line w-75 mb-3" />
              <div className="skeleton-line w-100 mb-2" style={{ height: 48 }} />
              <div className="skeleton-line w-100" style={{ height: 80 }} />
            </div>
            <div className="col-lg-6">
              <div className="skeleton-card hero-banner-photo-skeleton" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!info) return null;

  const tentang = String(info.tentang || '').trim();

  return (
    <section id="beranda" className="hero-banner">
      <div className="container-xl">
        <div className="row align-items-center g-4 g-lg-5">
          <div className="col-lg-6 order-lg-1 order-2">
            <p className="hero-eyebrow mb-2">Selamat datang di {info.nama_toko}</p>
            <h1 className="hero-banner-title">{info.nama_toko}</h1>
            {tentang ? (
              <p className="hero-banner-tentang">{tentang}</p>
            ) : (
              <p className="hero-banner-tentang hero-banner-tentang--empty text-secondary">
                Teks tentang toko belum diisi. Admin dapat mengisinya di menu Info toko.
              </p>
            )}
            <div className="hero-banner-actions">
              <Link to="/toko" className="btn btn-dark btn-lg rounded-0 px-4 text-uppercase">
                Belanja sekarang
              </Link>
              {!isLoggedIn && (
                <Link to="/daftar" className="btn btn-outline-dark btn-lg rounded-0 px-4 text-uppercase">
                  Daftar pembeli
                </Link>
              )}
            </div>
          </div>
          <div className="col-lg-6 order-lg-2 order-1">
            <div className="hero-banner-visual">
              <img
                src={mediaUrl(info.foto_banner)}
                alt={`Banner ${info.nama_toko}`}
                className="hero-banner-photo"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

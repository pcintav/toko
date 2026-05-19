/**
 * [buatan] Halaman beranda utama.
 *
 * URL: `/` — merakit hero, kategori, produk terbaru, artikel, kontak.
 * Data: useBerandaData + komponen home/*.
 */
import { Link, useNavigate } from 'react-router-dom';
import { useBerandaData } from '../hooks/useBerandaData';
import Header from '../components/layout/Header';
import SiteBottomBar from '../components/layout/SiteBottomBar';
import HeroSection from '../components/home/HeroSection';
import KategoriGrid from '../components/home/KategoriGrid';
import ProductCard from '../components/home/ProductCard';
import BannerMid from '../components/home/BannerMid';
import NewsletterStrip from '../components/home/NewsletterStrip';
import ContactSection from '../components/home/ContactSection';
import { formatTanggal } from '../utils/format';
import { mediaUrl } from '../utils/media';

export default function HomePage() {
  // Data beranda dari hook — produk, artikel, info toko, loading, error
  const {
    info,
    loading,
    error,
    kategoriList,
    produkTerbaru,
    artikelTampil,
    produk,
  } = useBerandaData();

  const navigate = useNavigate();

  return (
    <div className="home-page">
      <Header info={info} loading={loading} />

      <main>
        {/* Hero + trust bar di bawahnya (di dalam HeroSection/TrustBar) */}
        <HeroSection info={info} loading={loading} />

        <KategoriGrid
          produk={produk}
          loading={loading}
          onPilih={(k) => navigate(`/toko?kategori=${encodeURIComponent(k)}`)}
        />

        {error && (
          <div className="container-xl mt-4">
            <div className="alert alert-light border text-center" role="alert">
              {error}
            </div>
          </div>
        )}

        {/* Grid produk terbaru — maks. 4 item dari useBerandaData */}
        <section id="produk" className="section-pad">
          <div className="container-xl">
            <SectionHead
              title={info ? `Terbaru di ${info.nama_toko}` : 'Produk terbaru'}
              linkTo="/toko"
              linkLabel="Lihat semua"
            />
            {loading ? (
              <LoadingGrid count={4} />
            ) : produkTerbaru.length === 0 ? (
              <EmptyHint />
            ) : (
              <div className="row g-4 row-cols-2 row-cols-lg-4">
                {produkTerbaru.map((p) => (
                  <div key={p.id_produk} className="col">
                    <ProductCard produk={p} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <BannerMid info={info} kategoriList={kategoriList} />

        <section id="artikel" className="section-pad">
          <div className="container-xl">
            <SectionHead title="Artikel" linkTo="/artikel" linkLabel="Lihat semua" />
            {loading ? (
              <p className="text-secondary text-center py-4">Memuat artikel…</p>
            ) : artikelTampil.length === 0 ? (
              <EmptyHint type="artikel" />
            ) : (
              <div className="row g-4">
                {artikelTampil.map((a) => (
                  <div key={a.id} className="col-md-4">
                    <Link to={`/artikel/${a.id}`} className="blog-card card border-0 h-100 text-decoration-none text-body">
                      <img
                        src={mediaUrl(a.gambar)}
                        className="card-img-top blog-img"
                        alt={a.judul}
                        loading="lazy"
                      />
                      <div className="card-body px-0 pt-3">
                        <time className="small text-muted">{formatTanggal(a.created_at)}</time>
                        <h3 className="h5 mt-2">{a.judul}</h3>
                        <p className="text-secondary small">{a.ringkasan}</p>
                        <span className="section-link small">Baca selengkapnya</span>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <NewsletterStrip info={info} />
        <ContactSection info={info} loading={loading} />
      </main>

      <SiteBottomBar info={info} loading={loading} />
    </div>
  );
}

/** Judul section beranda + tautan "Lihat semua" opsional. */
function SectionHead({ title, linkTo, linkLabel }) {
  return (
    <div className="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-4 pb-2 border-bottom">
      <h2 className="section-title mb-0">{title}</h2>
      {linkTo && (
        <Link to={linkTo} className="section-link">
          {linkLabel}
        </Link>
      )}
    </div>
  );
}

function LoadingGrid({ count }) {
  return (
    <div className="row g-4 row-cols-2 row-cols-lg-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="col">
          <div className="skeleton-card" />
        </div>
      ))}
    </div>
  );
}

function EmptyHint({ type }) {
  if (type === 'artikel') {
    return <p className="text-secondary text-center py-4">Belum ada artikel.</p>;
  }
  return <p className="text-secondary text-center py-4">Belum ada produk.</p>;
}

/**
 * [buatan] Daftar artikel/blog toko.
 *
 * URL: `/artikel` — api.getArtikel, tautan ke detail per id.
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import Header from '../components/layout/Header';
import SiteBottomBar from '../components/layout/SiteBottomBar';
import { formatTanggal } from '../utils/format';
import { mediaUrl } from '../utils/media';

export default function ArtikelListPage() {
  const [artikel, setArtikel] = useState([]); // daftar dari GET /api/users/artikel
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [aRes, iRes] = await Promise.all([api.getArtikel(), api.getInfoToko()]);
        if (cancelled) return;
        setArtikel(aRes.data || []);
        setInfo(iRes.data || null);
      } catch {
        if (!cancelled) {
          setError('Artikel tidak dapat dimuat. Periksa koneksi lalu muat ulang halaman.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="home-page">
      <Header info={info} loading={loading} />

      <main className="section-pad">
        <div className="container-xl">
          <div className="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-4 pb-2 border-bottom">
            <div>
              <p className="text-secondary small text-uppercase mb-1">Blog</p>
              <h1 className="section-title mb-0">Artikel</h1>
            </div>
            <Link to="/" className="section-link">
              ← Beranda
            </Link>
          </div>

          {error && (
            <div className="alert alert-light border text-center mb-4" role="alert">
              {error}
            </div>
          )}

          {loading ? (
            <p className="text-secondary text-center py-5">Memuat artikel…</p>
          ) : artikel.length === 0 ? (
            <p className="text-secondary text-center py-5">Belum ada artikel.</p>
          ) : (
            <>
              <p className="text-secondary small mb-3">Menampilkan {artikel.length} artikel</p>
              <div className="row g-4">
                {artikel.map((a) => (
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
                        <h2 className="h5 mt-2">{a.judul}</h2>
                        <p className="text-secondary small">{a.ringkasan}</p>
                        <span className="section-link small">Baca selengkapnya</span>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      <SiteBottomBar info={info} loading={loading} />
    </div>
  );
}

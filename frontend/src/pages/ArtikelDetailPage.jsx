/**
 * [buatan] Halaman baca satu artikel.
 *
 * URL: `/artikel/:id` — getArtikelById.
 */
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api/client';
import Header from '../components/layout/Header';
import SiteBottomBar from '../components/layout/SiteBottomBar';
import { formatTanggal } from '../utils/format';
import { mediaUrl } from '../utils/media';

export default function ArtikelDetailPage() {
  const { id } = useParams();
  const [info, setInfo] = useState(null);
  const [artikel, setArtikel] = useState(null); // dari GET /api/users/artikel/:id
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError('');
    Promise.all([api.getInfoToko(), api.getArtikelById(id)])
      .then(([infoRes, artRes]) => {
        if (!alive) return;
        setInfo(infoRes.data);
        setArtikel(artRes.data);
      })
      .catch((err) => {
        if (alive) setError(err.message || 'Artikel tidak ditemukan');
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [id]);

  return (
    <div className="home-page">
      <Header info={info} loading={loading} />
      <main className="section-pad">
        <div className="container-xl detail-article">
          <Link to="/artikel" className="detail-back-link">
            ← Kembali ke artikel
          </Link>

          {loading && <p className="text-secondary py-5">Memuat artikel…</p>}
          {error && !artikel && (
            <div className="alert alert-danger mt-3" role="alert">
              {error}
            </div>
          )}

          {artikel && (
            <article className="mt-3">
              <img src={mediaUrl(artikel.gambar)} alt="" className="detail-article-img w-100 mb-4" />
              <time className="small text-muted d-block mb-2">{formatTanggal(artikel.created_at)}</time>
              <h1 className="section-title mb-3">{artikel.judul}</h1>
              <p className="lead text-secondary">{artikel.ringkasan}</p>
              <div className="detail-article-body text-secondary mt-4">
                {artikel.isi.split('\n').map((para, i) =>
                  para.trim() ? (
                    <p key={i} className="mb-3">
                      {para}
                    </p>
                  ) : null
                )}
              </div>
            </article>
          )}
        </div>
      </main>
      <SiteBottomBar info={info} loading={loading} />
    </div>
  );
}

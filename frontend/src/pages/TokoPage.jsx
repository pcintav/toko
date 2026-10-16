/**
 * [buatan] Katalog produk dengan filter kategori + pencarian.
 *
 * URL: `/toko` — query `?kategori=` & `?q=` — api.getProduk, ProductCard.
 */
import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import Header from '../components/layout/Header';
import SiteBottomBar from '../components/layout/SiteBottomBar';
import ProductCard from '../components/home/ProductCard';
import { LABEL_SEMUA, daftarFilterKategori } from '../utils/kategori';

export default function TokoPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [produk, setProduk] = useState([]);
  const [info, setInfo] = useState(null);
  const [kategoriMaster, setKategoriMaster] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const kategoriParam = searchParams.get('kategori') || LABEL_SEMUA;
  const qParam = searchParams.get('q') || '';
  const [kategoriAktif, setKategoriAktif] = useState(kategoriParam);
  const [qInput, setQInput] = useState(qParam);

  useEffect(() => {
    setKategoriAktif(kategoriParam);
    setQInput(qParam);
  }, [kategoriParam, qParam]);

  // Muat katalog dari API (filter q + kategori di server)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const params = {};
        if (qParam.trim()) params.q = qParam.trim();
        if (kategoriParam && kategoriParam !== LABEL_SEMUA) params.kategori = kategoriParam;

        const [pRes, iRes, kRes] = await Promise.all([
          api.getProduk(params),
          api.getInfoToko(),
          api.getKategori(),
        ]);
        if (cancelled) return;
        setProduk(pRes.data || []);
        setInfo(iRes.data || null);
        setKategoriMaster(Array.isArray(kRes.data) ? kRes.data : []);
        setError('');
      } catch {
        if (!cancelled) {
          setError('Katalog tidak dapat dimuat. Periksa koneksi lalu muat ulang halaman.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [qParam, kategoriParam]);

  const kategoriList = useMemo(
    () => daftarFilterKategori(kategoriMaster, produk),
    [kategoriMaster, produk]
  );

  const syncParams = (nextKat, nextQ) => {
    const p = {};
    if (nextKat && nextKat !== LABEL_SEMUA) p.kategori = nextKat;
    if (nextQ && nextQ.trim()) p.q = nextQ.trim();
    setSearchParams(p);
  };

  const pilihKategori = (k) => {
    setKategoriAktif(k);
    syncParams(k, qParam);
  };

  const onCari = (e) => {
    e.preventDefault();
    syncParams(kategoriAktif, qInput);
  };

  return (
    <div className="home-page">
      <Header info={info} loading={loading} />

      <main className="section-pad">
        <div className="container-xl">
          <div className="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-4 pb-2 border-bottom">
            <div>
              <p className="text-secondary small text-uppercase mb-1">Katalog</p>
              <h1 className="section-title mb-0">{info ? `Toko ${info.nama_toko}` : 'Semua produk'}</h1>
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

          <form className="row g-2 mb-4" onSubmit={onCari}>
            <div className="col-md-8">
              <input
                type="search"
                className="form-control rounded-0"
                placeholder="Cari nama atau deskripsi produk…"
                value={qInput}
                onChange={(e) => setQInput(e.target.value)}
                aria-label="Cari produk"
              />
            </div>
            <div className="col-md-4 d-flex gap-2">
              <button type="submit" className="btn btn-dark rounded-0 flex-grow-1">
                Cari
              </button>
              {qParam && (
                <button
                  type="button"
                  className="btn btn-outline-secondary rounded-0"
                  onClick={() => {
                    setQInput('');
                    syncParams(kategoriAktif, '');
                  }}
                >
                  Reset
                </button>
              )}
            </div>
          </form>

          <ul className="nav category-tabs mb-4 flex-wrap gap-2">
            <TabButton active={kategoriAktif === LABEL_SEMUA} onClick={() => pilihKategori(LABEL_SEMUA)} label={LABEL_SEMUA} />
            {kategoriList.map((k) => (
              <TabButton key={k} active={kategoriAktif === k} onClick={() => pilihKategori(k)} label={k} />
            ))}
          </ul>

          {loading ? (
            <LoadingGrid count={8} />
          ) : produk.length === 0 ? (
            <p className="text-secondary text-center py-5">
              {qParam
                ? `Tidak ada produk untuk pencarian “${qParam}”.`
                : kategoriAktif !== LABEL_SEMUA
                  ? `Belum ada produk dalam kategori ${kategoriAktif}.`
                  : 'Belum ada produk.'}
            </p>
          ) : (
            <>
              <p className="text-secondary small mb-3">
                Menampilkan {produk.length} produk
                {kategoriAktif !== LABEL_SEMUA ? ` · ${kategoriAktif}` : ''}
                {qParam ? ` · “${qParam}”` : ''}
              </p>
              <div className="row g-4 row-cols-2 row-cols-md-3 row-cols-lg-4">
                {produk.map((p) => (
                  <div key={p.id_produk} className="col">
                    <ProductCard produk={p} />
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

function TabButton({ active, onClick, label }) {
  return (
    <li className="nav-item">
      <button type="button" className={`nav-link category-tab ${active ? 'active' : ''}`} onClick={onClick}>
        {label}
      </button>
    </li>
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

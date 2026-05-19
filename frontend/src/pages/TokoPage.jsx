/**
 * [buatan] Katalog produk dengan filter kategori.
 *
 * URL: `/toko` dan `/toko?kategori=...` — api.getProduk, ProductCard.
 */
import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import Header from '../components/layout/Header';
import SiteBottomBar from '../components/layout/SiteBottomBar';
import ProductCard from '../components/home/ProductCard';
import { LABEL_SEMUA, kategoriDariProduk } from '../utils/kategori';

export default function TokoPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [produk, setProduk] = useState([]);
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const kategoriParam = searchParams.get('kategori') || LABEL_SEMUA; // dari URL ?kategori=
  const [kategoriAktif, setKategoriAktif] = useState(kategoriParam); // tab filter aktif

  useEffect(() => {
    setKategoriAktif(kategoriParam);
  }, [kategoriParam]);

  // Muat katalog produk + info toko
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [pRes, iRes] = await Promise.all([api.getProduk(), api.getInfoToko()]);
        if (cancelled) return;
        setProduk(pRes.data || []);
        setInfo(iRes.data || null);
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
  }, []);

  const kategoriList = useMemo(() => kategoriDariProduk(produk), [produk]);

  const produkFilter = useMemo(() => {
    if (kategoriAktif === LABEL_SEMUA) return produk;
    return produk.filter((p) => p.kategori === kategoriAktif);
  }, [produk, kategoriAktif]);

  // Ganti filter + sinkronkan query string agar bisa dibookmark
  const pilihKategori = (k) => {
    setKategoriAktif(k);
    if (k === LABEL_SEMUA) {
      setSearchParams({});
    } else {
      setSearchParams({ kategori: k });
    }
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

          <ul className="nav category-tabs mb-4 flex-wrap gap-2">
            <TabButton active={kategoriAktif === LABEL_SEMUA} onClick={() => pilihKategori(LABEL_SEMUA)} label={LABEL_SEMUA} />
            {kategoriList.map((k) => (
              <TabButton key={k} active={kategoriAktif === k} onClick={() => pilihKategori(k)} label={k} />
            ))}
          </ul>

          {loading ? (
            <LoadingGrid count={8} />
          ) : produkFilter.length === 0 ? (
            <p className="text-secondary text-center py-5">
              {kategoriAktif !== LABEL_SEMUA
                ? `Belum ada produk dalam kategori ${kategoriAktif}.`
                : 'Belum ada produk.'}
            </p>
          ) : (
            <>
              <p className="text-secondary small mb-3">
                Menampilkan {produkFilter.length} produk
                {kategoriAktif !== LABEL_SEMUA ? ` · ${kategoriAktif}` : ''}
              </p>
              <div className="row g-4 row-cols-2 row-cols-md-3 row-cols-lg-4">
                {produkFilter.map((p) => (
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

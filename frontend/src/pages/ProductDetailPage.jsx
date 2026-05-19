/**
 * [buatan] Detail satu produk.
 *
 * URL: `/produk/:id` — getProdukById, tombol beli ke checkout pembeli.
 */
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import Header from '../components/layout/Header';
import SiteBottomBar from '../components/layout/SiteBottomBar';
import { formatRupiah } from '../utils/format';
import { mediaUrl } from '../utils/media';
import { belanjaUrl } from '../utils/beli';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isPembeli, isAdmin } = useAuth();
  const [info, setInfo] = useState(null); // header/footer
  const [produk, setProduk] = useState(null); // dari GET /api/users/produk/:id
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError('');
    Promise.all([api.getInfoToko(), api.getProdukById(id)])
      .then(([infoRes, prodRes]) => {
        if (!alive) return;
        setInfo(infoRes.data);
        setProduk(prodRes.data);
      })
      .catch((err) => {
        if (alive) setError(err.message || 'Produk tidak ditemukan');
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [id]);

  // Arahkan ke checkout pembeli atau login dengan redirect
  const onBeli = () => {
    if (!produk) return;
    const target = belanjaUrl(produk.id_produk);
    if (isPembeli) {
      navigate(target);
      return;
    }
    if (isAdmin) {
      setError('Silakan keluar dari akun admin, lalu masuk sebagai pembeli untuk memesan.');
      return;
    }
    navigate('/login', { state: { from: target } });
  };

  return (
    <div className="home-page">
      <Header info={info} loading={loading} />
      <main className="section-pad">
        <div className="container-xl">
          <Link to="/toko" className="detail-back-link">
            ← Kembali ke katalog
          </Link>

          {loading && <p className="text-secondary py-5">Memuat produk…</p>}
          {error && !produk && (
            <div className="alert alert-danger mt-3" role="alert">
              {error}
            </div>
          )}

          {produk && (
            <div className="row g-5 align-items-start mt-2">
              <div className="col-md-5">
                <div className="detail-hero-img">
                  <img src={mediaUrl(produk.gambar)} alt={produk.nama_produk} />
                </div>
              </div>
              <div className="col-md-7">
                <p className="section-eyebrow mb-2">{produk.kategori}</p>
                <h1 className="section-title">{produk.nama_produk}</h1>
                <p className="detail-price h3 mb-4">{formatRupiah(produk.harga)}</p>
                <p className="text-secondary">{produk.deskripsi}</p>
                {error && (
                  <div className="alert alert-warning py-2 mt-3" role="alert">
                    {error}
                  </div>
                )}
                <div className="d-flex flex-wrap gap-2 mt-4">
                  <button type="button" className="btn btn-dark rounded-0 px-4" onClick={onBeli}>
                    Beli sekarang
                  </button>
                  <Link to="/toko" className="btn btn-outline-dark rounded-0 px-4">
                    Lihat produk lain
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <SiteBottomBar info={info} loading={loading} />
    </div>
  );
}

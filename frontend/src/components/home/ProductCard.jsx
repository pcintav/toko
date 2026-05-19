/**
 * [buatan] Kartu produk (gambar, harga, Detail, Beli).
 *
 * Tombol Beli mengarah ke belanja pembeli atau login. Dipakai beranda & toko.
 */
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { formatRupiah } from '../../utils/format';
import { mediaUrl } from '../../utils/media';
import { belanjaUrl } from '../../utils/beli';

/** Props: produk — satu baris katalog; tombol Beli ke /akun/belanja atau login. */
export default function ProductCard({ produk }) {
  const navigate = useNavigate();
  const { isPembeli } = useAuth();
  const detailTo = `/produk/${produk.id_produk}`;

  // Navigasi checkout atau login dengan redirect kembali
  const onBeli = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const target = belanjaUrl(produk.id_produk);
    if (isPembeli) {
      navigate(target);
      return;
    }
    navigate('/login', { state: { from: target } });
  };

  return (
    <article className="product-card">
      <Link to={detailTo} className="product-card-link">
        <div className="product-card-img-wrap">
          <img src={mediaUrl(produk.gambar)} alt={produk.nama_produk} loading="lazy" />
        </div>
        <div className="product-card-body">
          <h3 className="product-title">{produk.nama_produk}</h3>
          <span className="product-price">{formatRupiah(produk.harga)}</span>
        </div>
      </Link>
      <div className="product-card-actions">
        <Link to={detailTo} className="btn btn-sm btn-outline-dark rounded-0 flex-grow-1">
          Detail
        </Link>
        <button type="button" className="btn btn-sm btn-dark rounded-0 flex-grow-1" onClick={onBeli}>
          Beli
        </button>
      </div>
    </article>
  );
}

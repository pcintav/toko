/**
 * [buatan] Tile promo per kategori di beranda.
 *
 * Menampilkan hingga 3 kategori dengan gambar & harga; tautan ke `/toko?kategori=...`.
 */
import { Link } from 'react-router-dom';
import { produkPerKategori } from '../../utils/kategori';
import { mediaUrl } from '../../utils/media';
import { formatRupiah } from '../../utils/format';

const TONES = ['promo-a', 'promo-b', 'promo-c'];

/** Props: produk — array katalog; tampilkan 3 tile promo per kategori. */
export default function PromoKategori({ produk }) {
  const groups = produkPerKategori(produk).slice(0, 3);

  if (groups.length === 0) return null;

  const utama = groups[0];
  const lainnya = groups.slice(1);

  return (
    <section className="section-pad pt-0">
      <div className="container-xl">
        <div className="row g-3">
          <div className="col-lg-6">
            <Link
              to={`/toko?kategori=${encodeURIComponent(utama.kategori)}`}
              className={`promo-tile promo-tile-lg ${TONES[0]} d-block promo-tile-has-img`}
            >
              <img src={mediaUrl(utama.produk?.gambar)} alt="" className="promo-tile-bg" />
              <div className="promo-tile-content">
                <span className="promo-label">{formatRupiah(utama.produk?.harga)}</span>
                <h3>{utama.kategori}</h3>
                <span className="promo-link">Belanja sekarang</span>
              </div>
            </Link>
          </div>
          <div className="col-lg-6 d-flex flex-column gap-3">
            {lainnya.map((g, i) => (
              <Link
                key={g.kategori}
                to={`/toko?kategori=${encodeURIComponent(g.kategori)}`}
                className={`promo-tile ${TONES[i + 1] || 'promo-c'} d-block flex-grow-1 promo-tile-has-img`}
              >
                <img src={mediaUrl(g.produk?.gambar)} alt="" className="promo-tile-bg" />
                <div className="promo-tile-content">
                  <span className="promo-label">{formatRupiah(g.produk?.harga)}</span>
                  <h3 className="h5 mb-0">{g.kategori}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

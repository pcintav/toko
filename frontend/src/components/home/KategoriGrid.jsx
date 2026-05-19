/**
 * [buatan] Grid 3 kategori utama di beranda (#kategori-utama).
 *
 * Klik kategori memanggil callback onPilih (scroll/filter di HomePage).
 */
import { kategoriGridData } from '../../utils/kategori';
import { mediaUrl } from '../../utils/media';

/** Props: produk, loading, onPilih(kategori) — grid 3 kategori di beranda. */
export default function KategoriGrid({ produk, loading, onPilih }) {
  const groups = kategoriGridData(produk, 3);

  if (loading) {
    return (
      <section className="section-pad kategori-grid-section">
        <div className="container-xl">
          <div className="row g-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="col-md-4">
                <div className="skeleton-card kategori-card-skeleton" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (groups.length === 0) return null;

  return (
    <section id="kategori-utama" className="section-pad kategori-grid-section" aria-labelledby="kategori-grid-title">
      <div className="container-xl">
        <h2 id="kategori-grid-title" className="section-title text-center mb-2">
          Belanja per kategori
        </h2>
        <p className="text-secondary text-center mb-4 col-lg-8 mx-auto">
          Pilih kategori dari katalog produk kami
        </p>
        <div className="row g-4">
          {groups.map(({ kategori, produk: item, jumlah }) => (
            <div key={kategori} className="col-md-4">
              <button
                type="button"
                className="kategori-card w-100 border-0 text-start"
                onClick={() => onPilih?.(kategori)}
              >
                <div className="kategori-card-img">
                  <img src={mediaUrl(item?.gambar)} alt={kategori} loading="lazy" />
                </div>
                <div className="kategori-card-body">
                  <h3 className="h5 mb-1">{kategori}</h3>
                  <p className="small text-secondary mb-0">
                    {jumlah} produk
                    {item?.deskripsi ? ` · ${potong(item.deskripsi, 72)}` : ''}
                  </p>
                  <span className="kategori-card-link">Lihat produk →</span>
                </div>
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function potong(teks, max) {
  const s = String(teks || '').trim();
  if (s.length <= max) return s;
  return `${s.slice(0, max).trim()}…`;
}

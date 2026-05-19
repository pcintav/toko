/**
 * [buatan] Checkout belanja (pilih produk, bayar, upload bukti).
 * URL: `/akun/belanja` — query `?produk=` untuk preselect, pembeliApi.createPembelian.
 */
import { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { pembeliApi } from '../../api/pembeliApi';
import { usePembeliGuard } from '../../hooks/usePembeliGuard';
import PageHeader from '../../components/admin/PageHeader';
import LoadingBlock from '../../components/admin/LoadingBlock';
import AdminModal from '../../components/admin/AdminModal';
import ImageUploadField from '../../components/admin/ImageUploadField';
import { METODE_BAYAR, SHIPPING } from '../../constants/adminEnums';
import { LABEL_SEMUA, kategoriDariProduk } from '../../utils/kategori';
import { formatRupiah } from '../../utils/format';
import { mediaUrl } from '../../utils/media';

export default function PembeliBelanjaPage() {
  const { handleError } = usePembeliGuard();
  const [produk, setProduk] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [kategoriAktif, setKategoriAktif] = useState(LABEL_SEMUA);
  const [checkout, setCheckout] = useState(null); // produk yang sedang di-checkout (modal)
  const [form, setForm] = useState({}); // alamat, metode bayar, bukti transfer
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const autoCheckoutDone = useRef(false);

  // Isi form dari profil pembeli lalu buka modal checkout
  const openCheckout = useCallback(
    (p) => {
      const nama = profile ? `${profile.nama_d || ''} ${profile.nama_b || ''}`.trim() : '';
      setForm({
        id_produk: p.id_produk,
        nama_pembeli: nama,
        alamat_pembeli: profile?.alamat || '',
        phone_pembeli: profile?.phone != null ? String(profile.phone) : '',
        metode_pembayaran: METODE_BAYAR[0],
        pengiriman: SHIPPING[0],
        catatan: '',
        foto_bukti: '',
      });
      setCheckout(p);
      setFormError('');
      setSuccess('');
    },
    [profile]
  );

  useEffect(() => {
    let alive = true;
    Promise.all([pembeliApi.getProduk(), pembeliApi.getMe()])
      .then(([pRes, meRes]) => {
        if (!alive) return;
        setProduk(pRes.data || []);
        setProfile(meRes.data);
      })
      .catch((err) => {
        if (!alive) return;
        if (!handleError(err)) setError(err.message);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [handleError]);

  // Auto-checkout jika datang dari ProductCard dengan ?produk=id
  useEffect(() => {
    const idParam = searchParams.get('produk');
    if (!idParam || loading || !profile || autoCheckoutDone.current) return;
    const p = produk.find((x) => String(x.id_produk) === idParam);
    if (!p) return;
    autoCheckoutDone.current = true;
    openCheckout(p);
    setSearchParams({}, { replace: true });
  }, [searchParams, loading, profile, produk, openCheckout, setSearchParams]);

  const kategoriList = useMemo(() => kategoriDariProduk(produk), [produk]);

  const produkFilter = useMemo(() => {
    if (kategoriAktif === LABEL_SEMUA) return produk;
    return produk.filter((p) => p.kategori === kategoriAktif);
  }, [produk, kategoriAktif]);

  // POST /api/users/pembelian — buat pesanan baru
  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      await pembeliApi.createPembelian({
        ...form,
        phone_pembeli: parseInt(String(form.phone_pembeli).replace(/\D/g, ''), 10),
      });
      setCheckout(null);
      setSuccess('Pesanan berhasil dibuat. Lihat di menu Pesanan Saya.');
    } catch (err) {
      if (!handleError(err)) setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingBlock />;

  return (
    <div>
      <PageHeader title="Belanja" subtitle={`${produk.length} produk tersedia`} />
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="admin-panel">
        <ul className="nav category-tabs mb-4 flex-wrap gap-2">
          <li className="nav-item">
            <button
              type="button"
              className={`nav-link category-tab ${kategoriAktif === LABEL_SEMUA ? 'active' : ''}`}
              onClick={() => setKategoriAktif(LABEL_SEMUA)}
            >
              {LABEL_SEMUA}
            </button>
          </li>
          {kategoriList.map((k) => (
            <li key={k} className="nav-item">
              <button
                type="button"
                className={`nav-link category-tab ${kategoriAktif === k ? 'active' : ''}`}
                onClick={() => setKategoriAktif(k)}
              >
                {k}
              </button>
            </li>
          ))}
        </ul>

        {produkFilter.length === 0 ? (
          <p className="text-secondary text-center py-4 mb-0">Belum ada produk di kategori ini.</p>
        ) : (
          <div className="row g-4 row-cols-2 row-cols-md-3 row-cols-lg-4">
            {produkFilter.map((p) => (
              <div key={p.id_produk} className="col">
                <article className="pembeli-shop-card">
                  <div className="pembeli-shop-card-img">
                    <img src={mediaUrl(p.gambar)} alt={p.nama_produk} loading="lazy" />
                  </div>
                  <div className="pembeli-shop-card-body">
                    <h3 className="h6 mb-1">{p.nama_produk}</h3>
                    <p className="small text-secondary mb-2 pembeli-desc-clamp">{p.deskripsi}</p>
                    <p className="fw-semibold mb-2">{formatRupiah(p.harga)}</p>
                    <button type="button" className="btn btn-dark btn-sm rounded-0 w-100" onClick={() => openCheckout(p)}>
                      Pesan
                    </button>
                  </div>
                </article>
              </div>
            ))}
          </div>
        )}
      </div>

      <AdminModal
        show={Boolean(checkout)}
        title={checkout ? `Checkout: ${checkout.nama_produk}` : ''}
        onClose={() => setCheckout(null)}
        wide
      >
        {checkout && (
          <form onSubmit={onSubmit}>
            <div className="row g-3 mb-3">
              <div className="col-md-4">
                <img src={mediaUrl(checkout.gambar)} alt="" className="admin-detail-img w-100" />
              </div>
              <div className="col-md-8">
                <p className="mb-1">
                  <strong>{checkout.nama_produk}</strong>
                </p>
                <p className="text-secondary small">{checkout.deskripsi}</p>
                <p className="fw-semibold mb-0">{formatRupiah(checkout.harga)}</p>
              </div>
            </div>
            <div className="row g-3">
              <div className="col-12">
                <label className="form-label">Nama penerima</label>
                <input
                  className="form-control"
                  value={form.nama_pembeli}
                  onChange={(e) => setForm({ ...form, nama_pembeli: e.target.value })}
                  required
                />
              </div>
              <div className="col-12">
                <label className="form-label">Alamat pengiriman</label>
                <textarea
                  className="form-control"
                  rows={2}
                  value={form.alamat_pembeli}
                  onChange={(e) => setForm({ ...form, alamat_pembeli: e.target.value })}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Telepon</label>
                <input
                  className="form-control"
                  value={form.phone_pembeli}
                  onChange={(e) => setForm({ ...form, phone_pembeli: e.target.value })}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Metode bayar</label>
                <select
                  className="form-select"
                  value={form.metode_pembayaran}
                  onChange={(e) => setForm({ ...form, metode_pembayaran: e.target.value })}
                >
                  {METODE_BAYAR.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">Kurir</label>
                <select
                  className="form-select"
                  value={form.pengiriman}
                  onChange={(e) => setForm({ ...form, pengiriman: e.target.value })}
                >
                  {SHIPPING.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-12">
                <label className="form-label">Catatan (opsional)</label>
                <textarea
                  className="form-control"
                  rows={2}
                  value={form.catatan}
                  onChange={(e) => setForm({ ...form, catatan: e.target.value })}
                />
              </div>
              <div className="col-12">
                <ImageUploadField
                  label="Bukti bayar (opsional)"
                  value={form.foto_bukti}
                  onChange={(v) => setForm({ ...form, foto_bukti: v })}
                  uploadFn={pembeliApi.uploadGambar}
                />
              </div>
            </div>
            {formError && <div className="alert alert-danger py-2">{formError}</div>}
            <button type="submit" className="btn btn-dark rounded-0 w-100" disabled={saving}>
              {saving ? 'Memproses…' : 'Buat pesanan'}
            </button>
          </form>
        )}
      </AdminModal>
    </div>
  );
}

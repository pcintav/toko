/**
 * [buatan] CRUD produk toko.
 * URL: `/admin/produk` — kategori dari GET /api/admin/kategori; stok + aktif.
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api/adminApi';
import { useAdminList } from '../../hooks/useAdminList';
import { useAdminGuard } from '../../hooks/useAdminGuard';
import PageHeader from '../../components/admin/PageHeader';
import LoadingBlock from '../../components/admin/LoadingBlock';
import AdminModal from '../../components/admin/AdminModal';
import AdminDetailModal from '../../components/admin/AdminDetailModal';
import AdminRowActions from '../../components/admin/AdminRowActions';
import DetailDl from '../../components/admin/DetailDl';
import ImageUploadField from '../../components/admin/ImageUploadField';
import { formatRupiah } from '../../utils/format';
import { mediaUrl } from '../../utils/media';

const emptyForm = {
  nama_produk: '',
  deskripsi: '',
  harga: '',
  gambar: '',
  kategori: '',
  stok: '10',
  aktif: true,
};

export default function AdminProdukPage() {
  const { handleError } = useAdminGuard();
  const { rows, loading, error, reload } = useAdminList(adminApi.getProduk);
  const [kategoriOpts, setKategoriOpts] = useState([]);
  const [modal, setModal] = useState(null);
  const [detail, setDetail] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    adminApi
      .getKategori()
      .then((r) => setKategoriOpts(Array.isArray(r.data) ? r.data : []))
      .catch((err) => {
        if (!handleError(err)) setFormError(err.message);
      });
  }, [handleError]);

  const defaultKategori = () => kategoriOpts[0]?.nama || '';

  const openCreate = () => {
    setForm({ ...emptyForm, kategori: defaultKategori() });
    setFormError('');
    setModal('create');
  };

  const openDetail = async (row) => {
    try {
      const r = await adminApi.getProdukById(row.id_produk);
      setDetail(r.data);
    } catch (err) {
      if (!handleError(err)) setFormError(err.message);
    }
  };

  const openEdit = async (row) => {
    setFormError('');
    try {
      const r = await adminApi.getProdukById(row.id_produk);
      const p = r.data;
      setForm({
        nama_produk: p.nama_produk ?? '',
        deskripsi: p.deskripsi ?? '',
        harga: String(p.harga ?? ''),
        gambar: p.gambar || '',
        kategori: p.kategori ?? defaultKategori(),
        stok: String(p.stok ?? 0),
        aktif: Boolean(p.aktif),
      });
      setModal({ type: 'edit', id: row.id_produk });
    } catch (err) {
      if (!handleError(err)) setFormError(err.message);
    }
  };

  const onSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    const payload = {
      ...form,
      harga: parseInt(form.harga, 10),
      stok: parseInt(form.stok, 10),
      aktif: Boolean(form.aktif),
      gambar: form.gambar || null,
    };
    try {
      if (modal === 'create') await adminApi.createProduk(payload);
      else await adminApi.updateProduk(modal.id, payload);
      setModal(null);
      reload();
    } catch (err) {
      if (!handleError(err)) setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm('Hapus produk ini? (Lebih aman nonaktifkan jika sudah ada pesanan.)')) return;
    try {
      await adminApi.deleteProduk(id);
      reload();
    } catch (err) {
      if (!handleError(err)) setFormError(err.message);
    }
  };

  if (loading) return <LoadingBlock />;

  return (
    <div>
      <PageHeader
        title="Daftar produk"
        subtitle={`${rows.length} produk`}
        action={
          <button
            type="button"
            className="btn btn-dark rounded-0"
            onClick={openCreate}
            disabled={kategoriOpts.length === 0}
          >
            + Produk baru
          </button>
        }
      />
      {kategoriOpts.length === 0 && (
        <div className="alert alert-warning">
          Belum ada kategori di tabel <code>kategori_produk</code>. Tambah dulu di menu{' '}
          <Link to="/admin/kategori">Kategori</Link>.
        </div>
      )}
      {(error || formError) && <div className="alert alert-danger">{error || formError}</div>}

      <div className="admin-panel">
        <div className="table-responsive">
          <table className="table admin-table mb-0">
            <thead>
              <tr>
                <th>Gambar</th>
                <th>Nama</th>
                <th>Kategori</th>
                <th>Harga</th>
                <th>Stok</th>
                <th>Status</th>
                <th className="col-actions">Tindakan</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-secondary">
                    Belum ada produk. Klik &quot;Produk baru&quot; untuk menambah.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id_produk} className={!row.aktif ? 'table-secondary' : undefined}>
                    <td>
                      <img src={mediaUrl(row.gambar)} alt="" width={48} height={48} className="admin-thumb" />
                    </td>
                    <td>
                      <strong>{row.nama_produk}</strong>
                    </td>
                    <td>{row.kategori}</td>
                    <td>{formatRupiah(row.harga)}</td>
                    <td>{row.stok ?? 0}</td>
                    <td>
                      <span className="admin-badge">{row.aktif ? 'Aktif' : 'Nonaktif'}</span>
                    </td>
                    <td className="col-actions">
                      <AdminRowActions
                        onDetail={() => openDetail(row)}
                        onEdit={() => openEdit(row)}
                        onDelete={() => onDelete(row.id_produk)}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AdminDetailModal
        show={Boolean(detail)}
        title={detail ? `Detail: ${detail.nama_produk}` : ''}
        onClose={() => setDetail(null)}
      >
        {detail && (
          <>
            <img src={mediaUrl(detail.gambar)} alt="" className="admin-detail-img" />
            <DetailDl
              items={[
                ['ID', detail.id_produk],
                ['Nama', detail.nama_produk],
                ['Kategori', detail.kategori],
                ['Harga', formatRupiah(detail.harga)],
                ['Stok', detail.stok ?? 0],
                ['Status', detail.aktif ? 'Aktif' : 'Nonaktif'],
                ['Deskripsi', detail.deskripsi],
              ]}
            />
          </>
        )}
      </AdminDetailModal>

      <AdminModal show={Boolean(modal)} title={modal === 'create' ? 'Tambah produk' : 'Ubah produk'} onClose={() => setModal(null)} wide>
        <form onSubmit={onSave}>
          {formError && <div className="alert alert-danger">{formError}</div>}
          <div className="mb-3">
            <label className="form-label">Nama produk</label>
            <input className="form-control" value={form.nama_produk} onChange={(e) => setForm({ ...form, nama_produk: e.target.value })} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Deskripsi</label>
            <textarea className="form-control" rows={3} value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })} required />
          </div>
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">Harga (Rp)</label>
              <input type="number" min={0} className="form-control" value={form.harga} onChange={(e) => setForm({ ...form, harga: e.target.value })} required />
            </div>
            <div className="col-md-4">
              <label className="form-label">Stok</label>
              <input type="number" min={0} className="form-control" value={form.stok} onChange={(e) => setForm({ ...form, stok: e.target.value })} required />
            </div>
            <div className="col-md-4">
              <label className="form-label">Kategori</label>
              <select
                className="form-select"
                value={form.kategori}
                onChange={(e) => setForm({ ...form, kategori: e.target.value })}
                required
              >
                {kategoriOpts.map((k) => (
                  <option key={k.id} value={k.nama}>
                    {k.nama}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-12">
              <div className="form-check">
                <input
                  id="produk-aktif"
                  type="checkbox"
                  className="form-check-input"
                  checked={Boolean(form.aktif)}
                  onChange={(e) => setForm({ ...form, aktif: e.target.checked })}
                />
                <label className="form-check-label" htmlFor="produk-aktif">
                  Tampilkan di katalog (aktif)
                </label>
              </div>
              <p className="form-text mb-0">Nonaktif = tidak muncul di beranda/toko/belanja, riwayat pesanan tetap aman.</p>
            </div>
          </div>
          <ImageUploadField
            label="Gambar"
            value={form.gambar}
            onChange={(v) => setForm({ ...form, gambar: v })}
            clearable
          />
          <button type="submit" className="btn btn-dark rounded-0 w-100 mt-2" disabled={saving}>
            {saving ? 'Menyimpan…' : 'Simpan'}
          </button>
        </form>
      </AdminModal>
    </div>
  );
}

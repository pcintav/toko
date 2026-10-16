/**
 * [buatan] Kelola pesanan/pembelian.
 * URL: `/admin/pembelian` — ubah status proses & pembayaran.
 */
import { useEffect, useState } from 'react';
import { adminApi } from '../../api/adminApi';
import { useAdminList } from '../../hooks/useAdminList';
import { useAdminGuard } from '../../hooks/useAdminGuard';
import { METODE_BAYAR, STATUS_BAYAR, STATUS_PROSES } from '../../constants/adminEnums';
import { STATUS_ARTI, konsekuensiStatus } from '../../utils/statusPesanan';
import PageHeader from '../../components/admin/PageHeader';
import LoadingBlock from '../../components/admin/LoadingBlock';
import AdminModal from '../../components/admin/AdminModal';
import AdminDetailModal from '../../components/admin/AdminDetailModal';
import AdminRowActions from '../../components/admin/AdminRowActions';
import DetailDl from '../../components/admin/DetailDl';
import { formatRupiah, formatTanggal } from '../../utils/format';
import { mediaUrl } from '../../utils/media';

export default function AdminPembelianPage() {
  const { handleError } = useAdminGuard();
  const { rows, loading, error, reload } = useAdminList(adminApi.getPembelian);
  const [shippingOpts, setShippingOpts] = useState([]);
  const [modal, setModal] = useState(null); // edit status pesanan
  const [detail, setDetail] = useState(null);
  const [form, setForm] = useState({}); // status proses & pembayaran
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [formInfo, setFormInfo] = useState(''); // penjelasan konsekuensi status

  useEffect(() => {
    adminApi
      .getPengiriman()
      .then((r) => setShippingOpts(Array.isArray(r.data) ? r.data : []))
      .catch((err) => {
        if (!handleError(err)) setFormError(err.message);
      });
  }, [handleError]);

  const openDetail = async (row) => {
    try {
      const r = await adminApi.getPembelianById(row.id);
      setDetail(r.data);
    } catch (err) {
      if (!handleError(err)) setFormError(err.message);
    }
  };

  const openEdit = async (row) => {
    setFormError('');
    setFormInfo('');
    try {
      const r = await adminApi.getPembelianById(row.id);
      const p = r.data;
      const next = {
        metode_pembayaran: p.metode_pembayaran ?? METODE_BAYAR[0],
        pembayaran: p.pembayaran ?? STATUS_BAYAR[0],
        pengiriman: p.pengiriman ?? shippingOpts[0]?.nama ?? '',
        status: p.status ?? STATUS_PROSES[0],
        catatan: p.catatan || '',
      };
      setForm(next);
      setFormInfo(STATUS_ARTI[next.status] || '');
      setModal({ id: row.id, row: p });
    } catch (err) {
      if (!handleError(err)) setFormError(err.message);
    }
  };

  /** Ubah status / metode → terapkan konsekuensi pembayaran di form */
  const onChangeStatusField = (key, value) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      const applied = konsekuensiStatus(next);
      next.pembayaran = applied.pembayaran;
      setFormInfo(
        [STATUS_ARTI[next.status], applied.catatanOtomatis].filter(Boolean).join(' ')
      );
      return next;
    });
  };

  const onSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    const applied = konsekuensiStatus(form);
    const payload = { ...form, pembayaran: applied.pembayaran };
    try {
      const res = await adminApi.updatePembelian(modal.id, payload);
      setModal(null);
      if (res.konsekuensi?.length) setFormInfo(res.konsekuensi.join('; '));
      reload();
    } catch (err) {
      if (!handleError(err)) setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm('Hapus pesanan ini?')) return;
    try {
      await adminApi.deletePembelian(id);
      reload();
    } catch (err) {
      if (!handleError(err)) setFormError(err.message);
    }
  };

  if (loading) return <LoadingBlock />;

  return (
    <div>
      <PageHeader title="Daftar pesanan" subtitle={`${rows.length} transaksi`} />
      {shippingOpts.length === 0 && (
        <div className="alert alert-warning">
          Belum ada opsi kurir di tabel <code>pengiriman</code>. Tambah di menu Pengiriman.
        </div>
      )}
      {(error || formError) && <div className="alert alert-danger">{error || formError}</div>}

      <div className="admin-panel">
        <div className="table-responsive">
          <table className="table admin-table mb-0">
            <thead>
              <tr>
                <th>ID</th>
                <th>Pembeli</th>
                <th>Gambar</th>
                <th>Produk</th>
                <th>Total</th>
                <th>Status</th>
                <th>Bayar</th>
                <th className="col-actions">Tindakan</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-secondary">
                    Belum ada pesanan.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                <tr key={row.id}>
                  <td>#{row.id}</td>
                  <td>
                    <div>{row.nama_pembeli}</div>
                    <small className="text-secondary">{row.email_pembeli || row.uname_pembeli}</small>
                  </td>
                  <td>
                    <img
                      src={mediaUrl(row.gambar_produk)}
                      alt={row.nama_produk}
                      width={48}
                      height={48}
                      className="admin-thumb"
                    />
                  </td>
                  <td>{row.nama_produk}</td>
                  <td>{formatRupiah(row.harga)}</td>
                  <td>
                    <span className="admin-badge">{row.status}</span>
                  </td>
                  <td>{row.pembayaran}</td>
                  <td className="col-actions">
                    <AdminRowActions
                      onDetail={() => openDetail(row)}
                      onEdit={() => openEdit(row)}
                      onDelete={() => onDelete(row.id)}
                    />
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>

      <AdminDetailModal
        show={Boolean(detail)}
        title={detail ? `Detail pesanan #${detail.id}` : ''}
        onClose={() => setDetail(null)}
      >
        {detail && (
          <>
            <div className="row g-3 mb-4">
              <div className="col-sm-5">
                <p className="small text-secondary mb-1">Produk</p>
                <img
                  src={mediaUrl(detail.gambar_produk)}
                  alt={detail.nama_produk}
                  className="admin-detail-img w-100"
                />
              </div>
              {detail.foto_bukti && (
                <div className="col-sm-7">
                  <p className="small text-secondary mb-1">Bukti bayar</p>
                  <img src={mediaUrl(detail.foto_bukti)} alt="Bukti bayar" className="admin-detail-img w-100" />
                </div>
              )}
            </div>
            <DetailDl
              items={[
                ['ID pesanan', detail.id],
                ['Pembeli', detail.nama_pembeli],
                ['Email', detail.email_pembeli],
                ['Produk', detail.nama_produk],
                ['Harga', formatRupiah(detail.harga)],
                ['Alamat kirim', detail.alamat_pembeli],
                ['Telepon', detail.phone_pembeli],
                ['Metode bayar', detail.metode_pembayaran],
                ['Status bayar', detail.pembayaran],
                ['Kurir', detail.pengiriman],
                ['Status pesanan', detail.status],
                ['Catatan', detail.catatan || '—'],
                ['Tanggal', formatTanggal(detail.created_at)],
              ]}
            />
          </>
        )}
      </AdminDetailModal>

      <AdminModal show={Boolean(modal)} title={`Ubah pesanan #${modal?.id}`} onClose={() => setModal(null)} wide>
        {modal?.row && (
          <div className="mb-3 small text-secondary">
            <p className="mb-2">
              {modal.row.nama_pembeli} · {modal.row.nama_produk} · {formatTanggal(modal.row.created_at)}
            </p>
            <div className="d-flex flex-wrap gap-3 align-items-start">
              <img
                src={mediaUrl(modal.row.gambar_produk)}
                alt={modal.row.nama_produk}
                width={72}
                height={72}
                className="admin-thumb"
              />
              {modal.row.foto_bukti && (
                <img src={mediaUrl(modal.row.foto_bukti)} alt="Bukti" className="admin-upload-preview" width={120} />
              )}
            </div>
          </div>
        )}
        <form onSubmit={onSave}>
          {formInfo && (
            <div className="alert alert-light border small mb-3" role="status">
              <strong>Konsekuensi status:</strong> {formInfo}
            </div>
          )}
          {formError && <div className="alert alert-danger py-2">{formError}</div>}
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Metode bayar</label>
              <select
                className="form-select"
                value={form.metode_pembayaran}
                onChange={(e) => onChangeStatusField('metode_pembayaran', e.target.value)}
              >
                {METODE_BAYAR.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label">Status pembayaran</label>
              <select
                className="form-select"
                value={form.pembayaran}
                onChange={(e) => setForm({ ...form, pembayaran: e.target.value })}
              >
                {STATUS_BAYAR.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
              <p className="form-text small mb-0">Bisa berubah otomatis sesuai status pesanan.</p>
            </div>
            <div className="col-md-6">
              <label className="form-label">Kurir</label>
              <select className="form-select" value={form.pengiriman} onChange={(e) => setForm({ ...form, pengiriman: e.target.value })} required>
                {shippingOpts.map((v) => (
                  <option key={v.id} value={v.nama}>
                    {v.nama}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label">Status pesanan</label>
              <select
                className="form-select"
                value={form.status}
                onChange={(e) => onChangeStatusField('status', e.target.value)}
              >
                {STATUS_PROSES.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-12">
              <label className="form-label">Catatan</label>
              <textarea className="form-control" rows={2} value={form.catatan} onChange={(e) => setForm({ ...form, catatan: e.target.value })} />
            </div>
          </div>
          <ul className="small text-secondary mt-3 mb-2 ps-3">
            {STATUS_PROSES.map((s) => (
              <li key={s}>
                <strong>{s}:</strong> {STATUS_ARTI[s]}
              </li>
            ))}
          </ul>
          <button type="submit" className="btn btn-dark rounded-0 w-100 mt-2" disabled={saving}>
            {saving ? 'Menyimpan…' : 'Simpan perubahan'}
          </button>
        </form>
      </AdminModal>
    </div>
  );
}

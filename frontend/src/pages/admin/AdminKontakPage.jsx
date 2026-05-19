/**
 * [buatan] Daftar pesan formulir kontak dari pengunjung.
 * URL: `/admin/kontak` — baca/hapus pesan kontak.
 */
import { useState } from 'react';
import { adminApi } from '../../api/adminApi';
import { useAdminList } from '../../hooks/useAdminList';
import { useAdminGuard } from '../../hooks/useAdminGuard';
import PageHeader from '../../components/admin/PageHeader';
import LoadingBlock from '../../components/admin/LoadingBlock';
import AdminModal from '../../components/admin/AdminModal';
import AdminDetailModal from '../../components/admin/AdminDetailModal';
import AdminRowActions from '../../components/admin/AdminRowActions';
import DetailDl from '../../components/admin/DetailDl';
import { formatTanggal } from '../../utils/format';

export default function AdminKontakPage() {
  const { handleError } = useAdminGuard();
  const { rows, loading, error, reload } = useAdminList(adminApi.getKontak);
  const [modal, setModal] = useState(null); // mode edit status pesan
  const [detail, setDetail] = useState(null); // isi pesan kontak read-only
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const openDetail = async (row) => {
    try {
      const r = await adminApi.getKontakById(row.id);
      setDetail(r.data);
    } catch (err) {
      if (!handleError(err)) setFormError(err.message);
    }
  };

  const openEdit = async (row) => {
    setFormError('');
    try {
      const r = await adminApi.getKontakById(row.id);
      const k = r.data;
      setForm({
        nama_lengkap: k.nama_lengkap ?? '',
        email: k.email ?? '',
        no_hp: String(k.no_hp ?? ''),
        isi_pesan: k.isi_pesan ?? '',
      });
      setModal({ id: row.id });
    } catch (err) {
      if (!handleError(err)) setFormError(err.message);
    }
  };

  const onSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminApi.updateKontak(modal.id, {
        ...form,
        no_hp: parseInt(String(form.no_hp).replace(/\D/g, ''), 10),
      });
      setModal(null);
      reload();
    } catch (err) {
      if (!handleError(err)) setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm('Hapus pesan ini?')) return;
    try {
      await adminApi.deleteKontak(id);
      reload();
    } catch (err) {
      if (!handleError(err)) setFormError(err.message);
    }
  };

  if (loading) return <LoadingBlock />;

  return (
    <div>
      <PageHeader title="Pesan kontak" subtitle={`${rows.length} pesan masuk`} />
      {(error || formError) && <div className="alert alert-danger">{error || formError}</div>}

      <div className="admin-panel">
        <div className="table-responsive">
          <table className="table admin-table mb-0">
            <thead>
              <tr>
                <th>Nama</th>
                <th>Email</th>
                <th>HP</th>
                <th>Pesan</th>
                <th>Tanggal</th>
                <th className="col-actions">Tindakan</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>{row.nama_lengkap}</td>
                  <td>{row.email}</td>
                  <td>{row.no_hp}</td>
                  <td className="admin-desc-clamp" style={{ maxWidth: 200 }}>
                    {row.isi_pesan}
                  </td>
                  <td>{formatTanggal(row.created_at)}</td>
                  <td className="col-actions">
                    <AdminRowActions
                      onDetail={() => openDetail(row)}
                      onEdit={() => openEdit(row)}
                      onDelete={() => onDelete(row.id)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AdminDetailModal
        show={Boolean(detail)}
        title={detail ? `Detail: ${detail.nama_lengkap}` : ''}
        onClose={() => setDetail(null)}
      >
        {detail && (
          <DetailDl
            items={[
              ['ID', detail.id],
              ['Nama lengkap', detail.nama_lengkap],
              ['Email', detail.email],
              ['No. HP', detail.no_hp],
              ['Isi pesan', detail.isi_pesan],
              ['Diterima', formatTanggal(detail.created_at)],
              ['Diubah', formatTanggal(detail.updated_at)],
            ]}
          />
        )}
      </AdminDetailModal>

      <AdminModal show={Boolean(modal)} title="Ubah pesan kontak" onClose={() => setModal(null)}>
        <form onSubmit={onSave}>
          <div className="mb-3">
            <label className="form-label">Nama lengkap</label>
            <input className="form-control" value={form.nama_lengkap} onChange={(e) => setForm({ ...form, nama_lengkap: e.target.value })} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input type="email" className="form-control" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="mb-3">
            <label className="form-label">No. HP</label>
            <input className="form-control" value={form.no_hp} onChange={(e) => setForm({ ...form, no_hp: e.target.value })} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Isi pesan</label>
            <textarea className="form-control" rows={4} value={form.isi_pesan} onChange={(e) => setForm({ ...form, isi_pesan: e.target.value })} required />
          </div>
          <button type="submit" className="btn btn-dark rounded-0 w-100" disabled={saving}>
            {saving ? 'Menyimpan…' : 'Simpan'}
          </button>
        </form>
      </AdminModal>
    </div>
  );
}

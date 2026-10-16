/**
 * [buatan] CRUD master kurir/pengiriman (tabel pengiriman).
 * URL: `/admin/pengiriman`
 */
import { useState } from 'react';
import { adminApi } from '../../api/adminApi';
import { useAdminList } from '../../hooks/useAdminList';
import { useAdminGuard } from '../../hooks/useAdminGuard';
import PageHeader from '../../components/admin/PageHeader';
import LoadingBlock from '../../components/admin/LoadingBlock';
import AdminModal from '../../components/admin/AdminModal';
import AdminRowActions from '../../components/admin/AdminRowActions';

export default function AdminPengirimanPage() {
  const { handleError } = useAdminGuard();
  const { rows, loading, error, reload } = useAdminList(adminApi.getPengiriman);
  const [modal, setModal] = useState(null);
  const [nama, setNama] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const openCreate = () => {
    setNama('');
    setFormError('');
    setModal('create');
  };

  const openEdit = (row) => {
    setNama(row.nama || '');
    setFormError('');
    setModal({ type: 'edit', id: row.id });
  };

  const onSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      if (modal === 'create') await adminApi.createPengiriman({ nama: nama.trim() });
      else await adminApi.updatePengiriman(modal.id, { nama: nama.trim() });
      setModal(null);
      reload();
    } catch (err) {
      if (!handleError(err)) setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm('Hapus opsi pengiriman ini?')) return;
    try {
      await adminApi.deletePengiriman(id);
      reload();
    } catch (err) {
      if (!handleError(err)) setFormError(err.message);
    }
  };

  if (loading) return <LoadingBlock />;

  return (
    <div>
      <PageHeader
        title="Pengiriman / kurir"
        subtitle={`${rows.length} opsi — dipakai form pesanan`}
        action={
          <button type="button" className="btn btn-dark rounded-0" onClick={openCreate}>
            + Kurir baru
          </button>
        }
      />
      {(error || formError) && <div className="alert alert-danger">{error || formError}</div>}

      <div className="admin-panel">
        <div className="table-responsive">
          <table className="table admin-table mb-0">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nama kurir</th>
                <th className="col-actions">Tindakan</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-secondary">
                    Belum ada opsi pengiriman.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id}>
                    <td>{row.id}</td>
                    <td>{row.nama}</td>
                    <td>
                      <AdminRowActions onEdit={() => openEdit(row)} onDelete={() => onDelete(row.id)} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AdminModal
        show={Boolean(modal)}
        title={modal === 'create' ? 'Kurir baru' : 'Ubah kurir'}
        onClose={() => setModal(null)}
      >
        <form onSubmit={onSave}>
          {formError && <div className="alert alert-danger">{formError}</div>}
          <div className="mb-3">
            <label className="form-label">Nama kurir / pengiriman</label>
            <input
              className="form-control"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              required
              maxLength={100}
            />
          </div>
          <button type="submit" className="btn btn-dark rounded-0 w-100" disabled={saving}>
            {saving ? 'Menyimpan…' : 'Simpan'}
          </button>
        </form>
      </AdminModal>
    </div>
  );
}

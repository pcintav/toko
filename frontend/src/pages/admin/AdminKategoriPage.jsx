/**
 * [buatan] CRUD master kategori produk (tabel kategori_produk).
 * URL: `/admin/kategori`
 */
import { useState } from 'react';
import { adminApi } from '../../api/adminApi';
import { useAdminList } from '../../hooks/useAdminList';
import { useAdminGuard } from '../../hooks/useAdminGuard';
import PageHeader from '../../components/admin/PageHeader';
import LoadingBlock from '../../components/admin/LoadingBlock';
import AdminModal from '../../components/admin/AdminModal';
import AdminRowActions from '../../components/admin/AdminRowActions';

export default function AdminKategoriPage() {
  const { handleError } = useAdminGuard();
  const { rows, loading, error, reload } = useAdminList(adminApi.getKategori);
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
      if (modal === 'create') await adminApi.createKategori({ nama: nama.trim() });
      else await adminApi.updateKategori(modal.id, { nama: nama.trim() });
      setModal(null);
      reload();
    } catch (err) {
      if (!handleError(err)) setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm('Hapus kategori ini?')) return;
    try {
      await adminApi.deleteKategori(id);
      reload();
    } catch (err) {
      if (!handleError(err)) setFormError(err.message);
    }
  };

  if (loading) return <LoadingBlock />;

  return (
    <div>
      <PageHeader
        title="Kategori produk"
        subtitle={`${rows.length} kategori — dipakai dropdown produk`}
        action={
          <button type="button" className="btn btn-dark rounded-0" onClick={openCreate}>
            + Kategori baru
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
                <th>Nama kategori</th>
                <th className="col-actions">Tindakan</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-secondary">
                    Belum ada kategori. Tambah dulu sebelum membuat produk.
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
        title={modal === 'create' ? 'Kategori baru' : 'Ubah kategori'}
        onClose={() => setModal(null)}
      >
        <form onSubmit={onSave}>
          {formError && <div className="alert alert-danger">{formError}</div>}
          <div className="mb-3">
            <label className="form-label">Nama kategori</label>
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

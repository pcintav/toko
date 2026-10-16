/**
 * [buatan] CRUD rekening bank toko (tabel bank).
 * URL: `/admin/bank` — nama bank, no rek, atas nama (a.n.).
 */
import { useState } from 'react';
import { adminApi } from '../../api/adminApi';
import { useAdminList } from '../../hooks/useAdminList';
import { useAdminGuard } from '../../hooks/useAdminGuard';
import PageHeader from '../../components/admin/PageHeader';
import LoadingBlock from '../../components/admin/LoadingBlock';
import AdminModal from '../../components/admin/AdminModal';
import AdminRowActions from '../../components/admin/AdminRowActions';

const empty = { nama_bank: '', no_rek: '', atas_nama: '' };

export default function AdminBankPage() {
  const { handleError } = useAdminGuard();
  const { rows, loading, error, reload } = useAdminList(adminApi.getBank);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const openCreate = () => {
    setForm(empty);
    setFormError('');
    setModal('create');
  };

  const openEdit = (row) => {
    setForm({
      nama_bank: row.nama_bank || '',
      no_rek: String(row.no_rek ?? ''),
      atas_nama: row.atas_nama || '',
    });
    setFormError('');
    setModal({ type: 'edit', id: row.id });
  };

  const onSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    const payload = {
      nama_bank: form.nama_bank.trim(),
      no_rek: form.no_rek.trim(),
      atas_nama: form.atas_nama.trim(),
    };
    try {
      if (modal === 'create') await adminApi.createBank(payload);
      else await adminApi.updateBank(modal.id, payload);
      setModal(null);
      reload();
    } catch (err) {
      if (!handleError(err)) setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm('Hapus rekening bank ini?')) return;
    try {
      await adminApi.deleteBank(id);
      reload();
    } catch (err) {
      if (!handleError(err)) setFormError(err.message);
    }
  };

  if (loading) return <LoadingBlock />;

  return (
    <div>
      <PageHeader
        title="Rekening bank"
        subtitle={`${rows.length} rekening — tampil saat checkout Bank Transfer`}
        action={
          <button type="button" className="btn btn-dark rounded-0" onClick={openCreate}>
            + Rekening baru
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
                <th>Bank</th>
                <th>No. rekening</th>
                <th>Atas nama</th>
                <th className="col-actions">Tindakan</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-secondary">
                    Belum ada rekening. Tambah agar pembeli bisa transfer.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id}>
                    <td>{row.id}</td>
                    <td>{row.nama_bank}</td>
                    <td>{row.no_rek}</td>
                    <td>{row.atas_nama || '—'}</td>
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
        title={modal === 'create' ? 'Rekening baru' : 'Ubah rekening'}
        onClose={() => setModal(null)}
      >
        <form onSubmit={onSave}>
          {formError && <div className="alert alert-danger">{formError}</div>}
          <div className="mb-3">
            <label className="form-label">Nama bank</label>
            <input
              className="form-control"
              value={form.nama_bank}
              onChange={(e) => setForm({ ...form, nama_bank: e.target.value })}
              required
              maxLength={50}
              placeholder="BCA"
            />
          </div>
          <div className="mb-3">
            <label className="form-label">No. rekening</label>
            <input
              className="form-control"
              value={form.no_rek}
              onChange={(e) => setForm({ ...form, no_rek: e.target.value })}
              required
              maxLength={50}
              placeholder="1234567890"
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Atas nama (a.n.)</label>
            <input
              className="form-control"
              value={form.atas_nama}
              onChange={(e) => setForm({ ...form, atas_nama: e.target.value })}
              required
              maxLength={100}
              placeholder="Nama pemilik rekening"
            />
            <p className="form-text mb-0">Ditampilkan ke pembeli saat transfer agar cocok dengan rekening tujuan.</p>
          </div>
          <button type="submit" className="btn btn-dark rounded-0 w-100" disabled={saving}>
            {saving ? 'Menyimpan…' : 'Simpan'}
          </button>
        </form>
      </AdminModal>
    </div>
  );
}

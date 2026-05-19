/**
 * [buatan] Profil pembeli (edit data + password).
 * URL: `/akun/profil` — pembeliApi.putMe.
 */
import { useEffect, useState } from 'react';
import { pembeliApi } from '../../api/pembeliApi';
import { usePembeliGuard } from '../../hooks/usePembeliGuard';
import PageHeader from '../../components/admin/PageHeader';
import LoadingBlock from '../../components/admin/LoadingBlock';
import ImageUploadField from '../../components/admin/ImageUploadField';
import { KELAMIN } from '../../constants/adminEnums';
import { normalizeKelamin } from '../../utils/kelamin';
import { toDateInputValue } from '../../utils/format';
import ProfilePasswordFields from '../../components/profile/ProfilePasswordFields';
import { buildProfilePayload, emptyPasswordFields } from '../../utils/profileSubmit';

export default function PembeliProfilPage() {
  const { handleError } = usePembeliGuard();
  const [form, setForm] = useState(null); // null sampai getMe selesai
  const [email, setEmail] = useState(''); // read-only di form
  const [uname, setUname] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let alive = true;
    pembeliApi
      .getMe()
      .then((r) => {
        if (!alive) return;
        const p = r.data;
        setEmail(p.email || '');
        setUname(p.uname || '');
        setForm({
          nama_d: p.nama_d,
          nama_b: p.nama_b,
          kelamin: normalizeKelamin(p.kelamin),
          lahir: toDateInputValue(p.lahir),
          alamat: p.alamat,
          phone: String(p.phone),
          foto: p.foto || '',
          ...emptyPasswordFields,
        });
      })
      .catch((err) => {
        if (!alive) return;
        handleError(err);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [handleError]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const setPassword = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const payload = buildProfilePayload(form);
      payload.phone = parseInt(String(payload.phone).replace(/\D/g, ''), 10);
      await pembeliApi.putMe(payload);
      setForm((f) => ({ ...f, ...emptyPasswordFields }));
      setSuccess('Profil berhasil diperbarui.');
    } catch (err) {
      if (!handleError(err)) setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingBlock />;
  if (!form) return null;

  return (
    <div>
      <PageHeader title="Profil Saya" subtitle="Ubah data akun pembeli" />
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={onSubmit} className="admin-panel" style={{ maxWidth: 520 }}>
        <div className="mb-3">
          <label className="form-label text-secondary small">Email (tidak bisa diubah)</label>
          <input className="form-control" value={email} disabled readOnly />
        </div>
        <div className="mb-3">
          <label className="form-label text-secondary small">Username (tidak bisa diubah)</label>
          <input className="form-control" value={uname} disabled readOnly />
        </div>
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Nama depan</label>
            <input className="form-control" value={form.nama_d} onChange={set('nama_d')} required />
          </div>
          <div className="col-md-6">
            <label className="form-label">Nama belakang</label>
            <input className="form-control" value={form.nama_b} onChange={set('nama_b')} required />
          </div>
          <div className="col-md-6">
            <label className="form-label">Jenis kelamin</label>
            <select className="form-select" value={form.kelamin} onChange={set('kelamin')}>
              {KELAMIN.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label">Tanggal lahir</label>
            <input type="date" className="form-control" value={form.lahir} onChange={set('lahir')} required />
          </div>
          <div className="col-12">
            <label className="form-label">Alamat</label>
            <textarea className="form-control" rows={2} value={form.alamat} onChange={set('alamat')} required />
          </div>
          <div className="col-12">
            <label className="form-label">Telepon</label>
            <input className="form-control" value={form.phone} onChange={set('phone')} required />
          </div>
        </div>
        <ImageUploadField
          label="Foto profil"
          value={form.foto}
          onChange={(v) => setForm((f) => ({ ...f, foto: v }))}
          uploadFn={pembeliApi.uploadGambar}
          clearable
        />
        <ProfilePasswordFields values={form} onChange={setPassword} />
        <button type="submit" className="btn btn-dark rounded-0 mt-3" disabled={saving}>
          {saving ? 'Menyimpan…' : 'Simpan profil'}
        </button>
      </form>
    </div>
  );
}

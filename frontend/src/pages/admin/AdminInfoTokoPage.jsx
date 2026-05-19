/**
 * [buatan] Form pengaturan info toko (nama, logo, bank, jam, WA).
 * URL: `/admin/info-toko` — adminApi.updateInfoToko, AdminShopContext.reloadInfo.
 */
import { useEffect, useState } from 'react';
import { adminApi } from '../../api/adminApi';
import { useAdminGuard } from '../../hooks/useAdminGuard';
import { useAdminShop } from '../../context/AdminShopContext';
import PageHeader from '../../components/admin/PageHeader';
import LoadingBlock from '../../components/admin/LoadingBlock';
import ImageUploadField from '../../components/admin/ImageUploadField';
import { mediaUrl } from '../../utils/media';
import { jamOperasional } from '../../utils/format';

const FORM_KOSONG = {
  logo_toko: '',
  nama_toko: '',
  tentang: '',
  foto_banner: '',
  alamat_toko: '',
  email_toko: '',
  tlp_toko: '',
  nama_bank_a: '',
  nama_bank_b: '',
  no_rek_a: '',
  no_rek_b: '',
  jam_buka: '8',
  jam_tutup: '20',
  logo_wa: '',
  logo_ig: '',
  logo_fb: '',
  link_wa: '',
  link_ig: '',
  link_fb: '',
};

function mapDbKeForm(d) {
  return {
    logo_toko: d.logo_toko || '',
    nama_toko: d.nama_toko || '',
    tentang: d.tentang || '',
    foto_banner: d.foto_banner || '',
    alamat_toko: d.alamat_toko || '',
    email_toko: d.email_toko || '',
    tlp_toko: d.tlp_toko != null ? String(d.tlp_toko) : '',
    nama_bank_a: d.nama_bank_a || '',
    nama_bank_b: d.nama_bank_b || '',
    no_rek_a: d.no_rek_a != null ? String(d.no_rek_a) : '',
    no_rek_b: d.no_rek_b != null ? String(d.no_rek_b) : '',
    jam_buka: d.jam_buka != null ? String(d.jam_buka) : '8',
    jam_tutup: d.jam_tutup != null ? String(d.jam_tutup) : '20',
    logo_wa: d.logo_wa || '',
    logo_ig: d.logo_ig || '',
    logo_fb: d.logo_fb || '',
    link_wa: d.link_wa || '',
    link_ig: d.link_ig || '',
    link_fb: d.link_fb || '',
  };
}

function FormSection({ title, children }) {
  return (
    <section className="admin-form-section">
      <h3 className="admin-form-section-title">{title}</h3>
      {children}
    </section>
  );
}

export default function AdminInfoTokoPage() {
  const { handleError } = useAdminGuard();
  const { reloadInfo } = useAdminShop();
  const [form, setForm] = useState(FORM_KOSONG); // semua field info toko
  const [baru, setBaru] = useState(false); // true jika belum ada baris di DB (404)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let alive = true;
    adminApi
      .getInfoToko()
      .then((r) => {
        if (!alive) return;
        setForm(mapDbKeForm(r.data));
        setBaru(false);
      })
      .catch((err) => {
        if (!alive) return;
        if (err.status === 404) {
          setForm(FORM_KOSONG);
          setBaru(true);
          return;
        }
        if (!handleError(err)) setError(err.message);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [handleError]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const setVal = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const payload = {
        ...form,
        tlp_toko: parseInt(String(form.tlp_toko).replace(/\D/g, ''), 10),
        no_rek_a: parseInt(String(form.no_rek_a).replace(/\D/g, ''), 10),
        no_rek_b: parseInt(String(form.no_rek_b).replace(/\D/g, ''), 10),
        jam_buka: parseInt(form.jam_buka, 10),
        jam_tutup: parseInt(form.jam_tutup, 10),
      };
      const res = await adminApi.updateInfoToko(payload);
      await reloadInfo();
      setSuccess(res.message || 'Data toko tersimpan.');
      setBaru(false);
    } catch (err) {
      if (!handleError(err)) setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingBlock text="Memuat form info toko…" />;

  const jamTampil = jamOperasional(form.jam_buka, form.jam_tutup);

  return (
    <div className="admin-info-toko-page">
      <PageHeader
        title="Info toko"
        subtitle="Ubah data beranda (tentang, banner), logo, kontak, dan pembayaran"
      />

      {baru && (
        <div className="alert alert-info">
          Belum ada data toko. Isi form lalu klik <strong>Simpan perubahan</strong>.
        </div>
      )}
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={onSubmit} className="admin-info-toko-form">
        <div className="row g-4">
          <div className="col-lg-8">
            <div className="admin-panel">
              <FormSection title="Beranda (teks & banner)">
                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label">Tentang / teks promosi banner</label>
                    <textarea
                      className="form-control"
                      rows={4}
                      value={form.tentang}
                      onChange={set('tentang')}
                      placeholder="Contoh: Menyediakan berbagai produk segar dan berkualitas…"
                      required
                    />
                    <p className="form-text small text-secondary mb-0">
                      Ditampilkan di banner atas beranda (bukan alamat).
                    </p>
                  </div>
                  <div className="col-12">
                    <ImageUploadField
                      label="Foto banner beranda (opsional)"
                      value={form.foto_banner}
                      onChange={(v) => setVal('foto_banner', v)}
                    />
                  </div>
                </div>
              </FormSection>

              <FormSection title="Identitas toko">
                <div className="row g-3">
                  <div className="col-md-8">
                    <label className="form-label">Nama toko</label>
                    <input className="form-control" value={form.nama_toko} onChange={set('nama_toko')} required />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Email toko</label>
                    <input type="email" className="form-control" value={form.email_toko} onChange={set('email_toko')} required />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Alamat lengkap</label>
                    <textarea className="form-control" rows={3} value={form.alamat_toko} onChange={set('alamat_toko')} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Telepon / WhatsApp toko</label>
                    <input className="form-control" value={form.tlp_toko} onChange={set('tlp_toko')} placeholder="628xxxxxxxxxx" required />
                  </div>
                </div>
              </FormSection>

              <FormSection title="Jam operasional">
                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label">Jam buka (0–23)</label>
                    <input type="number" min={0} max={23} className="form-control" value={form.jam_buka} onChange={set('jam_buka')} required />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Jam tutup (0–23)</label>
                    <input type="number" min={0} max={23} className="form-control" value={form.jam_tutup} onChange={set('jam_tutup')} required />
                  </div>
                  <div className="col-md-4 d-flex align-items-end">
                    <p className="text-secondary small mb-2">
                      Tampil di web: <strong>{jamTampil || '—'}</strong>
                    </p>
                  </div>
                </div>
              </FormSection>

              <FormSection title="Rekening pembayaran">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Bank 1</label>
                    <input className="form-control" value={form.nama_bank_a} onChange={set('nama_bank_a')} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">No. rekening 1</label>
                    <input className="form-control" value={form.no_rek_a} onChange={set('no_rek_a')} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Bank 2</label>
                    <input className="form-control" value={form.nama_bank_b} onChange={set('nama_bank_b')} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">No. rekening 2</label>
                    <input className="form-control" value={form.no_rek_b} onChange={set('no_rek_b')} required />
                  </div>
                </div>
              </FormSection>

              <FormSection title="Media sosial">
                <div className="row g-4">
                  <div className="col-md-4">
                    <ImageUploadField
                      label="Ikon WhatsApp"
                      value={form.logo_wa}
                      onChange={(v) => setVal('logo_wa', v)}
                      clearable
                    />
                    <label className="form-label mt-2">Link WhatsApp</label>
                    <input className="form-control" value={form.link_wa} onChange={set('link_wa')} placeholder="https://wa.me/62..." required />
                  </div>
                  <div className="col-md-4">
                    <ImageUploadField
                      label="Ikon Instagram"
                      value={form.logo_ig}
                      onChange={(v) => setVal('logo_ig', v)}
                      clearable
                    />
                    <label className="form-label mt-2">Link Instagram</label>
                    <input className="form-control" value={form.link_ig} onChange={set('link_ig')} required />
                  </div>
                  <div className="col-md-4">
                    <ImageUploadField
                      label="Ikon Facebook"
                      value={form.logo_fb}
                      onChange={(v) => setVal('logo_fb', v)}
                      clearable
                    />
                    <label className="form-label mt-2">Link Facebook</label>
                    <input className="form-control" value={form.link_fb} onChange={set('link_fb')} required />
                  </div>
                </div>
              </FormSection>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="admin-panel admin-info-toko-side sticky-lg-top">
              <FormSection title="Logo toko">
                <ImageUploadField
                  label="Logo (header & footer)"
                  value={form.logo_toko}
                  onChange={(v) => setVal('logo_toko', v)}
                  clearable
                />
                <div className="admin-info-toko-preview mt-3">
                  <p className="small text-secondary mb-2">Pratinjau</p>
                  <img src={mediaUrl(form.logo_toko)} alt="" className="admin-info-toko-preview-img" />
                  <p className="fw-semibold mt-2 mb-0">{form.nama_toko || 'Nama toko'}</p>
                </div>
              </FormSection>

              <button type="submit" className="btn btn-dark rounded-0 w-100 py-3 mt-2" disabled={saving}>
                {saving ? 'Menyimpan…' : 'Simpan perubahan'}
              </button>
              <p className="text-secondary small text-center mt-2 mb-0">
                Perubahan langsung tampil di halaman beranda.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

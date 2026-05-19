/**
 * [buatan] Bagian kontak beranda (#kontak) + formulir pesan.
 *
 * Menampilkan info toko dan POST ke api.postKontak. Dipakai HomePage.
 */
import { useState } from 'react';
import { api } from '../../api/client';
import { jamOperasional } from '../../utils/format';

/** Props: info toko, loading — formulir POST kontak + daftar info toko. */
export default function ContactSection({ info, loading }) {
  // State formulir kontak beranda
  const [form, setForm] = useState({
    nama_lengkap: '',
    email: '',
    no_hp: '',
    isi_pesan: '',
  });
  const [status, setStatus] = useState({ type: '', message: '' }); // alert sukses/gagal
  const [submitting, setSubmitting] = useState(false);

  const onChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  // Kirim pesan kontak ke backend
  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus({ type: '', message: '' });
    try {
      await api.postKontak({
        ...form,
        no_hp: form.no_hp.replace(/\D/g, ''),
      });
      setStatus({
        type: 'success',
        message: 'Terima kasih. Pesan Anda telah kami terima dan akan segera ditanggapi.',
      });
      setForm({ nama_lengkap: '', email: '', no_hp: '', isi_pesan: '' });
    } catch (err) {
      setStatus({ type: 'danger', message: err.message || 'Gagal mengirim pesan. Silakan coba lagi.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <section id="kontak" className="section-pad section-contact">
        <div className="container-xl text-center text-secondary py-5">Memuat kontak…</div>
      </section>
    );
  }

  if (!info) return null;

  const jam = jamOperasional(info.jam_buka, info.jam_tutup);

  return (
    <section id="kontak" className="section-pad section-contact">
      <div className="container-xl">
        <div className="row g-5 align-items-start">
          <div className="col-lg-5">
            <p className="section-eyebrow">{info.nama_toko}</p>
            <h2 className="section-title">Hubungi kami</h2>
            <ul className="contact-info-list">
              <li>
                <strong>Alamat</strong>
                <span>{info.alamat_toko}</span>
              </li>
              <li>
                <strong>Email</strong>
                <span>{info.email_toko}</span>
              </li>
              <li>
                <strong>Telepon</strong>
                <span>+{info.tlp_toko}</span>
              </li>
              {jam && (
                <li>
                  <strong>Jam buka</strong>
                  <span>{jam}</span>
                </li>
              )}
            </ul>
          </div>
          <div className="col-lg-7">
            <form className="contact-form card border-0 shadow-sm" onSubmit={onSubmit}>
              <div className="card-body p-4 p-md-5">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label" htmlFor="nama_lengkap">
                      Nama lengkap
                    </label>
                    <input
                      id="nama_lengkap"
                      name="nama_lengkap"
                      className="form-control"
                      value={form.nama_lengkap}
                      onChange={onChange}
                      required
                      maxLength={50}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label" htmlFor="email">
                      Email
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      className="form-control"
                      value={form.email}
                      onChange={onChange}
                      required
                      maxLength={30}
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label" htmlFor="no_hp">
                      No. HP
                    </label>
                    <input
                      id="no_hp"
                      name="no_hp"
                      className="form-control"
                      value={form.no_hp}
                      onChange={onChange}
                      required
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label" htmlFor="isi_pesan">
                      Pesan
                    </label>
                    <textarea
                      id="isi_pesan"
                      name="isi_pesan"
                      className="form-control"
                      rows={4}
                      value={form.isi_pesan}
                      onChange={onChange}
                      required
                    />
                  </div>
                </div>
                {status.message && (
                  <div className={`alert alert-${status.type} mt-3 mb-0`} role="alert">
                    {status.message}
                  </div>
                )}
                <button
                  type="submit"
                  className="btn btn-dark btn-lg w-100 mt-4 rounded-0 text-uppercase"
                  disabled={submitting}
                >
                  {submitting ? 'Mengirim…' : 'Kirim pesan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

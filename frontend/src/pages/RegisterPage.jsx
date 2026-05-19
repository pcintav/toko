/**
 * [buatan] Pendaftaran akun pembeli baru.
 *
 * URL: `/daftar` — api.register, lalu login otomatis ke area `/akun`.
 */
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { KELAMIN } from '../constants/adminEnums';

// Nilai awal form pendaftaran pembeli
const initial = {
  nama_d: '',
  nama_b: '',
  kelamin: 'Laki-laki',
  lahir: '',
  alamat: '',
  phone: '',
  email: '',
  uname: '',
  passwd: '',
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const from = location.state?.from;
  const [form, setForm] = useState(initial);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Helper: update satu field form dari event input/select
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  // Submit pendaftaran pembeli → auto login
  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.register(form);
      login(res.token, 'pembeli');
      navigate(from && from.startsWith('/akun') ? from : '/akun', { replace: true });
    } catch (err) {
      setError(err.message || 'Pendaftaran gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-layout auth-layout--narrow">
        <div className="auth-main">
          <div className="auth-card">
            <Link to="/login" className="auth-back">
              ← Sudah punya akun
            </Link>
            <h2 className="auth-heading">Daftar pembeli</h2>
            <p className="text-secondary mb-4">Buat akun untuk berbelanja dan mengelola profil Anda.</p>

            <form onSubmit={onSubmit} className="auth-form">
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
                <div className="col-md-6">
                  <label className="form-label">Telepon</label>
                  <input className="form-control" value={form.phone} onChange={set('phone')} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Email</label>
                  <input type="email" className="form-control" value={form.email} onChange={set('email')} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Username</label>
                  <input className="form-control" value={form.uname} onChange={set('uname')} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Password</label>
                  <input type="password" className="form-control" value={form.passwd} onChange={set('passwd')} required />
                </div>
              </div>
              {error && (
                <div className="alert alert-danger py-2 mt-3" role="alert">
                  {error}
                </div>
              )}
              <button
                type="submit"
                className="btn btn-dark w-100 rounded-0 text-uppercase py-3 mt-4"
                disabled={loading}
              >
                {loading ? 'Memproses…' : 'Daftar'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

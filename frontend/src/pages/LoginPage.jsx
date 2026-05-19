/**
 * [buatan] Halaman masuk (admin atau pembeli).
 *
 * URL: `/login` — api.login, AuthContext.login, redirect dari state.from.
 */
import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { mediaUrl } from '../utils/media';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoggedIn, isAdmin, isPembeli } = useAuth();

  const [info, setInfo] = useState(null); // logo/nama toko di panel kiri
  const [credential, setCredential] = useState(''); // email atau username
  const [passwd, setPasswd] = useState('');
  const [error, setError] = useState(''); // pesan gagal login
  const [loading, setLoading] = useState(false); // tombol submit disabled

  const from = location.state?.from; // URL tujuan setelah login (dari RequireAuth)

  // Sudah login → lempar ke dashboard sesuai peran
  useEffect(() => {
    if (!isLoggedIn) return;
    if (isAdmin) {
      navigate(from && from.startsWith('/admin') ? from : '/admin', { replace: true });
    } else if (isPembeli) {
      navigate(from && from.startsWith('/akun') ? from : '/akun', { replace: true });
    }
  }, [isLoggedIn, isAdmin, isPembeli, navigate, from]);

  useEffect(() => {
    api.getInfoToko().then((r) => setInfo(r.data)).catch(() => {});
  }, []);

  // Submit form login → simpan token → redirect
  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.login(credential.trim(), passwd);
      login(res.token, res.role);
      if (res.role === 'admin') {
        navigate(from && from.startsWith('/admin') ? from : '/admin', { replace: true });
      } else {
        navigate(from && from.startsWith('/akun') ? from : '/akun', { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Login gagal');
    } finally {
      setLoading(false);
    }
  };

  const namaToko = info?.nama_toko || 'Toko';

  return (
    <div className="auth-page">
      <div className="auth-layout">
        <div className="auth-aside d-none d-lg-flex">
          <div className="auth-aside-inner">
            <img src={mediaUrl(info?.logo_toko)} alt="" className="auth-aside-logo" width={64} height={64} />
            <h1 className="auth-aside-title">{namaToko}</h1>
            <p className="auth-aside-text">{info?.alamat_toko}</p>
          </div>
        </div>

        <div className="auth-main">
          <div className="auth-card">
            <Link to="/" className="auth-back">
              ← Kembali ke beranda
            </Link>
            <h2 className="auth-heading">Masuk</h2>
            <p className="text-secondary mb-4">
              Masuk dengan email atau username Anda. Setelah berhasil masuk, Anda akan diarahkan ke
              halaman yang sesuai.
            </p>

            <form onSubmit={onSubmit} className="auth-form">
              <div className="mb-3">
                <label className="form-label" htmlFor="credential">
                  Email atau username
                </label>
                <input
                  id="credential"
                  type="text"
                  className="form-control"
                  value={credential}
                  onChange={(e) => setCredential(e.target.value)}
                  autoComplete="username"
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label" htmlFor="passwd">
                  Password
                </label>
                <input
                  id="passwd"
                  type="password"
                  className="form-control"
                  value={passwd}
                  onChange={(e) => setPasswd(e.target.value)}
                  autoComplete="current-password"
                  required
                />
              </div>
              {error && (
                <div className="alert alert-danger py-2" role="alert">
                  {error}
                </div>
              )}
              <button
                type="submit"
                className="btn btn-dark w-100 rounded-0 text-uppercase py-3"
                disabled={loading}
              >
                {loading ? 'Memproses…' : 'Masuk'}
              </button>
            </form>

            <p className="text-center text-secondary small mt-4 mb-0">
              Belum punya akun pembeli?{' '}
              <Link to="/daftar" state={from ? { from } : undefined} className="auth-link">
                Daftar sekarang
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

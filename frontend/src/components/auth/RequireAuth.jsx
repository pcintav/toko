/**
 * [buatan] Pembungkus rute yang wajib login (dan opsional peran tertentu).
 *
 * Mengalihkan ke `/login` jika belum masuk; memisahkan admin vs pembeli.
 * Dipakai di routes/index.jsx untuk `/admin/*` dan `/akun/*`.
 */
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function RequireAuth({ children, role }) {
  const { isLoggedIn, role: userRole } = useAuth();
  const location = useLocation(); // simpan path asal untuk redirect setelah login

  // -------------------------------------------------------------------------
  // Cek 1: belum login → arahkan ke /login dengan state.from
  // -------------------------------------------------------------------------
  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // -------------------------------------------------------------------------
  // Cek 2: login tapi role salah (mis. pembeli buka /admin) → dashboard role yang benar
  // -------------------------------------------------------------------------
  if (role && userRole !== role) {
    if (userRole === 'admin') return <Navigate to="/admin" replace />;
    if (userRole === 'pembeli') return <Navigate to="/akun" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
}

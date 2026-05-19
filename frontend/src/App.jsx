/**
 * App.jsx — kerangka utama aplikasi (file bawaan Vite, diedit).
 *
 * Fungsi:
 * - Membungkus seluruh app dengan AuthProvider (status login di seluruh halaman).
 * - Mengaktifkan React Router (BrowserRouter) agar URL bisa pindah halaman tanpa reload.
 * - Memanggil AppRoutes dari routes/index.jsx (daftar semua path/URL).
 *
 * Catatan: daftar <Route> tidak ditulis di sini, melainkan di routes/index.jsx.
 */
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes';

export default function App() {
  return (
  // AuthProvider: token & role tersedia di Header, RequireAuth, halaman login
    <AuthProvider>
      {/* BrowserRouter: sinkronkan URL browser dengan React Router */}
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

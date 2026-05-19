/**
 * routes/index.jsx — peta URL aplikasi (file buatan project).
 *
 * Alur: App.jsx → BrowserRouter → AppRoutes (file ini) → halaman sesuai path.
 * React Router v6: Route bersarang = layout (AdminLayout) + halaman anak (Outlet).
 */
import { Routes, Route, Navigate } from 'react-router-dom';
import RequireAuth from '../components/auth/RequireAuth';
import AdminLayout from '../layouts/AdminLayout';
import PembeliLayout from '../layouts/PembeliLayout';
import HomePage from '../pages/HomePage';
import TokoPage from '../pages/TokoPage';
import ArtikelListPage from '../pages/ArtikelListPage';
import ProductDetailPage from '../pages/ProductDetailPage';
import ArtikelDetailPage from '../pages/ArtikelDetailPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import PembeliOverviewPage from '../pages/pembeli/PembeliOverviewPage';
import PembeliBelanjaPage from '../pages/pembeli/PembeliBelanjaPage';
import PembeliPesananPage from '../pages/pembeli/PembeliPesananPage';
import PembeliProfilPage from '../pages/pembeli/PembeliProfilPage';
import AdminOverviewPage from '../pages/admin/AdminOverviewPage';
import AdminProdukPage from '../pages/admin/AdminProdukPage';
import AdminPembeliPage from '../pages/admin/AdminPembeliPage';
import AdminPembelianPage from '../pages/admin/AdminPembelianPage';
import AdminArtikelPage from '../pages/admin/AdminArtikelPage';
import AdminKontakPage from '../pages/admin/AdminKontakPage';
import AdminInfoTokoPage from '../pages/admin/AdminInfoTokoPage';
import AdminProfilPage from '../pages/admin/AdminProfilPage';

export default function AppRoutes() {
  return (
    <Routes>
      {/* ================================================================= */}
      {/* ZONA PUBLIK — tidak lewat RequireAuth; API tanpa token atau publik */}
      {/* ================================================================= */}
      <Route path="/" element={<HomePage />} />
      <Route path="/toko" element={<TokoPage />} />
      <Route path="/artikel" element={<ArtikelListPage />} />
      {/* :id = id_produk dari database; dipakai ProductDetailPage */}
      <Route path="/produk/:id" element={<ProductDetailPage />} />
      <Route path="/artikel/:id" element={<ArtikelDetailPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/daftar" element={<RegisterPage />} />

      {/* ================================================================= */}
      {/* PANEL ADMIN — URL /admin/... ; wajib token role admin */}
      {/* RequireAuth membungkus AdminLayout; child Route = konten <Outlet /> */}
      {/* ================================================================= */}
      <Route
        path="/admin"
        element={
          <RequireAuth role="admin">
            <AdminLayout />
          </RequireAuth>
        }
      >
        <Route index element={<AdminOverviewPage />} />
        <Route path="produk" element={<AdminProdukPage />} />
        <Route path="pembeli" element={<AdminPembeliPage />} />
        <Route path="pembelian" element={<AdminPembelianPage />} />
        <Route path="artikel" element={<AdminArtikelPage />} />
        <Route path="kontak" element={<AdminKontakPage />} />
        <Route path="info-toko" element={<AdminInfoTokoPage />} />
        <Route path="profil" element={<AdminProfilPage />} />
      </Route>

      {/* ================================================================= */}
      {/* AREA PEMBELI — URL /akun/... ; wajib token role pembeli */}
      {/* ================================================================= */}
      <Route
        path="/akun"
        element={
          <RequireAuth role="pembeli">
            <PembeliLayout />
          </RequireAuth>
        }
      >
        <Route index element={<PembeliOverviewPage />} />
        {/* ?produk= di query string — preselect produk di form checkout */}
        <Route path="belanja" element={<PembeliBelanjaPage />} />
        <Route path="pesanan" element={<PembeliPesananPage />} />
        <Route path="profil" element={<PembeliProfilPage />} />
      </Route>

      {/* Path tidak cocok → beranda (replace agar tidak bisa "back" ke URL palsu) */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

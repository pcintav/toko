/**
 * [buatan] Dashboard ringkasan pembeli.
 * URL: `/akun` — pembeliApi.getDashboard.
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { pembeliApi } from '../../api/pembeliApi';
import { usePembeliGuard } from '../../hooks/usePembeliGuard';
import StatCard from '../../components/admin/StatCard';
import LoadingBlock from '../../components/admin/LoadingBlock';
import { formatRupiah, formatTanggal } from '../../utils/format';
import { mediaUrl } from '../../utils/media';

export default function PembeliOverviewPage() {
  const { handleError } = usePembeliGuard();
  const [data, setData] = useState(null); // ringkasan dari GET /api/users/dashboard
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    pembeliApi
      .getDashboard()
      .then((r) => {
        if (alive) setData(r.data);
      })
      .catch((err) => {
        if (!alive) return;
        if (!handleError(err)) setError(err.message);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [handleError]);

  if (loading) return <LoadingBlock />;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!data) return null;

  const stats = [
    { label: 'Total pesanan', value: data.total_pesanan ?? 0, tone: 'dark' },
    { label: 'Pesanan aktif', value: data.pesanan_aktif ?? 0, tone: 'warn' },
    { label: 'Belum dibayar', value: data.belum_dibayar ?? 0, tone: 'gold' },
  ];

  return (
    <div>
      <div className="admin-stats-grid">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <div className="admin-panel mt-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="admin-section-title mb-0">Total belanja (sudah dibayar)</h2>
          <span className="admin-revenue">{formatRupiah(data.total_belanja_dibayar ?? 0)}</span>
        </div>
        <p className="text-secondary small mb-0">Akumulasi harga produk pada pesanan berstatus pembayaran &quot;Dibayar&quot;.</p>
      </div>

      <div className="admin-panel mt-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="admin-section-title mb-0">Pesanan terbaru</h2>
          <Link to="/akun/pesanan" className="btn btn-sm btn-outline-dark rounded-0">
            Lihat semua
          </Link>
        </div>
        {(data.pesanan_terbaru || []).length === 0 ? (
          <p className="text-secondary mb-0">
            Belum ada pesanan.{' '}
            <Link to="/akun/belanja">Mulai belanja</Link>
          </p>
        ) : (
          <div className="table-responsive">
            <table className="table admin-table mb-0">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Gambar</th>
                  <th>Produk</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Bayar</th>
                  <th>Tanggal</th>
                </tr>
              </thead>
              <tbody>
                {data.pesanan_terbaru.map((row) => (
                  <tr key={row.id}>
                    <td>#{row.id}</td>
                    <td>
                      <img
                        src={mediaUrl(row.gambar_produk)}
                        alt={row.nama_produk}
                        width={48}
                        height={48}
                        className="admin-thumb"
                      />
                    </td>
                    <td>{row.nama_produk}</td>
                    <td>{formatRupiah(row.harga_produk)}</td>
                    <td>
                      <span className="admin-badge">{row.status}</span>
                    </td>
                    <td>{row.pembayaran}</td>
                    <td className="text-nowrap">{formatTanggal(row.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="admin-quick-links mt-4">
        <Link to="/akun/belanja" className="admin-quick-link">
          Belanja produk
        </Link>
        <Link to="/akun/pesanan" className="admin-quick-link">
          Riwayat pesanan
        </Link>
        <Link to="/akun/profil" className="admin-quick-link">
          Edit profil
        </Link>
      </div>
    </div>
  );
}

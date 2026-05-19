/**
 * [buatan] Riwayat pesanan pembeli.
 * URL: `/akun/pesanan` — daftar pembelian + detail modal.
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { pembeliApi } from '../../api/pembeliApi';
import { usePembeliList } from '../../hooks/usePembeliList';
import { usePembeliGuard } from '../../hooks/usePembeliGuard';
import PageHeader from '../../components/admin/PageHeader';
import LoadingBlock from '../../components/admin/LoadingBlock';
import AdminDetailModal from '../../components/admin/AdminDetailModal';
import DetailDl from '../../components/admin/DetailDl';
import { formatRupiah, formatTanggal } from '../../utils/format';
import { mediaUrl } from '../../utils/media';
import BankTransferInfo from '../../components/pembeli/BankTransferInfo';

export default function PembeliPesananPage() {
  const { handleError } = usePembeliGuard();
  const { rows, loading, error } = usePembeliList(pembeliApi.getPembelian);
  const [detail, setDetail] = useState(null); // satu pesanan untuk modal detail
  const [detailError, setDetailError] = useState('');
  const [infoToko, setInfoToko] = useState(null); // rekening untuk BankTransferInfo

  useEffect(() => {
    pembeliApi.getInfoToko().then((r) => setInfoToko(r.data)).catch(() => {});
  }, []);

  // Muat detail pesanan lengkap dari GET /pembelian/:id
  const openDetail = async (row) => {
    setDetailError('');
    try {
      const r = await pembeliApi.getPembelianById(row.id);
      setDetail(r.data);
    } catch (err) {
      if (!handleError(err)) setDetailError(err.message);
    }
  };

  if (loading) return <LoadingBlock />;

  return (
    <div>
      <PageHeader title="Pesanan Saya" subtitle={`${rows.length} pesanan`} />
      {(error || detailError) && <div className="alert alert-danger">{error || detailError}</div>}

      <div className="admin-panel">
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
                <th>Kurir</th>
                <th>Tanggal</th>
                <th className="col-actions">Tindakan</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-secondary">
                    Belum ada pesanan. <Link to="/akun/belanja">Belanja sekarang</Link>
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
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
                    <td>{row.pengiriman}</td>
                    <td className="text-nowrap">{formatTanggal(row.created_at)}</td>
                    <td className="col-actions">
                      <button type="button" className="btn btn-sm btn-outline-dark rounded-0" onClick={() => openDetail(row)}>
                        Detail
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AdminDetailModal
        show={Boolean(detail)}
        title={detail ? `Detail pesanan #${detail.id}` : ''}
        onClose={() => setDetail(null)}
      >
        {detail && (
          <>
            <div className="row g-3 mb-4">
              <div className="col-sm-5">
                <p className="small text-secondary mb-1">Produk</p>
                <img
                  src={mediaUrl(detail.gambar_produk)}
                  alt={detail.nama_produk}
                  className="admin-detail-img w-100"
                />
              </div>
              {detail.foto_bukti && (
                <div className="col-sm-7">
                  <p className="small text-secondary mb-1">Bukti bayar</p>
                  <img src={mediaUrl(detail.foto_bukti)} alt="Bukti bayar" className="admin-detail-img w-100" />
                </div>
              )}
            </div>
            {detail.metode_pembayaran === 'Bank Transfer' && (
              <BankTransferInfo info={infoToko} total={detail.harga_produk} orderId={detail.id} />
            )}
            <DetailDl
              items={[
                ['ID pesanan', detail.id],
                ['Produk', detail.nama_produk],
                ['Harga', formatRupiah(detail.harga_produk)],
                ['Nama penerima', detail.nama_pembeli],
                ['Alamat kirim', detail.alamat_pembeli],
                ['Telepon', detail.phone_pembeli],
                ['Metode bayar', detail.metode_pembayaran],
                ['Status bayar', detail.pembayaran],
                ['Kurir', detail.pengiriman],
                ['Status pesanan', detail.status],
                ['Catatan', detail.catatan || '—'],
                ['Tanggal', formatTanggal(detail.created_at)],
              ]}
            />
          </>
        )}
      </AdminDetailModal>
    </div>
  );
}

/**
 * [buatan] Riwayat pesanan pembeli + unduh/cetak struk + upload bukti.
 * URL: `/akun/pesanan`
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
import ImageUploadField from '../../components/admin/ImageUploadField';
import { formatRupiah, formatTanggal } from '../../utils/format';
import { mediaUrl } from '../../utils/media';
import BankTransferInfo from '../../components/pembeli/BankTransferInfo';
import { STATUS_ARTI } from '../../utils/statusPesanan';
import { unduhStruk, bukaStrukCetak } from '../../utils/struk';

export default function PembeliPesananPage() {
  const { handleError } = usePembeliGuard();
  const { rows, loading, error, reload } = usePembeliList(pembeliApi.getPembelian);
  const [detail, setDetail] = useState(null);
  const [detailError, setDetailError] = useState('');
  const [infoToko, setInfoToko] = useState(null);
  const [buktiPath, setBuktiPath] = useState('');
  const [savingBukti, setSavingBukti] = useState(false);

  useEffect(() => {
    pembeliApi.getInfoToko().then((r) => setInfoToko(r.data)).catch(() => {});
  }, []);

  const openDetail = async (row) => {
    setDetailError('');
    setBuktiPath('');
    try {
      const r = await pembeliApi.getPembelianById(row.id);
      setDetail(r.data);
      setBuktiPath(r.data.foto_bukti || '');
    } catch (err) {
      if (!handleError(err)) setDetailError(err.message);
    }
  };

  const strukDariRow = async (row) => {
    try {
      const r = await pembeliApi.getPembelianById(row.id);
      return r.data;
    } catch (err) {
      if (!handleError(err)) setDetailError(err.message);
      return null;
    }
  };

  const bisaUploadBukti =
    detail &&
    detail.metode_pembayaran === 'Bank Transfer' &&
    ['Tertunda', 'Dikemas'].includes(detail.status);

  const onSimpanBukti = async () => {
    if (!detail || !buktiPath) {
      setDetailError('Unggah gambar bukti dulu.');
      return;
    }
    setSavingBukti(true);
    setDetailError('');
    try {
      const r = await pembeliApi.updateBukti(detail.id, buktiPath);
      setDetail(r.data);
      reload();
    } catch (err) {
      if (!handleError(err)) setDetailError(err.message);
    } finally {
      setSavingBukti(false);
    }
  };

  if (loading) return <LoadingBlock />;

  return (
    <div>
      <PageHeader
        title="Pesanan Saya"
        subtitle={`${rows.length} pesanan`}
        action={
          <button type="button" className="btn btn-sm btn-outline-secondary rounded-0" onClick={() => reload()}>
            Muat ulang
          </button>
        }
      />
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
                <th>Bukti</th>
                <th>Kurir</th>
                <th>Tanggal</th>
                <th className="col-actions">Tindakan</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-secondary">
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
                      <span className="admin-badge" title={STATUS_ARTI[row.status] || ''}>
                        {row.status}
                      </span>
                    </td>
                    <td>{row.pembayaran}</td>
                    <td>{row.foto_bukti ? 'Ada' : '—'}</td>
                    <td>{row.pengiriman}</td>
                    <td className="text-nowrap">{formatTanggal(row.created_at)}</td>
                    <td className="col-actions">
                      <div className="d-flex flex-wrap gap-1">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-dark rounded-0"
                          onClick={() => openDetail(row)}
                        >
                          Detail
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-dark rounded-0"
                          onClick={async () => {
                            const p = await strukDariRow(row);
                            if (p) unduhStruk(p, infoToko);
                          }}
                        >
                          Struk
                        </button>
                      </div>
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
              {(detail.foto_bukti || buktiPath) && (
                <div className="col-sm-7">
                  <p className="small text-secondary mb-1">Bukti bayar</p>
                  <img
                    src={mediaUrl(buktiPath || detail.foto_bukti)}
                    alt="Bukti bayar"
                    className="admin-detail-img w-100"
                  />
                </div>
              )}
            </div>
            {detail.metode_pembayaran === 'Bank Transfer' && detail.pembayaran === 'Belum' && (
              <BankTransferInfo info={infoToko} total={detail.harga_produk} orderId={detail.id} />
            )}
            {bisaUploadBukti && (
              <div className="mb-4 p-3 border">
                <p className="small mb-2">
                  <strong>Unggah / ganti bukti transfer</strong> (status Tertunda atau Dikemas)
                </p>
                <ImageUploadField
                  label="Foto bukti"
                  value={buktiPath}
                  onChange={setBuktiPath}
                  uploadFn={pembeliApi.uploadGambar}
                />
                <button
                  type="button"
                  className="btn btn-dark btn-sm rounded-0 mt-2"
                  disabled={savingBukti || !buktiPath}
                  onClick={onSimpanBukti}
                >
                  {savingBukti ? 'Menyimpan…' : 'Simpan bukti'}
                </button>
              </div>
            )}
            {STATUS_ARTI[detail.status] && (
              <p className="small text-secondary mb-3">
                <strong>Arti status:</strong> {STATUS_ARTI[detail.status]}
              </p>
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
                ['Bukti', detail.foto_bukti ? 'Sudah diunggah' : 'Belum'],
                ['Catatan', detail.catatan || '—'],
                ['Tanggal', formatTanggal(detail.created_at)],
              ]}
            />
            <div className="d-flex flex-wrap gap-2 mt-3">
              <button
                type="button"
                className="btn btn-dark rounded-0"
                onClick={() => unduhStruk(detail, infoToko)}
              >
                Unduh struk
              </button>
              <button
                type="button"
                className="btn btn-outline-dark rounded-0"
                onClick={() => bukaStrukCetak(detail, infoToko)}
              >
                Cetak / PDF
              </button>
            </div>
          </>
        )}
      </AdminDetailModal>
    </div>
  );
}

/**
 * [buatan] Laporan transaksi lengkap panel admin.
 * URL: `/admin/laporan` — filter, ringkasan, breakdown, tabel, ekspor CSV.
 */
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api/adminApi';
import { useAdminList } from '../../hooks/useAdminList';
import { useAdminGuard } from '../../hooks/useAdminGuard';
import { METODE_BAYAR, STATUS_BAYAR, STATUS_PROSES } from '../../constants/adminEnums';
import PageHeader from '../../components/admin/PageHeader';
import LoadingBlock from '../../components/admin/LoadingBlock';
import StatCard from '../../components/admin/StatCard';
import AdminDetailModal from '../../components/admin/AdminDetailModal';
import DetailDl from '../../components/admin/DetailDl';
import { formatRupiah, formatTanggal, toDateInputValue } from '../../utils/format';
import { mediaUrl } from '../../utils/media';

const FILTER_KOSONG = {
  q: '',
  dari: '',
  sampai: '',
  status: '',
  pembayaran: '',
  metode: '',
  pengiriman: '',
};

function tanggalLokal(iso) {
  if (!iso) return '';
  return toDateInputValue(iso);
}

function hitungBreakdown(rows, keyFn) {
  const map = new Map();
  for (const row of rows) {
    const key = keyFn(row) || '—';
    const prev = map.get(key) || { label: key, jumlah: 0, total: 0, dibayar: 0 };
    prev.jumlah += 1;
    prev.total += Number(row.harga) || 0;
    if (row.pembayaran === 'Dibayar') prev.dibayar += Number(row.harga) || 0;
    map.set(key, prev);
  }
  return [...map.values()].sort((a, b) => b.jumlah - a.jumlah);
}

function unduhCsv(rows) {
  const header = [
    'ID',
    'Tanggal',
    'Nama pembeli',
    'Email',
    'Username',
    'Telepon',
    'Alamat',
    'Produk',
    'Harga',
    'Metode bayar',
    'Status bayar',
    'Kurir',
    'Status pesanan',
    'Catatan',
  ];
  const lines = rows.map((r) =>
    [
      r.id,
      tanggalLokal(r.created_at),
      r.nama_pembeli,
      r.email_pembeli,
      r.uname_pembeli,
      r.phone_pembeli,
      r.alamat_pembeli,
      r.nama_produk,
      r.harga,
      r.metode_pembayaran,
      r.pembayaran,
      r.pengiriman,
      r.status,
      r.catatan,
    ]
      .map((cell) => {
        const s = cell == null ? '' : String(cell);
        return `"${s.replace(/"/g, '""')}"`;
      })
      .join(',')
  );
  const csv = '\uFEFF' + [header.join(','), ...lines].join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `laporan-transaksi-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdminLaporanPage() {
  const { handleError } = useAdminGuard();
  const { rows, loading, error } = useAdminList(adminApi.getPembelian);
  const [shippingOpts, setShippingOpts] = useState([]);
  const [filter, setFilter] = useState(FILTER_KOSONG);
  const [detail, setDetail] = useState(null);
  const [detailError, setDetailError] = useState('');

  useEffect(() => {
    adminApi
      .getPengiriman()
      .then((r) => setShippingOpts(Array.isArray(r.data) ? r.data : []))
      .catch((err) => handleError(err));
  }, [handleError]);

  const filtered = useMemo(() => {
    const q = filter.q.trim().toLowerCase();
    return rows.filter((row) => {
      const tgl = tanggalLokal(row.created_at);
      if (filter.dari && tgl && tgl < filter.dari) return false;
      if (filter.sampai && tgl && tgl > filter.sampai) return false;
      if (filter.status && row.status !== filter.status) return false;
      if (filter.pembayaran && row.pembayaran !== filter.pembayaran) return false;
      if (filter.metode && row.metode_pembayaran !== filter.metode) return false;
      if (filter.pengiriman && row.pengiriman !== filter.pengiriman) return false;
      if (q) {
        const hay = [
          row.id,
          row.nama_pembeli,
          row.email_pembeli,
          row.uname_pembeli,
          row.phone_pembeli,
          row.nama_produk,
          row.alamat_pembeli,
          row.catatan,
        ]
          .join(' ')
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [rows, filter]);

  const ringkasan = useMemo(() => {
    let totalNilai = 0;
    let pendapatan = 0;
    let nilaiBelum = 0;
    let belumBayar = 0;
    let aktif = 0;
    for (const row of filtered) {
      const harga = Number(row.harga) || 0;
      totalNilai += harga;
      if (row.pembayaran === 'Dibayar') pendapatan += harga;
      if (row.pembayaran === 'Belum') {
        belumBayar += 1;
        nilaiBelum += harga;
      }
      if (row.status !== 'Selesai' && row.status !== 'Diterima') aktif += 1;
    }
    return {
      jumlah: filtered.length,
      totalNilai,
      pendapatan,
      belumBayar,
      nilaiBelum,
      aktif,
    };
  }, [filtered]);

  const byStatus = useMemo(() => hitungBreakdown(filtered, (r) => r.status), [filtered]);
  const byMetode = useMemo(() => hitungBreakdown(filtered, (r) => r.metode_pembayaran), [filtered]);
  const byKurir = useMemo(() => hitungBreakdown(filtered, (r) => r.pengiriman), [filtered]);
  const byProduk = useMemo(() => hitungBreakdown(filtered, (r) => r.nama_produk).slice(0, 8), [filtered]);

  const setF = (key) => (e) => setFilter((f) => ({ ...f, [key]: e.target.value }));

  const openDetail = async (row) => {
    setDetailError('');
    try {
      const r = await adminApi.getPembelianById(row.id);
      setDetail(r.data);
    } catch (err) {
      if (!handleError(err)) setDetailError(err.message);
    }
  };

  if (loading) return <LoadingBlock text="Memuat laporan transaksi…" />;

  return (
    <div className="admin-laporan-page">
      <PageHeader
        title="Laporan transaksi"
        subtitle={`${ringkasan.jumlah} dari ${rows.length} pesanan (sesuai filter)`}
        action={
          <div className="d-flex flex-wrap gap-2">
            <button
              type="button"
              className="btn btn-outline-dark rounded-0"
              disabled={filtered.length === 0}
              onClick={() => unduhCsv(filtered)}
            >
              Unduh CSV
            </button>
            <button type="button" className="btn btn-outline-secondary rounded-0" onClick={() => window.print()}>
              Cetak
            </button>
            <Link to="/admin/pembelian" className="btn btn-dark rounded-0">
              Kelola pesanan
            </Link>
          </div>
        }
      />

      {error && <div className="alert alert-danger">{error}</div>}
      {detailError && <div className="alert alert-danger">{detailError}</div>}

      {/* Filter */}
      <div className="admin-panel mb-4 admin-laporan-filters">
        <h2 className="admin-section-title mb-3">Filter</h2>
        <div className="row g-3">
          <div className="col-md-4">
            <label className="form-label">Cari</label>
            <input
              className="form-control"
              placeholder="ID, nama, email, produk…"
              value={filter.q}
              onChange={setF('q')}
            />
          </div>
          <div className="col-md-2">
            <label className="form-label">Dari tanggal</label>
            <input type="date" className="form-control" value={filter.dari} onChange={setF('dari')} />
          </div>
          <div className="col-md-2">
            <label className="form-label">Sampai</label>
            <input type="date" className="form-control" value={filter.sampai} onChange={setF('sampai')} />
          </div>
          <div className="col-md-2">
            <label className="form-label">Status pesanan</label>
            <select className="form-select" value={filter.status} onChange={setF('status')}>
              <option value="">Semua</option>
              {STATUS_PROSES.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-2">
            <label className="form-label">Status bayar</label>
            <select className="form-select" value={filter.pembayaran} onChange={setF('pembayaran')}>
              <option value="">Semua</option>
              {STATUS_BAYAR.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-3">
            <label className="form-label">Metode bayar</label>
            <select className="form-select" value={filter.metode} onChange={setF('metode')}>
              <option value="">Semua</option>
              {METODE_BAYAR.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-3">
            <label className="form-label">Kurir</label>
            <select className="form-select" value={filter.pengiriman} onChange={setF('pengiriman')}>
              <option value="">Semua</option>
              {shippingOpts.map((v) => (
                <option key={v.id} value={v.nama}>
                  {v.nama}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-3 d-flex align-items-end">
            <button
              type="button"
              className="btn btn-outline-secondary rounded-0 w-100"
              onClick={() => setFilter(FILTER_KOSONG)}
            >
              Reset filter
            </button>
          </div>
        </div>
      </div>

      {/* Ringkasan */}
      <div className="admin-stats-grid mb-4">
        <StatCard label="Jumlah transaksi" value={ringkasan.jumlah} tone="dark" />
        <StatCard label="Total nilai pesanan" value={formatRupiah(ringkasan.totalNilai)} tone="default" />
        <StatCard
          label="Pendapatan (dibayar)"
          value={formatRupiah(ringkasan.pendapatan)}
          hint="Hanya status bayar Dibayar"
          tone="gold"
        />
        <StatCard
          label="Belum dibayar"
          value={ringkasan.belumBayar}
          hint={formatRupiah(ringkasan.nilaiBelum)}
          tone="warn"
        />
        <StatCard label="Pesanan aktif" value={ringkasan.aktif} hint="Belum Selesai/Diterima" tone="warn" />
      </div>

      {/* Breakdown */}
      <div className="row g-4 mb-4">
        <BreakdownPanel title="Per status pesanan" rows={byStatus} />
        <BreakdownPanel title="Per metode bayar" rows={byMetode} />
        <BreakdownPanel title="Per kurir" rows={byKurir} />
        <BreakdownPanel title="Produk terlaris (filter)" rows={byProduk} />
      </div>

      {/* Tabel lengkap */}
      <div className="admin-panel">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
          <h2 className="admin-section-title mb-0">Rincian transaksi</h2>
          <span className="text-secondary small">{filtered.length} baris</span>
        </div>
        <div className="table-responsive">
          <table className="table admin-table mb-0">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tanggal</th>
                <th>Pembeli</th>
                <th>Kontak</th>
                <th>Produk</th>
                <th>Harga</th>
                <th>Metode</th>
                <th>Bayar</th>
                <th>Kurir</th>
                <th>Status</th>
                <th className="col-actions">Detail</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={11} className="text-secondary">
                    Tidak ada transaksi sesuai filter.
                  </td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <tr key={row.id}>
                    <td>#{row.id}</td>
                    <td className="text-nowrap">{formatTanggal(row.created_at)}</td>
                    <td>
                      <div>{row.nama_pembeli}</div>
                      <small className="text-secondary">{row.email_pembeli || row.uname_pembeli}</small>
                    </td>
                    <td>
                      <div>{row.phone_pembeli ? `+${row.phone_pembeli}` : '—'}</div>
                      <small className="text-secondary d-inline-block text-truncate" style={{ maxWidth: 140 }}>
                        {row.alamat_pembeli || '—'}
                      </small>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <img
                          src={mediaUrl(row.gambar_produk)}
                          alt=""
                          width={40}
                          height={40}
                          className="admin-thumb"
                        />
                        <span>{row.nama_produk}</span>
                      </div>
                    </td>
                    <td className="text-nowrap">{formatRupiah(row.harga)}</td>
                    <td>{row.metode_pembayaran}</td>
                    <td>{row.pembayaran}</td>
                    <td>{row.pengiriman}</td>
                    <td>
                      <span className="admin-badge">{row.status}</span>
                    </td>
                    <td className="col-actions">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-dark rounded-0"
                        onClick={() => openDetail(row)}
                      >
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
        title={detail ? `Detail transaksi #${detail.id}` : ''}
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
                  <img src={mediaUrl(detail.foto_bukti)} alt="Bukti" className="admin-detail-img w-100" />
                </div>
              )}
            </div>
            <DetailDl
              items={[
                ['ID pesanan', detail.id],
                ['Tanggal', formatTanggal(detail.created_at)],
                ['Pembeli', detail.nama_pembeli],
                ['Email', detail.email_pembeli || '—'],
                ['Telepon', detail.phone_pembeli ? `+${detail.phone_pembeli}` : '—'],
                ['Alamat', detail.alamat_pembeli || '—'],
                ['Produk', detail.nama_produk],
                ['Harga', formatRupiah(detail.harga)],
                ['Metode bayar', detail.metode_pembayaran],
                ['Status bayar', detail.pembayaran],
                ['Kurir', detail.pengiriman],
                ['Status pesanan', detail.status],
                ['Catatan', detail.catatan || '—'],
              ]}
            />
            <Link to="/admin/pembelian" className="btn btn-sm btn-outline-dark rounded-0 mt-3">
              Ubah di Kelola pesanan
            </Link>
          </>
        )}
      </AdminDetailModal>
    </div>
  );
}

function BreakdownPanel({ title, rows }) {
  return (
    <div className="col-md-6">
      <div className="admin-panel h-100">
        <h2 className="admin-section-title mb-3">{title}</h2>
        {rows.length === 0 ? (
          <p className="text-secondary mb-0">Tidak ada data.</p>
        ) : (
          <div className="table-responsive">
            <table className="table admin-table mb-0">
              <thead>
                <tr>
                  <th>Kelompok</th>
                  <th>Jumlah</th>
                  <th>Total nilai</th>
                  <th>Dibayar</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.label}>
                    <td>{r.label}</td>
                    <td>{r.jumlah}</td>
                    <td>{formatRupiah(r.total)}</td>
                    <td>{formatRupiah(r.dibayar)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

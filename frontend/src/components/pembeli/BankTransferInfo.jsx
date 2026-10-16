/**
 * [buatan] Panel rekening transfer — data dari tabel `bank` (info.banks).
 * Menampilkan bank, no rek, a.n., dan tombol salin nomor.
 */
import { useState } from 'react';
import { formatRupiah } from '../../utils/format';

/** Props: info (wajib punya banks[]), total bayar, orderId opsional. */
export default function BankTransferInfo({ info, total, orderId }) {
  const [copied, setCopied] = useState('');

  const accounts = Array.isArray(info?.banks)
    ? info.banks
        .filter((b) => b.nama_bank && b.no_rek != null && String(b.no_rek).trim() !== '')
        .map((b) => ({
          id: b.id,
          bank: b.nama_bank,
          rek: String(b.no_rek),
          an: b.atas_nama ? String(b.atas_nama).trim() : '',
        }))
    : [];

  const salin = async (rek) => {
    try {
      await navigator.clipboard.writeText(rek);
      setCopied(rek);
      window.setTimeout(() => setCopied(''), 2000);
    } catch {
      // Fallback sederhana untuk browser lama / non-HTTPS lokal
      const ta = document.createElement('textarea');
      ta.value = rek;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(rek);
      window.setTimeout(() => setCopied(''), 2000);
    }
  };

  if (accounts.length === 0) {
    return (
      <div className="bank-transfer-panel mb-4">
        <h3 className="h6 mb-2">Rekening tujuan transfer</h3>
        <p className="text-secondary small mb-0">
          Belum ada rekening bank. Admin perlu menambah di menu <strong>Bank</strong>.
        </p>
      </div>
    );
  }

  return (
    <div className="bank-transfer-panel mb-4">
      <h3 className="h6 mb-2">Rekening tujuan transfer</h3>
      {total != null && (
        <p className="mb-2">
          <strong>Jumlah transfer:</strong> {formatRupiah(total)}
          {orderId != null && (
            <span className="text-secondary">
              {' '}
              — cantumkan <strong>#{orderId}</strong> di berita transfer
            </span>
          )}
        </p>
      )}
      <ul className="bank-transfer-list mb-0">
        {accounts.map((a) => (
          <li key={a.id || `${a.bank}-${a.rek}`}>
            <div className="bank-transfer-meta">
              <strong>{a.bank}</strong>
              <span className="bank-transfer-rek">{a.rek}</span>
              {a.an && <span className="bank-transfer-an">a.n. {a.an}</span>}
            </div>
            <button
              type="button"
              className="btn btn-sm btn-outline-dark rounded-0"
              onClick={() => salin(a.rek)}
            >
              {copied === a.rek ? 'Tersalin' : 'Salin'}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

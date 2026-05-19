/**
 * [buatan] Panel rekening transfer bank untuk checkout pembeli.
 *
 * Menampilkan bank A/B dari info toko, total bayar, dan nomor pesanan.
 * Dipakai PembeliBelanjaPage setelah memilih metode Bank Transfer.
 */
import { formatRupiah } from '../../utils/format';

/** Props: info toko (bank/rek), total bayar, orderId untuk berita transfer. */
export default function BankTransferInfo({ info, total, orderId }) {
  if (!info) return null;

  const accounts = [
    info.nama_bank_a && info.no_rek_a != null && info.no_rek_a !== ''
      ? { bank: info.nama_bank_a, rek: String(info.no_rek_a) }
      : null,
    info.nama_bank_b && info.no_rek_b != null && info.no_rek_b !== ''
      ? { bank: info.nama_bank_b, rek: String(info.no_rek_b) }
      : null,
  ].filter(Boolean);

  if (accounts.length === 0) return null;

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
          <li key={`${a.bank}-${a.rek}`}>
            <strong>{a.bank}</strong>
            <span className="bank-transfer-rek">{a.rek}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

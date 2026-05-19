/**
 * [buatan] Bar info kepercayaan (alamat, telepon, email, jam, bank).
 *
 * Data dari info toko; ditampilkan di bawah hero beranda.
 */
import { jamOperasional } from '../../utils/format';

/** Props: info toko — bar alamat, telepon, email, jam buka di bawah hero. */
export default function TrustBar({ info, loading }) {
  if (loading || !info) {
    return (
      <section className="trust-bar">
        <div className="container-xl py-3 text-center text-secondary small">Memuat info toko…</div>
      </section>
    );
  }

  const jam = jamOperasional(info.jam_buka, info.jam_tutup);
  const bank = [info.nama_bank_a, info.nama_bank_b].filter(Boolean).join(' · ');

  const items = [
    { title: 'Alamat', text: info.alamat_toko },
    { title: 'Telepon', text: info.tlp_toko ? `+${info.tlp_toko}` : '—' },
    { title: 'Email', text: info.email_toko || '—' },
    { title: 'Jam buka', text: jam || '—' },
  ];

  return (
    <section className="trust-bar">
      <div className="container-xl">
        <div className="row g-0">
          {items.map((item) => (
            <div key={item.title} className="col-6 col-md-3">
              <div className="trust-item">
                <strong>{item.title}</strong>
                <p className="mb-0 small text-secondary">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
        {bank && (
          <p className="text-center small text-secondary mb-0 py-2 border-top">
            Pembayaran transfer: {bank}
            {info.no_rek_a ? ` · Rek. ${info.no_rek_a}` : ''}
            {info.no_rek_b ? ` · ${info.no_rek_b}` : ''}
          </p>
        )}
      </div>
    </section>
  );
}

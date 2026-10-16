/**
 * utils/struk.js — buat & unduh / cetak struk pesanan (HTML).
 *
 * Dipakai PembeliPesananPage & setelah checkout berhasil.
 */
import { formatRupiah, formatTanggal } from './format';

function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Bangun HTML struk dari data pesanan + info toko opsional.
 * Field harga: harga_produk (pembeli) atau harga (admin).
 */
export function bangunHtmlStruk(pesanan, infoToko = null) {
  const harga = pesanan.harga_produk ?? pesanan.harga ?? 0;
  const namaToko = infoToko?.nama_toko || 'Toko';
  const alamatToko = infoToko?.alamat_toko || '';
  const tlp = infoToko?.tlp_toko != null ? `+${infoToko.tlp_toko}` : '';

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8" />
  <title>Struk #${esc(pesanan.id)} — ${esc(namaToko)}</title>
  <style>
    body { font-family: Georgia, 'Times New Roman', serif; color: #1a1a1a; max-width: 420px; margin: 24px auto; padding: 0 16px; }
    h1 { font-size: 1.35rem; margin: 0 0 4px; letter-spacing: 0.02em; }
    .muted { color: #555; font-size: 0.85rem; }
    .rule { border: none; border-top: 1px dashed #999; margin: 14px 0; }
    table { width: 100%; border-collapse: collapse; font-size: 0.95rem; }
    td { padding: 4px 0; vertical-align: top; }
    td:last-child { text-align: right; }
    .total { font-size: 1.1rem; font-weight: 700; }
    .foot { margin-top: 20px; font-size: 0.8rem; color: #666; text-align: center; }
    @media print { body { margin: 0; } .no-print { display: none; } }
  </style>
</head>
<body>
  <h1>${esc(namaToko)}</h1>
  ${alamatToko ? `<p class="muted">${esc(alamatToko)}</p>` : ''}
  ${tlp ? `<p class="muted">${esc(tlp)}</p>` : ''}
  <hr class="rule" />
  <p><strong>STRUK PESANAN</strong><br />
  No. <strong>#${esc(pesanan.id)}</strong><br />
  <span class="muted">${esc(formatTanggal(pesanan.created_at))}</span></p>
  <hr class="rule" />
  <table>
    <tr><td>Penerima</td><td>${esc(pesanan.nama_pembeli)}</td></tr>
    <tr><td>Telepon</td><td>${esc(pesanan.phone_pembeli ? `+${pesanan.phone_pembeli}` : '—')}</td></tr>
    <tr><td>Alamat</td><td>${esc(pesanan.alamat_pembeli || '—')}</td></tr>
  </table>
  <hr class="rule" />
  <table>
    <tr><td colspan="2"><strong>${esc(pesanan.nama_produk)}</strong></td></tr>
    <tr><td>Harga</td><td class="total">${esc(formatRupiah(harga))}</td></tr>
    <tr><td>Metode bayar</td><td>${esc(pesanan.metode_pembayaran)}</td></tr>
    <tr><td>Status bayar</td><td>${esc(pesanan.pembayaran)}</td></tr>
    <tr><td>Kurir</td><td>${esc(pesanan.pengiriman)}</td></tr>
    <tr><td>Status pesanan</td><td>${esc(pesanan.status)}</td></tr>
    ${pesanan.catatan ? `<tr><td>Catatan</td><td>${esc(pesanan.catatan)}</td></tr>` : ''}
  </table>
  <hr class="rule" />
  <p class="total">Total: ${esc(formatRupiah(harga))}</p>
  <p class="foot">Simpan struk ini sebagai bukti transaksi.<br />Terima kasih telah berbelanja.</p>
  <p class="no-print muted" style="text-align:center;margin-top:24px">
    <button onclick="window.print()" style="padding:8px 16px;cursor:pointer">Cetak / Simpan PDF</button>
  </p>
</body>
</html>`;
}

/** Unduh file HTML struk ke perangkat pengguna */
export function unduhStruk(pesanan, infoToko = null) {
  const html = bangunHtmlStruk(pesanan, infoToko);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `struk-pesanan-${pesanan.id}.html`;
  a.click();
  URL.revokeObjectURL(url);
}

/** Buka struk di tab baru (bisa cetak / Save as PDF dari browser) */
export function bukaStrukCetak(pesanan, infoToko = null) {
  const html = bangunHtmlStruk(pesanan, infoToko);
  const w = window.open('', '_blank');
  if (!w) {
    unduhStruk(pesanan, infoToko);
    return;
  }
  w.document.open();
  w.document.write(html);
  w.document.close();
}

/**
 * utils/statusPesanan.js — arti status pesanan + konsekuensi untuk admin/UI.
 *
 * Backend menerapkan aturan yang sama di updatePembelian (sumber kebenaran).
 */

export const STATUS_PROSES = ['Tertunda', 'Dikemas', 'Dikirim', 'Diterima', 'Selesai'];

/** Penjelasan singkat tiap status untuk form admin & tampilan pembeli */
export const STATUS_ARTI = {
  Tertunda: 'Pesanan baru / menunggu konfirmasi. Pembayaran boleh masih Belum.',
  Dikemas: 'Pesanan sedang dikemas. Transfer bank: pembayaran harus Dibayar.',
  Dikirim: 'Barang dalam perjalanan. Transfer bank: pembayaran harus Dibayar.',
  Diterima: 'Pembeli sudah menerima barang. Pembayaran otomatis Dibayar (termasuk COD).',
  Selesai: 'Transaksi selesai. Pembayaran otomatis Dibayar; masuk laporan pendapatan.',
};

/**
 * Terapkan konsekuensi status di sisi UI (sebelum kirim ke API).
 * @returns {{ pembayaran: string, catatanOtomatis?: string }}
 */
export function konsekuensiStatus({ status, pembayaran, metode_pembayaran }) {
  let nextBayar = pembayaran;
  let catatanOtomatis = '';

  if (status === 'Diterima' || status === 'Selesai') {
    if (nextBayar !== 'Dibayar') {
      nextBayar = 'Dibayar';
      catatanOtomatis = `Status ${status}: pembayaran diset Dibayar.`;
    }
  } else if (
    (status === 'Dikemas' || status === 'Dikirim') &&
    metode_pembayaran === 'Bank Transfer' &&
    nextBayar !== 'Dibayar'
  ) {
    nextBayar = 'Dibayar';
    catatanOtomatis = `Status ${status} + Bank Transfer: pembayaran diset Dibayar.`;
  }

  return { pembayaran: nextBayar, catatanOtomatis };
}

/** Apakah struk boleh diunduh (setelah pesanan ada di DB) */
export function bisaUnduhStruk(pesanan) {
  return Boolean(pesanan && pesanan.id);
}

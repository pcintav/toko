/**
 * constants/publicNav.js — daftar tautan navigasi situs publik.
 *
 * Dipakai Header.jsx dan SiteBottomBar.jsx (Beranda, Toko, Artikel, Kontak).
 */

/** Menu navigasi publik — `end: true` untuk exact match path beranda */
export const PUBLIC_NAV = [
  { to: '/', label: 'Beranda', end: true },
  { to: '/toko', label: 'Toko' },
  { to: '/artikel', label: 'Artikel' },
  { to: '/#kontak', label: 'Kontak', hash: true },
];

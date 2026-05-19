/**
 * hooks/useBerandaData.js — hook data halaman beranda (HomePage).
 *
 * Memuat produk, artikel, dan info toko paralel via api/client; menghitung
 * kategori, produk terbaru, dan artikel tampilan.
 */
import { useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';
import { kategoriDariProduk } from '../utils/kategori';

export function useBerandaData() {
  const [produk, setProduk] = useState([]);
  const [artikel, setArtikel] = useState([]);
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch awal paralel: produk + artikel + info toko (satu putaran network)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [pRes, aRes, iRes] = await Promise.all([
          api.getProduk(),
          api.getArtikel(),
          api.getInfoToko(),
        ]);
        if (cancelled) return;
        setProduk(pRes.data || []);
        setArtikel(aRes.data || []);
        setInfo(iRes.data || null);
      } catch (e) {
        if (!cancelled) {
          setError('Data toko tidak dapat dimuat. Periksa koneksi lalu muat ulang halaman.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    // Cleanup: batalkan setState jika komponen unmount sebelum selesai
    return () => {
      cancelled = true;
    };
  }, []);

  // Daftar nama kategori unik dari produk — untuk filter & PromoKategori
  const kategoriList = useMemo(() => kategoriDariProduk(produk), [produk]);

  // Empat produk terbaru berdasarkan created_at — section "Produk Terbaru"
  const produkTerbaru = useMemo(() => {
    return [...produk]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 4);
  }, [produk]);

  // Tiga artikel pertama — teaser di beranda
  const artikelTampil = useMemo(() => artikel.slice(0, 3), [artikel]);

  return {
    produk,
    artikel,
    artikelTampil,
    info,
    loading,
    error,
    kategoriList,
    produkTerbaru,
  };
}

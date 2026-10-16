/**
 * hooks/useBerandaData.js — hook data halaman beranda (HomePage).
 *
 * Memuat produk, artikel, info toko (+ banks), dan master kategori paralel.
 */
import { useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';
import { daftarFilterKategori } from '../utils/kategori';

export function useBerandaData() {
  const [produk, setProduk] = useState([]);
  const [artikel, setArtikel] = useState([]);
  const [info, setInfo] = useState(null);
  const [kategoriMaster, setKategoriMaster] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // info-toko sudah menyertakan banks[] dari tabel bank
        const [pRes, aRes, iRes, kRes] = await Promise.all([
          api.getProduk(),
          api.getArtikel(),
          api.getInfoToko(),
          api.getKategori(),
        ]);
        if (cancelled) return;
        setProduk(pRes.data || []);
        setArtikel(aRes.data || []);
        setInfo(iRes.data || null);
        setKategoriMaster(Array.isArray(kRes.data) ? kRes.data : []);
      } catch {
        if (!cancelled) {
          setError('Data toko tidak dapat dimuat. Periksa koneksi lalu muat ulang halaman.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Tab/filter & tagline: dari tabel kategori_produk
  const kategoriList = useMemo(
    () => daftarFilterKategori(kategoriMaster, produk),
    [kategoriMaster, produk]
  );

  const produkTerbaru = useMemo(() => {
    return [...produk]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 4);
  }, [produk]);

  const artikelTampil = useMemo(() => artikel.slice(0, 3), [artikel]);

  return {
    produk,
    artikel,
    artikelTampil,
    info,
    loading,
    error,
    kategoriList,
    kategoriMaster,
    produkTerbaru,
  };
}

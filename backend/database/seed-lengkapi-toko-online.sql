-- =============================================================================
-- Pelengkap untuk dump toko_online.sql (phpMyAdmin)
-- Jalankan SETELAH impor toko_online.sql jika beranda/admin butuh data awal.
-- Aman dijalankan ulang: hanya insert jika tabel masih kosong.
-- =============================================================================

USE toko_online;

-- Info toko (dump saat ini: tabel ada, baris kosong → GET info-toko 404)
INSERT INTO info_toko (
  logo_toko, nama_toko, tentang, foto_banner, alamat_toko, email_toko, tlp_toko,
  nama_bank_a, nama_bank_b, no_rek_a, no_rek_b, jam_buka, jam_tutup,
  logo_wa, logo_ig, logo_fb, link_wa, link_ig, link_fb
)
SELECT
  'default-logo.jpg', 'Toko Mango',
  'Menyediakan berbagai produk mangga segar dan olahan berkualitas untuk kebutuhan harian Anda.',
  '',
  'Jl. Mangga No. 1, Jakarta', 'info@toko.local', 6280000000000,
  'BCA', 'Mandiri', 1234567890, 9876543210, 8, 20,
  'wa.png', 'ig.png', 'fb.png', 'https://wa.me/', 'https://instagram.com/', 'https://facebook.com/'
FROM (SELECT COUNT(*) AS n FROM info_toko) AS x
WHERE x.n = 0;

-- Contoh produk (opsional, untuk uji katalog & dashboard)
INSERT INTO produk (nama_produk, deskripsi, harga, gambar, kategori)
SELECT * FROM (
  SELECT 'Mango Sticky Rice Classic' AS nama_produk,
    'Nasi ketan lembut dengan potongan mangga segar dan santan.' AS deskripsi,
    35000 AS harga, NULL AS gambar, 'Mango Sticky Rice' AS kategori
  UNION ALL
  SELECT 'Mango Pudding Cup', 'Puding mangga creamy dingin.', 25000, NULL, 'Mango Pudding'
  UNION ALL
  SELECT 'Mango Milkshake Fresh', 'Susu mangga blended segar.', 28000, NULL, 'Mango Milkshake'
) AS sampel
WHERE (SELECT COUNT(*) FROM produk) = 0;

-- Contoh artikel (opsional)
INSERT INTO artikel (judul, ringkasan, isi, gambar)
SELECT
  'Tips memilih mangga manis',
  'Ciri mangga matang yang pas untuk dessert.',
  'Pilih mangga dengan aroma kuat dan kulit yang mulai berkerut halus di ujung. Simpan di suhu ruang 1–2 hari sebelum disajikan.',
  'default.jpg'
FROM (SELECT COUNT(*) AS n FROM artikel) AS x
WHERE x.n = 0;

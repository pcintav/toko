-- =============================================================================
-- Pelengkap untuk dump toko_online.sql (phpMyAdmin)
-- Jalankan SETELAH impor schema / migrasi master (kategori, pengiriman, bank).
-- Aman dijalankan ulang: hanya insert jika tabel masih kosong.
-- =============================================================================

USE toko_online;

-- Master kategori / pengiriman / bank (jika belum ada)
INSERT INTO kategori_produk (nama)
SELECT v.nama FROM (
  SELECT 'Mango Sticky Rice' AS nama UNION ALL
  SELECT 'Mango Pudding' UNION ALL
  SELECT 'Mango Milkshake'
) AS v
WHERE (SELECT COUNT(*) FROM kategori_produk) = 0;

INSERT INTO pengiriman (nama)
SELECT v.nama FROM (
  SELECT 'JNT Express' AS nama UNION ALL
  SELECT 'JNE'
) AS v
WHERE (SELECT COUNT(*) FROM pengiriman) = 0;

INSERT INTO bank (nama_bank, no_rek, atas_nama)
SELECT v.nama_bank, v.no_rek, v.atas_nama FROM (
  SELECT 'BCA' AS nama_bank, '1234567890' AS no_rek, 'Toko Mango' AS atas_nama UNION ALL
  SELECT 'Mandiri', '9876543210', 'Toko Mango'
) AS v
WHERE (SELECT COUNT(*) FROM bank) = 0;

-- Info toko (tanpa kolom bank — rekening di tabel bank)
INSERT INTO info_toko (
  logo_toko, nama_toko, tentang, foto_banner, alamat_toko, email_toko, tlp_toko,
  jam_buka, jam_tutup,
  logo_wa, logo_ig, logo_fb, link_wa, link_ig, link_fb
)
SELECT
  'default-logo.jpg', 'Toko Mango',
  'Menyediakan berbagai produk mangga segar dan olahan berkualitas untuk kebutuhan harian Anda.',
  '',
  'Jl. Mangga No. 1, Jakarta', 'info@toko.local', 6280000000000,
  8, 20,
  'wa.png', 'ig.png', 'fb.png', 'https://wa.me/', 'https://instagram.com/', 'https://facebook.com/'
FROM (SELECT COUNT(*) AS n FROM info_toko) AS x
WHERE x.n = 0;

-- Contoh produk (opsional, untuk uji katalog & dashboard)
INSERT INTO produk (nama_produk, deskripsi, harga, gambar, kategori, stok, aktif)
SELECT * FROM (
  SELECT 'Mango Sticky Rice Classic' AS nama_produk,
    'Nasi ketan lembut dengan potongan mangga segar dan santan.' AS deskripsi,
    35000 AS harga, NULL AS gambar, 'Mango Sticky Rice' AS kategori,
    25 AS stok, 1 AS aktif
  UNION ALL
  SELECT 'Mango Pudding Cup', 'Puding mangga creamy dingin.', 25000, NULL, 'Mango Pudding', 30, 1
  UNION ALL
  SELECT 'Mango Milkshake Fresh', 'Susu mangga blended segar.', 28000, NULL, 'Mango Milkshake', 20, 1
) AS sampel
WHERE (SELECT COUNT(*) FROM produk) = 0;

-- Contoh artikel (opsional)
INSERT INTO artikel (judul, ringkasan, isi, gambar)
SELECT
  'Tips menyimpan mangga agar tetap segar',
  'Cara sederhana menjaga kualitas mangga di rumah.',
  'Simpan mangga di suhu ruang hingga matang, lalu masukkan kulkas untuk memperlambat pembusukan.',
  'default.jpg'
FROM (SELECT COUNT(*) AS n FROM artikel) AS a
WHERE a.n = 0;

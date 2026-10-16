-- =============================================================================
-- Isi data demo (produk, artikel, info toko) — untuk presentasi / uji katalog
-- Aman dijalankan ulang: memakai REPLACE/UPDATE + insert jika nama belum ada
-- =============================================================================

USE toko_online;

-- Info toko (satu baris)
UPDATE info_toko SET
  nama_toko = 'TOKOKU',
  tentang = 'Toko online latihan SMK RPL. Menyediakan perawatan kulit sehari-hari dengan harga terjangkau dan kualitas terpercaya.',
  alamat_toko = 'Jl. Pendidikan No. 12, Jakarta Selatan',
  email_toko = 'tokoku@gmail.com',
  tlp_toko = 62888888888,
  jam_buka = 8,
  jam_tutup = 20,
  link_wa = 'https://wa.me/62888888888',
  link_ig = 'https://instagram.com/',
  link_fb = 'https://facebook.com/',
  updated_at = CURRENT_TIMESTAMP;

-- Atas nama rekening demo
UPDATE bank SET atas_nama = 'TOKOKU' WHERE atas_nama IS NULL OR atas_nama = '' OR atas_nama = 'Pemilik Toko';

-- Pastikan kategori demo ada
INSERT INTO kategori_produk (nama)
SELECT v.nama FROM (
  SELECT 'Serum' AS nama UNION ALL
  SELECT 'Pelembap' UNION ALL
  SELECT 'Pembersih'
) AS v
WHERE NOT EXISTS (SELECT 1 FROM kategori_produk k WHERE k.nama = v.nama);

-- Produk demo (lewati jika nama sudah ada)
INSERT INTO produk (nama_produk, deskripsi, harga, gambar, kategori, stok, aktif)
SELECT v.nama_produk, v.deskripsi, v.harga, v.gambar, v.kategori, v.stok, v.aktif
FROM (
  SELECT
    'Glowvera Radiance Serum Vitamin C 15%' AS nama_produk,
    'Serum wajah dengan Vitamin C 15% dan Niacinamide. Membantu mencerahkan kulit kusam dan menjaga kelembapan. Tekstur ringan, cepat meresap.' AS deskripsi,
    89000 AS harga,
    NULL AS gambar,
    'Serum' AS kategori,
    25 AS stok,
    1 AS aktif
  UNION ALL
  SELECT
    'Glowvera Hydra Gel Moisturizer',
    'Pelembap gel ringan dengan hyaluronic acid. Cocok untuk kulit berminyak dan kombinasi. Tidak lengket.',
    65000, NULL, 'Pelembap', 40, 1
  UNION ALL
  SELECT
    'Glowvera Gentle Foam Cleanser',
    'Pembersih wajah busa lembut dengan ph seimbang. Membersihkan kotoran tanpa membuat kulit kering.',
    45000, NULL, 'Pembersih', 50, 1
  UNION ALL
  SELECT
    'Glowvera Night Repair Serum',
    'Serum malam dengan retinol ringan dan pelembap. Membantu memperbaiki tekstur kulit saat tidur.',
    99000, NULL, 'Serum', 18, 1
  UNION ALL
  SELECT
    'Glowvera Daily Sunscreen SPF50',
    'Tabir surya harian SPF50 PA+++. Ringan, tidak puthih, cocok di bawah makeup.',
    75000, NULL, 'Pelembap', 35, 1
  UNION ALL
  SELECT
    'Glowvera Micellar Water',
    'Air micellar untuk membersihkan makeup ringan dan sisa kotoran. Tanpa bilas, praktis dibawa bepergian.',
    38000, NULL, 'Pembersih', 45, 1
) AS v
WHERE NOT EXISTS (
  SELECT 1 FROM produk p WHERE p.nama_produk = v.nama_produk
);

-- Samakan kategori produk lama yang masih pakai nama mangga
UPDATE produk SET kategori = 'Serum'
WHERE kategori IN ('Mango Sticky Rice', 'Mango Pudding', 'Mango Milkshake')
  AND nama_produk LIKE '%Serum%';

UPDATE produk SET kategori = 'Pelembap'
WHERE kategori IN ('Mango Sticky Rice', 'Mango Pudding', 'Mango Milkshake')
  AND (nama_produk LIKE '%Moist%' OR nama_produk LIKE '%Sunscreen%');

UPDATE produk SET kategori = 'Pembersih'
WHERE kategori IN ('Mango Sticky Rice', 'Mango Pudding', 'Mango Milkshake')
  AND (nama_produk LIKE '%Clean%' OR nama_produk LIKE '%Micellar%' OR nama_produk LIKE '%Foam%');

-- Artikel demo (lewati jika judul sudah ada)
INSERT INTO artikel (judul, ringkasan, isi, gambar)
SELECT v.judul, v.ringkasan, v.isi, v.gambar
FROM (
  SELECT
    'Cara memilih serum sesuai jenis kulit' AS judul,
    'Panduan singkat memilih serum agar hasil perawatan lebih maksimal.' AS ringkasan,
    'Kulit berminyak cocok dengan serum ringan berbasis water/gel. Kulit kering lebih nyaman dengan serum yang mengandung pelembap seperti hyaluronic acid. Mulai dari konsentrasi rendah, pakai rutin, dan selalu gunakan sunscreen di siang hari.' AS isi,
    'default.jpg' AS gambar
  UNION ALL
  SELECT
    'Urutan skincare pagi dan malam untuk pemula',
    'Langkah sederhana yang mudah diikuti setiap hari.',
    'Pagi: bersihkan wajah, serum, pelembap, lalu sunscreen. Malam: bersihkan wajah, serum perbaikan, pelembap. Jangan skip sunscreen — ini langkah paling penting untuk menjaga hasil perawatan.',
    'default.jpg'
  UNION ALL
  SELECT
    'Tips belanja aman di toko online latihan',
    'Cara checkout, transfer, dan cek status pesanan di TOKOKU.',
    'Pilih produk, login sebagai pembeli, isi alamat pengiriman, lalu pilih metode bayar. Untuk transfer bank, unggah bukti pembayaran. Pantau status pesanan di menu Pesanan Saya hingga selesai.',
    'default.jpg'
) AS v
WHERE NOT EXISTS (
  SELECT 1 FROM artikel a WHERE a.judul = v.judul
);

-- Pastikan stok produk aktif tidak 0 (demo)
UPDATE produk SET stok = 20 WHERE aktif = 1 AND stok = 0;

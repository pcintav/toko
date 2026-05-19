-- =============================================================================
-- Skema MySQL latihan toko (sinkron dengan models backend & contoh-database.sql)
-- Diagram ER (dbdiagram.io): database/schema-latihan-toko.dbml
-- Jalankan sekali di database yang sama dengan DB_NAME di .env
-- Tidak menambah dependency Node — file ini untuk phpMyAdmin / MySQL CLI.
--
-- Jika database dan tabel SUDAH ADA dari versi lama: jalankan dulu
--   database/alter-database-yang-sudah-ada.sql
-- (ALTER tambah kolom/indeks/FK seperti schema). Error duplicate = sudah sesuai.
-- Lalu gunakan file ini untuk tabel yang belum pernah dibuat (CREATE IF NOT EXISTS).
-- =============================================================================

SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama_d VARCHAR(50) NOT NULL,
  nama_b VARCHAR(50) NOT NULL,
  kelamin TEXT NOT NULL,
  lahir TEXT NOT NULL,
  alamat TEXT NOT NULL,
  phone BIGINT NOT NULL,
  email VARCHAR(30) NOT NULL,
  role ENUM('admin', 'pembeli') NOT NULL DEFAULT 'pembeli',
  uname VARCHAR(30) NOT NULL,
  passwd VARCHAR(256) NOT NULL,
  foto VARCHAR(500) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_users_email (email),
  UNIQUE KEY uq_users_uname (uname)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS produk (
  id_produk INT AUTO_INCREMENT PRIMARY KEY,
  nama_produk VARCHAR(255) NOT NULL,
  deskripsi TEXT NOT NULL,
  harga INT NOT NULL,
  gambar VARCHAR(500) NULL,
  kategori ENUM('Mango Sticky Rice', 'Mango Pudding', 'Mango Milkshake') NOT NULL DEFAULT 'Mango Sticky Rice',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS pembelian (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_pembeli INT NOT NULL,
  id_produk INT NOT NULL,
  nama_pembeli VARCHAR(50) NULL,
  alamat_pembeli TEXT NULL,
  phone_pembeli BIGINT NULL,
  metode_pembayaran ENUM('Bank Transfer', 'COD') NOT NULL DEFAULT 'COD',
  pembayaran ENUM('Belum', 'Dibayar') NOT NULL DEFAULT 'Belum',
  pengiriman ENUM('JNT Express', 'JNE') NOT NULL DEFAULT 'JNT Express',
  status ENUM('Tertunda', 'Dikemas', 'Dikirim', 'Diterima', 'Selesai') NOT NULL DEFAULT 'Tertunda',
  catatan TEXT NULL,
  foto_bukti VARCHAR(500) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_pembelian_user FOREIGN KEY (id_pembeli) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_pembelian_produk FOREIGN KEY (id_produk) REFERENCES produk(id_produk) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS artikel (
  id INT AUTO_INCREMENT PRIMARY KEY,
  judul VARCHAR(225) NOT NULL,
  ringkasan TEXT NOT NULL,
  isi TEXT NOT NULL,
  gambar VARCHAR(500) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS kontak (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama_lengkap VARCHAR(50) NOT NULL,
  email VARCHAR(30) NOT NULL,
  no_hp BIGINT NOT NULL,
  isi_pesan TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS info_toko (
  logo_toko VARCHAR(500) NOT NULL,
  nama_toko VARCHAR(50) NOT NULL,
  tentang TEXT NOT NULL,
  foto_banner VARCHAR(500) NOT NULL,
  alamat_toko TEXT NOT NULL,
  email_toko VARCHAR(30) NOT NULL,
  tlp_toko BIGINT NOT NULL,
  nama_bank_a VARCHAR(30) NOT NULL,
  nama_bank_b VARCHAR(30) NOT NULL,
  no_rek_a BIGINT NOT NULL,
  no_rek_b BIGINT NOT NULL,
  jam_buka INT NOT NULL,
  jam_tutup INT NOT NULL,
  logo_wa VARCHAR(500) NOT NULL,
  logo_ig VARCHAR(500) NOT NULL,
  logo_fb VARCHAR(500) NOT NULL,
  link_wa TEXT NOT NULL,
  link_ig TEXT NOT NULL,
  link_fb TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Baris awal hanya jika tabel masih kosong (latihan GET/PUT /api/admin/info-toko)
INSERT INTO info_toko (
  logo_toko, nama_toko, tentang, foto_banner, alamat_toko, email_toko, tlp_toko,
  nama_bank_a, nama_bank_b, no_rek_a, no_rek_b, jam_buka, jam_tutup,
  logo_wa, logo_ig, logo_fb, link_wa, link_ig, link_fb
)
SELECT
  'default-logo.jpg', 'Toko Mango',
  'Menyediakan berbagai produk mangga segar dan olahan berkualitas untuk kebutuhan harian Anda.',
  '',
  'Alamat belum diisi', 'info@toko.local', 6280000000000,
  'BCA', 'Mandiri', 1234567890, 9876543210, 8, 20,
  'wa.png', 'ig.png', 'fb.png', 'https://wa.me/', 'https://instagram.com/', 'https://facebook.com/'
FROM (SELECT COUNT(*) AS n FROM info_toko) AS x
WHERE x.n = 0;

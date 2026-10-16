-- =============================================================================
-- Skema MySQL latihan toko (sinkron dengan models backend)
-- Diagram ER (dbdiagram.io): database/schema-latihan-toko.dbml
-- Jalankan sekali di database yang sama dengan DB_NAME di .env
--
-- Jika database LAMA sudah ada:
--   migration-master-kategori-pengiriman-bank.sql  (master kategori/kurir/bank)
--   migration-pembelian-foto-bukti.sql             (bukti transfer)
--   migration-produk-stok-aktif.sql                (stok + aktif)
--   migration-bank-atas-nama.sql                   (a.n. rekening)
--   atau: npm run db:migrate-stok-aktif / db:migrate-foto-bukti / db:migrate-bank-atas-nama
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

-- Master: kategori produk (bukan ENUM di produk)
CREATE TABLE IF NOT EXISTS kategori_produk (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(100) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_kategori_produk_nama (nama)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Master: kurir / pengiriman
CREATE TABLE IF NOT EXISTS pengiriman (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(100) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_pengiriman_nama (nama)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Master: rekening bank toko (menggantikan nama_bank_a/b di info_toko)
CREATE TABLE IF NOT EXISTS bank (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama_bank VARCHAR(50) NOT NULL,
  no_rek VARCHAR(50) NOT NULL,
  atas_nama VARCHAR(100) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS produk (
  id_produk INT AUTO_INCREMENT PRIMARY KEY,
  nama_produk VARCHAR(255) NOT NULL,
  deskripsi TEXT NOT NULL,
  harga INT NOT NULL,
  gambar VARCHAR(500) NULL,
  kategori VARCHAR(100) NOT NULL,
  stok INT NOT NULL DEFAULT 0,
  aktif TINYINT(1) NOT NULL DEFAULT 1,
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
  pengiriman VARCHAR(100) NOT NULL,
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

-- Seed master (hanya jika kosong)
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

INSERT INTO info_toko (
  logo_toko, nama_toko, tentang, foto_banner, alamat_toko, email_toko, tlp_toko,
  jam_buka, jam_tutup,
  logo_wa, logo_ig, logo_fb, link_wa, link_ig, link_fb
)
SELECT
  'default-logo.jpg', 'Toko Mango',
  'Menyediakan berbagai produk mangga segar dan olahan berkualitas untuk kebutuhan harian Anda.',
  '',
  'Alamat belum diisi', 'info@toko.local', 6280000000000,
  8, 20,
  'wa.png', 'ig.png', 'fb.png', 'https://wa.me/', 'https://instagram.com/', 'https://facebook.com/'
FROM (SELECT COUNT(*) AS n FROM info_toko) AS x
WHERE x.n = 0;

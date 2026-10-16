-- =============================================================================
-- Migrasi: kategori produk, pengiriman, bank → tabel master (bukan ENUM/hardcode)
-- Jalankan sekali di database yang sudah ada (phpMyAdmin / MySQL CLI).
-- Database baru: cukup pakai schema-latihan-toko.sql yang sudah diperbarui.
-- =============================================================================

SET NAMES utf8mb4;

-- ---------------------------------------------------------------------------
-- 1) Tabel master
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS kategori_produk (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(100) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_kategori_produk_nama (nama)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS pengiriman (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(100) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_pengiriman_nama (nama)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS bank (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama_bank VARCHAR(50) NOT NULL,
  no_rek VARCHAR(50) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed kategori dari nilai ENUM lama (abaikan jika sudah ada)
INSERT IGNORE INTO kategori_produk (nama) VALUES
  ('Mango Sticky Rice'),
  ('Mango Pudding'),
  ('Mango Milkshake');

INSERT IGNORE INTO pengiriman (nama) VALUES
  ('JNT Express'),
  ('JNE');

-- Seed bank dari kolom info_toko (hanya jika bank masih kosong & kolom masih ada)
-- Jika kolom bank di info_toko sudah dihapus, lewati blok ini dan isi contoh di bawah.
INSERT INTO bank (nama_bank, no_rek)
SELECT t.nama_bank_a, CAST(t.no_rek_a AS CHAR)
FROM info_toko t
WHERE (SELECT COUNT(*) FROM bank) = 0
  AND t.nama_bank_a IS NOT NULL AND TRIM(t.nama_bank_a) <> ''
LIMIT 1;

INSERT INTO bank (nama_bank, no_rek)
SELECT t.nama_bank_b, CAST(t.no_rek_b AS CHAR)
FROM info_toko t
WHERE (SELECT COUNT(*) FROM bank) = 1
  AND t.nama_bank_b IS NOT NULL AND TRIM(t.nama_bank_b) <> ''
LIMIT 1;

-- Fallback contoh jika bank masih kosong
INSERT INTO bank (nama_bank, no_rek)
SELECT 'BCA', '1234567890'
WHERE (SELECT COUNT(*) FROM bank) = 0;

INSERT INTO bank (nama_bank, no_rek)
SELECT 'Mandiri', '9876543210'
WHERE (SELECT COUNT(*) FROM bank) = 1;

-- ---------------------------------------------------------------------------
-- 2) Ubah kolom ENUM → VARCHAR (simpan nama dari tabel master)
-- ---------------------------------------------------------------------------
ALTER TABLE produk
  MODIFY COLUMN kategori VARCHAR(100) NOT NULL;

ALTER TABLE pembelian
  MODIFY COLUMN pengiriman VARCHAR(100) NOT NULL DEFAULT 'JNT Express';

-- ---------------------------------------------------------------------------
-- 3) Hapus kolom bank dari info_toko (rekening pindah ke tabel bank)
-- Jalankan satu per satu; jika error "Unknown column" = sudah dihapus.
-- ---------------------------------------------------------------------------
ALTER TABLE info_toko DROP COLUMN nama_bank_a;
ALTER TABLE info_toko DROP COLUMN nama_bank_b;
ALTER TABLE info_toko DROP COLUMN no_rek_a;
ALTER TABLE info_toko DROP COLUMN no_rek_b;

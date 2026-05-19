-- Tambah kolom info_toko sesuai toko_online.sql (jika DB lama belum punya).
-- Abaikan error "Duplicate column" jika kolom sudah ada.

USE toko_online;

ALTER TABLE info_toko
  ADD COLUMN tentang TEXT NOT NULL DEFAULT '' AFTER nama_toko;

ALTER TABLE info_toko
  ADD COLUMN foto_banner VARCHAR(500) NOT NULL DEFAULT '' AFTER tentang;

-- ALTER sederhana: tambah kolom foto_bukti pada pembelian.
-- Hanya jalankan jika kolom BELUM ada (jika sudah ada → error Duplicate column).
--
-- Untuk menyelaraskan SEMUA tabel/kolom seperti schema latihan, gunakan:
--   database/alter-database-yang-sudah-ada.sql
-- (perintah ALTER biasa; jika kolom sudah ada, abaikan error duplicate.)

ALTER TABLE pembelian
  ADD COLUMN foto_bukti VARCHAR(500) NULL
  AFTER catatan;

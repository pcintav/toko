-- =============================================================================
-- Migrasi: kolom stok + aktif pada tabel produk (DB lama)
-- Aman dijalankan ulang: lewati jika kolom sudah ada (lihat scripts/migrate-produk-stok-aktif.js)
-- =============================================================================

ALTER TABLE produk
  ADD COLUMN stok INT NOT NULL DEFAULT 0 AFTER kategori,
  ADD COLUMN aktif TINYINT(1) NOT NULL DEFAULT 1 AFTER stok;

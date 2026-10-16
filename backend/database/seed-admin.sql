-- =============================================================================
-- Seed: user admin (password sudah di-hash bcrypt)
-- =============================================================================
-- Urutan setup database baru:
--   1) CREATE DATABASE toko_online;  (samakan dengan DB_NAME di backend/.env)
--   2) Impor schema-latihan-toko.sql
--   3) Impor file ini (seed-admin.sql)
--   4) Opsional: seed-lengkapi-toko-online.sql (produk/artikel contoh)
--
-- phpMyAdmin: pilih database di sidebar → Impor.
-- MySQL CLI: USE toko_online; lalu source file ini.
--
-- Login di browser (/login) atau Postman:
--   credential : admin@toko.local   ATAU   admintoko
--   passwd     : Admin123!
--
-- Hanya untuk latihan/dev. Ganti password sebelum dipakai publik.
-- =============================================================================

INSERT INTO users (
  nama_d,
  nama_b,
  kelamin,
  lahir,
  alamat,
  phone,
  email,
  role,
  uname,
  passwd,
  foto
) VALUES (
  'Admin',
  'Sistem',
  'Laki-laki',
  '1990-01-01',
  '-',
  6281000000000,
  'admin@toko.local',
  'admin',
  'admintoko',
  '$2b$10$m2CONSnNEh3iOqcpfIO4ZONQ0FNet6arD6D2tPpMaxw64mpj9OSOu',
  'default.jpg'
);

-- Jika error duplicate (email atau uname sudah dipakai), hapus dulu baris lama
-- atau ubah email/uname di VALUES di atas.

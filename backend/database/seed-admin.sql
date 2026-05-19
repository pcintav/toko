-- =============================================================================
-- Seed manual: user admin (role admin, password bcrypt)
-- =============================================================================
-- Untuk DATABASE BARU (belum ada tabel / belum ada user admin):
--   1) Buat database (sekali) — samakan nama dengan DB_NAME di backend/.env
--   2) Jalankan backend/database/schema-latihan-toko.sql di database itu
--   3) Baru jalankan file ini
--
-- Di MySQL CLI, aktifkan baris USE di bawah (ganti nama DB jika beda).
-- Di phpMyAdmin: pilih database dulu di sidebar, lalu impor / tempel skrip ini.
--
-- CREATE DATABASE IF NOT EXISTS toko_online
--   CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE toko_online;
--
-- Jalankan di MySQL/MariaDB setelah tabel `users` sudah dibuat (langkah 2).
--
-- Login (Postman / API):
--   POST /api/users/login
--   { "credential": "admin@toko.local", "passwd": "Admin123!" }
--   atau credential: "admintoko" (uname)
--
-- Password plaintext (hanya untuk dev): Admin123!
-- Ganti password / hapus user ini setelah setup production.
--
-- Kolom mengikuti INSERT di models/usersModel.js + kolom `role`.
-- Sesuaikan ENUM `role` jika nama di DB Anda berbeda.
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

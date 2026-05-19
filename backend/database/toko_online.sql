-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 18, 2026 at 05:05 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `toko_online`
--

-- --------------------------------------------------------

--
-- Table structure for table `artikel`
--

CREATE TABLE `artikel` (
  `id` int(11) NOT NULL,
  `judul` varchar(225) NOT NULL,
  `ringkasan` text NOT NULL,
  `isi` text NOT NULL,
  `gambar` varchar(500) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `info_toko`
--

CREATE TABLE `info_toko` (
  `logo_toko` varchar(500) NOT NULL,
  `nama_toko` varchar(50) NOT NULL,
  `tentang` text NOT NULL,
  `foto_banner` varchar(500) NOT NULL,
  `alamat_toko` text NOT NULL,
  `email_toko` varchar(30) NOT NULL,
  `tlp_toko` bigint(20) NOT NULL,
  `nama_bank_a` varchar(30) NOT NULL,
  `nama_bank_b` varchar(30) NOT NULL,
  `no_rek_a` bigint(20) NOT NULL,
  `no_rek_b` bigint(20) NOT NULL,
  `jam_buka` int(5) NOT NULL,
  `jam_tutup` int(5) NOT NULL,
  `logo_wa` varchar(500) NOT NULL,
  `logo_ig` varchar(500) NOT NULL,
  `logo_fb` varchar(500) NOT NULL,
  `link_wa` text NOT NULL,
  `link_ig` text NOT NULL,
  `link_fb` text NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `info_toko`
--

INSERT INTO `info_toko` (`logo_toko`, `nama_toko`, `tentang`, `foto_banner`, `alamat_toko`, `email_toko`, `tlp_toko`, `nama_bank_a`, `nama_bank_b`, `no_rek_a`, `no_rek_b`, `jam_buka`, `jam_tutup`, `logo_wa`, `logo_ig`, `logo_fb`, `link_wa`, `link_ig`, `link_fb`, `created_at`, `updated_at`) VALUES
('/uploads/images/1779068251735-9a7d53d5dcace95a.png', 'TOKOKU', '', '', 'JL disana', 'tokoku@gmail.com', 62888888888, 'BRI', 'BNI', 8686876876868, 86868686, 8, 20, '/uploads/images/1779068301560-d152fbeaa8d029da.png', '/uploads/images/1779068317669-d5fed3c3cdf2250f.png', '/uploads/images/1779068325648-b99bff63aecb7733.png', '#', '#', '#', '2026-05-18 08:38:54', '2026-05-18 08:38:54');

-- --------------------------------------------------------

--
-- Table structure for table `kontak`
--

CREATE TABLE `kontak` (
  `id` int(11) NOT NULL,
  `nama_lengkap` varchar(50) NOT NULL,
  `email` varchar(30) NOT NULL,
  `no_hp` bigint(20) NOT NULL,
  `isi_pesan` text NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `kontak`
--

INSERT INTO `kontak` (`id`, `nama_lengkap`, `email`, `no_hp`, `isi_pesan`, `created_at`, `updated_at`) VALUES
(1, 'Siti', 'siti@email.com', 8123456789, 'hello', '2026-05-06 11:03:56', '2026-05-06 11:03:56');

-- --------------------------------------------------------

--
-- Table structure for table `pembelian`
--

CREATE TABLE `pembelian` (
  `id` int(11) NOT NULL,
  `id_pembeli` int(11) NOT NULL,
  `id_produk` int(11) NOT NULL,
  `nama_pembeli` varchar(50) DEFAULT NULL,
  `alamat_pembeli` text DEFAULT NULL,
  `phone_pembeli` bigint(20) DEFAULT NULL,
  `metode_pembayaran` enum('Bank Transfer','COD') NOT NULL DEFAULT 'COD',
  `pembayaran` enum('Belum','Dibayar') NOT NULL DEFAULT 'Belum',
  `pengiriman` enum('JNT Express','JNE') NOT NULL DEFAULT 'JNT Express',
  `status` enum('Tertunda','Dikemas','Dikirim','Diterima','Selesai') NOT NULL DEFAULT 'Tertunda',
  `catatan` text DEFAULT NULL,
  `foto_bukti` varchar(500) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `produk`
--

CREATE TABLE `produk` (
  `id_produk` int(11) NOT NULL,
  `nama_produk` varchar(255) NOT NULL,
  `deskripsi` text NOT NULL,
  `harga` int(11) NOT NULL,
  `gambar` varchar(500) DEFAULT NULL,
  `kategori` enum('Mango Sticky Rice','Mango Pudding','Mango Milkshake') NOT NULL DEFAULT 'Mango Sticky Rice',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `nama_d` varchar(50) NOT NULL,
  `nama_b` varchar(50) NOT NULL,
  `kelamin` text NOT NULL,
  `lahir` text NOT NULL,
  `alamat` text NOT NULL,
  `phone` bigint(20) NOT NULL,
  `email` varchar(30) NOT NULL,
  `role` enum('admin','pembeli') NOT NULL DEFAULT 'pembeli',
  `uname` varchar(30) NOT NULL,
  `passwd` varchar(256) NOT NULL,
  `foto` varchar(500) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `nama_d`, `nama_b`, `kelamin`, `lahir`, `alamat`, `phone`, `email`, `role`, `uname`, `passwd`, `foto`, `created_at`, `updated_at`) VALUES
(1, 'Admin', 'Sistem', 'Laki-laki', '1990-01-01', '-', 6281000000000, 'admin@toko.local', 'admin', 'admintoko', '$2b$10$m2CONSnNEh3iOqcpfIO4ZONQ0FNet6arD6D2tPpMaxw64mpj9OSOu', 'default.jpg', '2026-05-18 07:13:41', '2026-05-18 07:13:41');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `artikel`
--
ALTER TABLE `artikel`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `kontak`
--
ALTER TABLE `kontak`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `pembelian`
--
ALTER TABLE `pembelian`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_pembeli` (`id_pembeli`),
  ADD KEY `id_produk` (`id_produk`);

--
-- Indexes for table `produk`
--
ALTER TABLE `produk`
  ADD PRIMARY KEY (`id_produk`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `artikel`
--
ALTER TABLE `artikel`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `kontak`
--
ALTER TABLE `kontak`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `pembelian`
--
ALTER TABLE `pembelian`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `produk`
--
ALTER TABLE `produk`
  MODIFY `id_produk` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `pembelian`
--
ALTER TABLE `pembelian`
  ADD CONSTRAINT `pembelian_ibfk_1` FOREIGN KEY (`id_pembeli`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `pembelian_ibfk_2` FOREIGN KEY (`id_produk`) REFERENCES `produk` (`id_produk`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

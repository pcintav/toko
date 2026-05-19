/**
 * utils/kelamin.js — normalisasi input jenis kelamin sebelum simpan ke MySQL.
 *
 * Form bisa mengirim "L"/"P" atau teks penuh; database ENUM mengharapkan
 * "Laki-laki" atau "Perempuan" (sesuai skema latihan).
 * Dipakai: usersController (register/profil), adminController (buat/ubah pembeli).
 */
function normalizeKelamin(value) {
  const s = String(value || "").trim();
  // Singkatan lama atau awalan kata → nilai standar ENUM
  if (s === "L" || /^laki/i.test(s)) return "Laki-laki";
  if (s === "P" || /^perempuan/i.test(s)) return "Perempuan";
  return s; // sudah format penuh dari select HTML
}

module.exports = { normalizeKelamin };

/**
 * uploadController.js — mengembalikan JSON setelah file tersimpan di disk.
 *
 * PENTING: file ini TIDAK menerima upload sendiri.
 * Urutan di route:
 *   1. middlewareUploadGambar (multer) → mengisi req.file
 *   2. sendHasilUpload (fungsi ini) → baca req.file → kirim path ke frontend
 *
 * Dipakai: POST /api/admin/upload-gambar dan POST /api/users/upload-gambar
 */

/**
 * POST .../upload-gambar
 * req.file sudah diisi multer: { filename, path, size, mimetype, ... }
 */
exports.sendHasilUpload = (req, res) => {
  // Path relatif yang disimpan di kolom DB (gambar, foto, logo_toko, ...)
  const rel = `/uploads/images/${req.file.filename}`;

  // Bangun URL penuh agar frontend bisa preview tanpa tahu API_BASE
  const host = req.get("x-forwarded-host") || req.get("host");
  const proto = req.get("x-forwarded-proto") || req.protocol;
  const url = `${proto}://${host}${rel}`;

  res.status(201).json({
    message: "Upload berhasil",
    data: {
      filename: req.file.filename, // nama file di disk, mis. 1779....jpg
      path: rel, // yang dikirim ke PUT produk/profil: "/uploads/images/..."
      url // URL lengkap untuk buka di tab baru (opsional)
    }
  });
};

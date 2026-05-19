/**
 * Upload gambar ke folder `uploads/images/` (disk).
 * Dipakai admin (`POST /api/admin/upload-gambar`) dan pembeli (`POST /api/users/upload-gambar`).
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const multer = require("multer");

const uploadDir = path.join(__dirname, "..", "uploads", "images");
fs.mkdirSync(uploadDir, { recursive: true });

const mimeToExt = {
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "image/gif": ".gif",
  "image/webp": ".webp"
};

const storage = multer.diskStorage({
  // Simpan file ke folder uploads/images (bukan memory buffer)
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  // Nama unik: timestamp + random hex — hindari tabrakan nama file sama
  filename: (req, file, cb) => {
    const mime = (file.mimetype || "").toLowerCase();
    const ext = mimeToExt[mime] || ".jpg";
    const name = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${ext}`;
    cb(null, name);
  }
});

function fileFilter(req, file, cb) {
  const mime = (file.mimetype || "").toLowerCase();
  if (mimeToExt[mime]) return cb(null, true);
  cb(new Error("Hanya gambar JPEG, PNG, GIF, atau WebP yang diizinkan"));
}

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter
});

/**
 * Wrapper agar error Multer bisa dijawab sebagai JSON 400 (bukan HTML error Express).
 */
exports.middlewareUploadGambar = (req, res, next) => {
  // single("gambar") = form-data hanya satu field bernama "gambar" (sesuai frontend)
  upload.single("gambar")(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({ message: "Ukuran file melebihi batas maksimal 5 MB" });
        }
        return res.status(400).json({ message: err.message });
      }
      return res.status(400).json({ message: err.message || "Upload gagal" });
    }
    if (!req.file) {
      return res.status(400).json({
        message: 'Kirim satu file gambar dengan field name "gambar" (multipart/form-data)'
      });
    }
    next();
  });
};

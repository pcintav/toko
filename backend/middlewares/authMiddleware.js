/**
 * Middleware autentikasi JWT.
 * Dipasang di route yang butuh user sudah login; setelah sukses, req.user berisi payload token.
 */

const jwt = require("jsonwebtoken");

/**
 * authenticate — baca Bearer token, verifikasi tanda tangan dan masa berlaku.
 * @param {import("express").Request} req - req.headers.authorization berisi "Bearer <token>"
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next - lanjut ke handler route berikutnya
 */
exports.authenticate = (req, res, next) => {
  try {
    // Header standar: Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
    const authHeader = req.headers.authorization;

    // Tanpa header atau bukan skema Bearer → tidak ada token yang bisa diverifikasi
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Token tidak ditemukan" });
    }

    // Ambil bagian setelah kata "Bearer " (spasi) → string JWT mentah
    const token = authHeader.split(" ")[1];

    /**
     * Verifikasi: cocokkan signature dengan JWT_SECRET, cek exp/nbf.
     * decoded biasanya { id, role } sesuai yang di-sign saat login/register.
     */
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Simpan identitas user untuk controller/middleware berikutnya
    req.user = decoded;
    next();
  } catch (error) {
    /**
     * jwt.verify melempar jika token expired, format rusak, atau secret salah.
     * Jangan kirim detail error ke klien (keamanan); cukup pesan generik.
     */
    return res.status(401).json({ message: "Token tidak valid atau sudah expired" });
  }
};

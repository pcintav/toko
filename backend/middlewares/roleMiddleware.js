/**
 * Middleware pembatasan berdasarkan peran (role) di JWT.
 * Wajib dipasang SETELAH authenticate agar req.user sudah terisi dari token.
 */

/**
 * requireRole — factory yang mengembalikan middleware Express.
 * @param {...string} allowedRoles — daftar role yang diizinkan, misalnya requireRole("admin")
 * @returns {(req, res, next) => void}
 *
 * Contoh: requireRole("pembeli") → hanya token dengan payload.role === "pembeli" yang lolos.
 */
exports.requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    // Role diambil dari payload JWT (bukan query DB di middleware ini)
    const role = req.user?.role;

    // Token lama atau payload tanpa role → tolak akses
    if (!role) {
      return res.status(403).json({ message: "Akses ditolak" });
    }

    // Role user tidak termasuk daftar putih → forbidden (bukan 401, karena sudah terautentikasi)
    if (!allowedRoles.includes(role)) {
      return res.status(403).json({ message: "Akses ditolak untuk peran ini" });
    }

    next();
  };
};

/**
 * Controller user: register, login, profil "saya".
 * Mengatur alur HTTP (req/res), memanggil model DB, hashing password, dan penerbitan JWT.
 */

const bcrypt = require("bcrypt"); // untuk hash & bandingkan password (salt rounds)
const jwt = require("jsonwebtoken"); // JSON Web Token: stateless session

// Fungsi akses database user (Promise-based)
const {
  createUser,
  findUserByEmail,
  findUserByCredential,
  findUserById,
  findPasswdHashById,
  updateUserProfile
} = require("../models/usersModel");
const { normalizeKelamin } = require("../utils/kelamin");

/**
 * Bangun objek field untuk UPDATE profil — hanya key yang dikirim di body yang diisi.
 * Mengembalikan null jika validasi gagal (respons 400 sudah dikirim).
 */
function buildProfileFieldsFromBody(body, res) {
  const { nama_d, nama_b, kelamin, lahir, alamat, phone, foto } = body;
  const fields = {};

  if (nama_d !== undefined) fields.nama_d = String(nama_d).trim();
  if (nama_b !== undefined) fields.nama_b = String(nama_b).trim();
  if (kelamin !== undefined) fields.kelamin = normalizeKelamin(kelamin);
  if (lahir !== undefined) fields.lahir = String(lahir).trim();
  if (alamat !== undefined) fields.alamat = String(alamat).trim();
  if (phone !== undefined) {
    const p = typeof phone === "number" ? phone : parseInt(String(phone).replace(/\D/g, ""), 10);
    if (Number.isNaN(p)) {
      res.status(400).json({ message: "phone harus angka valid" });
      return null;
    }
    fields.phone = p;
  }
  // foto: path dari POST upload-gambar — bukan URL eksternal
  if (foto !== undefined) {
    const f = String(foto).trim();
    if (f.length > 500) {
      res.status(400).json({ message: "foto terlalu panjang (maks 500 karakter)" });
      return null;
    }
    if (f !== "" && !/^\/uploads\/images\/[a-zA-Z0-9._-]+$/.test(f)) {
      res.status(400).json({
        message:
          "foto harus path dari server ini, contoh: /uploads/images/namafile.jpg (unggah dulu lewat POST /upload-gambar)"
      });
      return null;
    }
    fields.foto = f || "default.jpg";
  }

  return fields;
}

/**
 * POST /api/users/register
 * Body JSON: field formulir pendaftaran + passwd plaintext.
 * Password tidak disimpan plaintext; role default di DB biasanya pembeli; JWT register memaksa role pembeli di token.
 */
exports.registerUser = async (req, res) => {
  try {
    // Destrukturisasi body: nama dari frontend harus sama dengan key ini
    const {
      nama_d,
      nama_b,
      kelamin,
      lahir,
      alamat,
      phone,
      email,
      uname,
      passwd
    } = req.body;

    // Cegah duplikat email — satu email satu akun
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: "Email sudah terdaftar" });
    }

    // bcrypt.hash async: cost 10 = jumlah putaran (keseimbangan keamanan vs CPU)
    const hashedPassword = await bcrypt.hash(passwd, 10);

    // Simpan user; passwd di DB = hash, bukan plaintext
    const newUser = await createUser({
      nama_d,
      nama_b,
      kelamin: normalizeKelamin(kelamin),
      lahir,
      alamat,
      phone,
      email,
      uname,
      passwd: hashedPassword
    });

    /**
     * insertId = AUTO_INCREMENT id baris yang baru di-insert (mysql2).
     * Token langsung diberi agar user tidak perlu login lagi setelah register.
     * Role di token dipaksa "pembeli" (konsisten dengan alur registrasi publik).
     */
    const token = jwt.sign(
      { id: newUser.insertId, role: "pembeli" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(201).json({
      message: "Register berhasil",
      token
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * POST /api/users/login
 * Body: { credential, passwd } — credential bisa email ATAU username (uname).
 */
exports.loginUser = async (req, res) => {
  try {
    const { credential, passwd } = req.body;

    // Validasi input minimal — hindari query DB untuk body kosong
    if (!credential || !passwd) {
      return res.status(400).json({ message: "Credential dan password wajib diisi" });
    }

    // Satu query untuk email atau uname
    const user = await findUserByCredential(credential);
    if (!user) {
      // Sengaja sama pesannya dengan password salah (mencegah enumerasi user)
      return res.status(401).json({ message: "Email/username atau password salah" });
    }

    // Bandingkan plaintext dari body dengan hash kolom user.passwd
    const isPasswordValid = await bcrypt.compare(passwd, user.passwd);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Email/username atau password salah" });
    }

    /**
     * Token berisi id dan role dari baris DB — admin vs pembeli dipakai middleware requireRole.
     */
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Login berhasil",
      token,
      role: user.role
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * GET /api/users/me (pembeli) atau GET /api/admin/me (admin)
 * req.user.id diset oleh middleware authenticate dari payload JWT.
 */
exports.getMyProfile = async (req, res) => {
  try {
    const user = await findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    res.status(200).json({
      message: "Data profil berhasil diambil",
      data: user
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * PUT /api/users/me (pembeli) atau PUT /api/admin/me (admin).
 * Body JSON: field profil (nama_d, nama_b, …) dan/atau ganti password:
 * - passwd (baru, opsional), passwd_lama (wajib jika passwd diisi).
 */
exports.updateMyProfile = async (req, res) => {
  try {
    const fields = buildProfileFieldsFromBody(req.body, res);
    if (!fields) return;

    const { passwd, passwd_lama } = req.body;
    const newPass = passwd !== undefined && passwd !== null ? String(passwd).trim() : "";
    if (newPass) {
      if (newPass.length < 6) {
        return res.status(400).json({ message: "Password baru minimal 6 karakter" });
      }
      if (!passwd_lama) {
        return res.status(400).json({ message: "Password lama wajib diisi untuk mengganti password" });
      }
      const row = await findPasswdHashById(req.user.id);
      if (!row) {
        return res.status(404).json({ message: "User tidak ditemukan" });
      }
      const ok = await bcrypt.compare(String(passwd_lama), row.passwd);
      if (!ok) {
        return res.status(400).json({ message: "Password lama salah" });
      }
      fields.passwd = await bcrypt.hash(newPass, 10);
    }

    if (Object.keys(fields).length === 0) {
      return res.status(400).json({ message: "Kirim minimal satu field untuk diubah" });
    }

    const result = await updateUserProfile(req.user.id, req.user.role, fields);
    if (result.affectedRows === 0) {
      return res.status(400).json({ message: "Tidak ada perubahan atau akun tidak ditemukan" });
    }

    const user = await findUserById(req.user.id);
    res.status(200).json({ message: "Profil berhasil diperbarui", data: user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

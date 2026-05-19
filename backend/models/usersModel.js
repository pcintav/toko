/**
 * Model lapisan akses data untuk tabel `users`.
 * Semua fungsi mengembalikan Promise agar controller bisa memakai async/await.
 */

const db = require("../config/db");

/**
 * Cari tepat satu user berdasarkan email (untuk cek duplikat saat register).
 * @param {string} email
 * @returns {Promise<object|null>} baris user atau null
 */
exports.findUserByEmail = (email, excludeId = null) => {
  return new Promise((resolve, reject) => {
    let sql = "SELECT * FROM users WHERE email = ?";
    const params = [email];
    if (excludeId != null) {
      sql += " AND id <> ?";
      params.push(excludeId);
    }
    db.query(
      sql,
      params,
      (err, results) => {
        if (err) {
          return reject(err); // propagasi error ke catch controller
        }

        if (!results || results.length === 0) {
          return resolve(null); // tidak ada baris = email belum dipakai
        }

        resolve(results[0]); // satu baris pertama
      }
    );
  });
};

/**
 * Login: credential bisa email atau username (uname); OR dengan LIMIT 1.
 */
exports.findUserByCredential = (credential) => {
  return new Promise((resolve, reject) => {
    db.query(
      "SELECT * FROM users WHERE email = ? OR uname = ? LIMIT 1",
      [credential, credential],
      (err, results) => {
        if (err) {
          return reject(err);
        }

        if (!results || results.length === 0) {
          return resolve(null);
        }

        resolve(results[0]); // termasuk kolom passwd (hash) untuk bcrypt.compare di controller
      }
    );
  });
};

/**
 * Profil publik aman: tanpa passwd; kolom disesuaikan kebutuhan API /me.
 */
/** Hash password untuk verifikasi saat ganti password (hanya internal controller). */
exports.findPasswdHashById = (id) => {
  return new Promise((resolve, reject) => {
    db.query("SELECT passwd FROM users WHERE id = ? LIMIT 1", [id], (err, results) => {
      if (err) return reject(err);
      if (!results?.length) return resolve(null);
      resolve(results[0]);
    });
  });
};

exports.findUserById = (id) => {
  return new Promise((resolve, reject) => {
    db.query(
      `SELECT id, nama_d, nama_b, kelamin, lahir, email, uname, role, phone, alamat, foto, created_at
       FROM users WHERE id = ? LIMIT 1`,
      [id],
      (err, results) => {
        if (err) {
          return reject(err);
        }

        if (!results || results.length === 0) {
          return resolve(null);
        }

        resolve(results[0]);
      }
    );
  });
};

/**
 * INSERT user baru. Kolom `role` tidak diisi di query ini — mengandalkan DEFAULT di MySQL (mis. pembeli).
 * @param {object} userData — passwd harus sudah hash di controller.
 */
exports.createUser = (userData) => {
  return new Promise((resolve, reject) => {
    const query = `
      INSERT INTO users 
      (nama_d, nama_b, kelamin, lahir, alamat, phone, email, uname, passwd, foto) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      userData.nama_d,
      userData.nama_b,
      userData.kelamin,
      userData.lahir,
      userData.alamat,
      userData.phone,
      userData.email,
      userData.uname,
      userData.passwd,
      userData.foto || "default.jpg"
    ];

    db.query(query, values, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

/** Admin membuat akun pembeli atau admin (role wajib di userData). */
exports.createUserByAdmin = (userData) => {
  return new Promise((resolve, reject) => {
    const query = `
      INSERT INTO users
      (nama_d, nama_b, kelamin, lahir, alamat, phone, email, role, uname, passwd, foto)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      userData.nama_d,
      userData.nama_b,
      userData.kelamin,
      userData.lahir,
      userData.alamat,
      userData.phone,
      userData.email,
      userData.role,
      userData.uname,
      userData.passwd,
      userData.foto || "default.jpg"
    ];
    db.query(query, values, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

/**
 * Cek username sudah dipakai (register / admin buat user).
 * excludeId dipakai saat edit: abaikan baris user yang sedang diedit.
 */
exports.findUserByUname = (uname, excludeId = null) => {
  return new Promise((resolve, reject) => {
    let sql = "SELECT id FROM users WHERE uname = ?";
    const params = [uname];
    if (excludeId != null) {
      sql += " AND id <> ?";
      params.push(excludeId);
    }
    sql += " LIMIT 1";
    db.query(sql, params, (err, results) => {
      if (err) return reject(err);
      if (!results || results.length === 0) return resolve(null);
      resolve(results[0]);
    });
  });
};

/**
 * Daftar pembeli untuk panel admin (tanpa kolom passwd).
 * Hanya role `pembeli` agar data admin tidak ikut tampil di daftar ini.
 */
exports.findAllPembeliForAdmin = () => {
  return new Promise((resolve, reject) => {
    db.query(
      `SELECT id, nama_d, nama_b, kelamin, lahir, email, uname, phone, alamat, foto, created_at
       FROM users WHERE role = 'pembeli' ORDER BY id DESC LIMIT 500`,
      (err, results) => {
        if (err) return reject(err);
        resolve(results || []);
      }
    );
  });
};

/**
 * Update profil sendiri (pembeli atau admin) — kolom profil saja, filter role dari JWT.
 */
exports.updateUserProfile = (id, role, fields) => {
  return new Promise((resolve, reject) => {
    // Whitelist kolom — cegah UPDATE kolom sensitif (role, email) dari body sembarangan
    const allowed = ["nama_d", "nama_b", "kelamin", "lahir", "alamat", "phone", "foto", "passwd"];
    const sets = [];
    const values = [];
    for (const key of allowed) {
      if (fields[key] !== undefined) {
        sets.push(`${key} = ?`);
        values.push(fields[key]);
      }
    }
    if (sets.length === 0) {
      return resolve({ affectedRows: 0 });
    }
    // AND role = ? → admin tidak bisa ubah baris pembeli lewat endpoint /me pembeli
    values.push(id, role);
    const query = `
      UPDATE users SET ${sets.join(", ")}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND role = ?
    `;
    db.query(query, values, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

/** @deprecated gunakan updateUserProfile — tetap diekspor agar tidak memecah impor lama */
exports.updatePembeliProfile = (id, fields) => exports.updateUserProfile(id, "pembeli", fields);

/** Daftar user untuk panel admin; role opsional: admin | pembeli */
exports.findAllUsersForAdmin = (roleFilter) => {
  return new Promise((resolve, reject) => {
    let query = `
      SELECT id, nama_d, nama_b, email, uname, role, phone, alamat, foto, created_at
      FROM users`;
    const params = [];
    if (roleFilter === "admin" || roleFilter === "pembeli") {
      query += " WHERE role = ?";
      params.push(roleFilter);
    }
    query += " ORDER BY id DESC LIMIT 500";
    db.query(query, params, (err, results) => {
      if (err) return reject(err);
      resolve(results || []);
    });
  });
};

exports.findUserByIdForAdmin = (id) => {
  return new Promise((resolve, reject) => {
    db.query(
      `SELECT id, nama_d, nama_b, kelamin, lahir, alamat, phone, email, uname, role, foto, created_at, updated_at
       FROM users WHERE id = ? LIMIT 1`,
      [id],
      (err, results) => {
        if (err) return reject(err);
        if (!results || results.length === 0) return resolve(null);
        resolve(results[0]);
      }
    );
  });
};

exports.countAdmins = () => {
  return new Promise((resolve, reject) => {
    db.query("SELECT COUNT(*) AS n FROM users WHERE role = 'admin'", (err, results) => {
      if (err) return reject(err);
      resolve(results[0]?.n ?? 0);
    });
  });
};

/** Admin mengubah akun pembeli (bukan ubah role / bukan akun admin). */
exports.updatePembeliByAdmin = (id, data) => {
  return new Promise((resolve, reject) => {
    const sets = [
      "nama_d = ?",
      "nama_b = ?",
      "kelamin = ?",
      "lahir = ?",
      "alamat = ?",
      "phone = ?",
      "email = ?",
      "uname = ?",
      "foto = ?",
      "updated_at = CURRENT_TIMESTAMP"
    ];
    const values = [
      data.nama_d,
      data.nama_b,
      data.kelamin,
      data.lahir,
      data.alamat,
      data.phone,
      data.email,
      data.uname,
      data.foto
    ];
    // passwd hanya di-UPDATE jika admin mengisi password baru di form edit
    if (data.passwd) {
      sets.splice(sets.length - 1, 0, "passwd = ?");
      values.splice(values.length, 0, data.passwd); // sudah hash di controller
    }
    values.push(id);
    const query = `
      UPDATE users SET ${sets.join(", ")}
      WHERE id = ? AND role = 'pembeli'
    `;
    db.query(query, values, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

/** Hapus akun pembeli; gagal dengan errno 1451 jika masih ada baris di tabel pembelian */
exports.deletePembeliById = (id) => {
  return new Promise((resolve, reject) => {
    db.query("DELETE FROM users WHERE id = ? AND role = 'pembeli'", [id], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

exports.deleteUserById = (id) => {
  return new Promise((resolve, reject) => {
    db.query("DELETE FROM users WHERE id = ?", [id], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

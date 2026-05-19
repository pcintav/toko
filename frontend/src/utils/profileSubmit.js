/**
 * utils/profileSubmit.js — validasi & payload update profil (admin/pembeli).
 *
 * Menggabungkan field profil; password baru hanya dikirim jika diisi dan cocok.
 * Dipakai AdminProfilPage dan PembeliProfilPage.
 */

/**
 * Siapkan body PUT /me dari state form:
 * - Field profil (nama, email, dll.) selalu dikirim
 * - passwd* hanya masuk payload jika user mengisi password baru
 */
export function buildProfilePayload(form) {
  const { passwd_lama, passwd, passwd_confirm, ...profile } = form;
  const payload = { ...profile };

  const newPass = String(passwd || '').trim();
  if (!newPass) return payload;

  if (!String(passwd_lama || '').trim()) {
    throw new Error('Password lama wajib diisi untuk mengganti password.');
  }
  if (newPass.length < 6) {
    throw new Error('Password baru minimal 6 karakter.');
  }
  if (newPass !== String(passwd_confirm || '').trim()) {
    throw new Error('Konfirmasi password baru tidak cocok.');
  }

  payload.passwd = newPass;
  payload.passwd_lama = passwd_lama;
  return payload;
}

/** Nilai awal field password kosong — reset setelah simpan sukses. */
export const emptyPasswordFields = {
  passwd_lama: '',
  passwd: '',
  passwd_confirm: '',
};

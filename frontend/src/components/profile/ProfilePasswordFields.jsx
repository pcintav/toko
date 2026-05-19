/**
 * [buatan] Blok form ganti password (lama, baru, konfirmasi).
 *
 * Dipakai halaman profil admin dan pembeli bersama profileSubmit.js.
 */
/** Props: values (passwd_*), onChange(field, value) — blok ganti password di profil. */
export default function ProfilePasswordFields({ values, onChange }) {
  return (
    <div className="profile-password-block border-top pt-4 mt-2">
      <h3 className="h6 mb-3">Ganti password</h3>
      <p className="text-secondary small mb-3">Kosongkan semua jika tidak ingin mengubah password.</p>
      <div className="mb-3">
        <label className="form-label">Password lama</label>
        <input
          type="password"
          className="form-control"
          value={values.passwd_lama}
          onChange={(e) => onChange('passwd_lama', e.target.value)}
          autoComplete="current-password"
        />
      </div>
      <div className="mb-3">
        <label className="form-label">Password baru</label>
        <input
          type="password"
          className="form-control"
          value={values.passwd}
          onChange={(e) => onChange('passwd', e.target.value)}
          autoComplete="new-password"
          minLength={6}
        />
      </div>
      <div className="mb-0">
        <label className="form-label">Ulangi password baru</label>
        <input
          type="password"
          className="form-control"
          value={values.passwd_confirm}
          onChange={(e) => onChange('passwd_confirm', e.target.value)}
          autoComplete="new-password"
        />
      </div>
    </div>
  );
}

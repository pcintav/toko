/**
 * [buatan] Strip ajakan hubungi toko (email) di beranda.
 *
 * Tautan ke anchor #kontak pada halaman yang sama.
 */
/** Props: info — ajakan hubungi via email, link ke #kontak. */
export default function NewsletterStrip({ info }) {
  if (!info?.email_toko) return null;

  return (
    <section className="newsletter-strip">
      <div className="container-xl text-center">
        <h2 className="h4 mb-2">Hubungi {info.nama_toko}</h2>
        <p className="text-secondary mb-4">
          Punya pertanyaan? Kirim pesan atau hubungi kami di {info.email_toko}
        </p>
        <a href="#kontak" className="btn btn-dark rounded-0 px-5 text-uppercase">
          Formulir kontak
        </a>
      </div>
    </section>
  );
}

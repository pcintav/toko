/**
 * scripts/seed-demo-isi.js — isi data demo produk / artikel / info toko.
 * Jalankan: node scripts/seed-demo-isi.js
 */
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const db = require("../config/db");

function q(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => (err ? reject(err) : resolve(results)));
  });
}

async function ensureKategori(nama) {
  const rows = await q("SELECT id FROM kategori_produk WHERE nama = ? LIMIT 1", [nama]);
  if (!rows.length) {
    await q("INSERT INTO kategori_produk (nama) VALUES (?)", [nama]);
    console.log("+ kategori:", nama);
  }
}

async function ensureProduk(row) {
  const rows = await q("SELECT id_produk FROM produk WHERE nama_produk = ? LIMIT 1", [
    row.nama_produk
  ]);
  if (rows.length) {
    await q(
      `UPDATE produk SET deskripsi=?, harga=?, kategori=?, stok=?, aktif=1,
       gambar = COALESCE(NULLIF(gambar,''), ?),
       updated_at=CURRENT_TIMESTAMP
       WHERE id_produk=?`,
      [row.deskripsi, row.harga, row.kategori, row.stok, row.gambar, rows[0].id_produk]
    );
    console.log("~ produk:", row.nama_produk);
    return;
  }
  await q(
    `INSERT INTO produk (nama_produk, deskripsi, harga, gambar, kategori, stok, aktif)
     VALUES (?, ?, ?, ?, ?, ?, 1)`,
    [row.nama_produk, row.deskripsi, row.harga, row.gambar, row.kategori, row.stok]
  );
  console.log("+ produk:", row.nama_produk);
}

async function ensureArtikel(row) {
  const rows = await q("SELECT id FROM artikel WHERE judul = ? LIMIT 1", [row.judul]);
  if (rows.length) {
    await q(
      `UPDATE artikel SET ringkasan=?, isi=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`,
      [row.ringkasan, row.isi, rows[0].id]
    );
    console.log("~ artikel:", row.judul);
    return;
  }
  await q(
    `INSERT INTO artikel (judul, ringkasan, isi, gambar) VALUES (?, ?, ?, ?)`,
    [row.judul, row.ringkasan, row.isi, row.gambar]
  );
  console.log("+ artikel:", row.judul);
}

(async () => {
  try {
    await q(
      `UPDATE info_toko SET
        nama_toko = 'TOKOKU',
        tentang = ?,
        alamat_toko = 'Jl. Pendidikan No. 12, Jakarta Selatan',
        email_toko = 'tokoku@gmail.com',
        tlp_toko = 62888888888,
        jam_buka = 8,
        jam_tutup = 20,
        link_wa = 'https://wa.me/62888888888',
        link_ig = 'https://instagram.com/',
        link_fb = 'https://facebook.com/',
        updated_at = CURRENT_TIMESTAMP`,
      [
        "Toko online latihan SMK RPL. Menyediakan perawatan kulit sehari-hari dengan harga terjangkau dan kualitas terpercaya."
      ]
    );
    console.log("~ info_toko diperbarui");

    await q(
      `UPDATE bank SET atas_nama = 'TOKOKU'
       WHERE atas_nama IS NULL OR atas_nama = '' OR atas_nama = 'Pemilik Toko'`
    );
    console.log("~ bank atas_nama → TOKOKU");

    for (const k of ["Serum", "Pelembap", "Pembersih"]) {
      await ensureKategori(k);
    }

    // Samakan produk lama yang kategori masih nama mangga
    await q(
      `UPDATE produk SET kategori = 'Serum'
       WHERE kategori IN ('Mango Sticky Rice','Mango Pudding','Mango Milkshake')
         AND nama_produk LIKE '%Serum%'`
    );

    const produk = [
      {
        nama_produk: "Glowvera Radiance Serum Vitamin C 15%",
        deskripsi:
          "Serum wajah dengan Vitamin C 15% dan Niacinamide. Membantu mencerahkan kulit kusam dan menjaga kelembapan. Tekstur ringan, cepat meresap.",
        harga: 89000,
        gambar: null,
        kategori: "Serum",
        stok: 25
      },
      {
        nama_produk: "Glowvera Hydra Gel Moisturizer",
        deskripsi:
          "Pelembap gel ringan dengan hyaluronic acid. Cocok untuk kulit berminyak dan kombinasi. Tidak lengket.",
        harga: 65000,
        gambar: null,
        kategori: "Pelembap",
        stok: 40
      },
      {
        nama_produk: "Glowvera Gentle Foam Cleanser",
        deskripsi:
          "Pembersih wajah busa lembut dengan pH seimbang. Membersihkan kotoran tanpa membuat kulit kering.",
        harga: 45000,
        gambar: null,
        kategori: "Pembersih",
        stok: 50
      },
      {
        nama_produk: "Glowvera Night Repair Serum",
        deskripsi:
          "Serum malam dengan retinol ringan dan pelembap. Membantu memperbaiki tekstur kulit saat tidur.",
        harga: 99000,
        gambar: null,
        kategori: "Serum",
        stok: 18
      },
      {
        nama_produk: "Glowvera Daily Sunscreen SPF50",
        deskripsi:
          "Tabir surya harian SPF50 PA+++. Ringan, tidak putih, cocok di bawah makeup.",
        harga: 75000,
        gambar: null,
        kategori: "Pelembap",
        stok: 35
      },
      {
        nama_produk: "Glowvera Micellar Water",
        deskripsi:
          "Air micellar untuk membersihkan makeup ringan dan sisa kotoran. Tanpa bilas, praktis dibawa bepergian.",
        harga: 38000,
        gambar: null,
        kategori: "Pembersih",
        stok: 45
      }
    ];

    for (const p of produk) await ensureProduk(p);

    // Hapus kategori mangga lama yang tidak dipakai produk
    await q(
      `DELETE FROM kategori_produk
       WHERE nama IN ('Mango Sticky Rice','Mango Pudding','Mango Milkshake')
         AND nama NOT IN (SELECT kategori FROM produk)`
    ).catch(() => {});

    const artikel = [
      {
        judul: "Cara memilih serum sesuai jenis kulit",
        ringkasan: "Panduan singkat memilih serum agar hasil perawatan lebih maksimal.",
        isi: "Kulit berminyak cocok dengan serum ringan berbasis water/gel. Kulit kering lebih nyaman dengan serum yang mengandung pelembap seperti hyaluronic acid. Mulai dari konsentrasi rendah, pakai rutin, dan selalu gunakan sunscreen di siang hari.",
        gambar: "default.jpg"
      },
      {
        judul: "Urutan skincare pagi dan malam untuk pemula",
        ringkasan: "Langkah sederhana yang mudah diikuti setiap hari.",
        isi: "Pagi: bersihkan wajah, serum, pelembap, lalu sunscreen. Malam: bersihkan wajah, serum perbaikan, pelembap. Jangan skip sunscreen — ini langkah paling penting untuk menjaga hasil perawatan.",
        gambar: "default.jpg"
      },
      {
        judul: "Tips belanja aman di toko online latihan",
        ringkasan: "Cara checkout, transfer, dan cek status pesanan di TOKOKU.",
        isi: "Pilih produk, login sebagai pembeli, isi alamat pengiriman, lalu pilih metode bayar. Untuk transfer bank, unggah bukti pembayaran. Pantau status pesanan di menu Pesanan Saya hingga selesai.",
        gambar: "default.jpg"
      }
    ];

    for (const a of artikel) await ensureArtikel(a);

    // Update artikel lama agar ringkas untuk demo (opsional)
    await q(
      `UPDATE artikel SET
         ringkasan = 'Produk skincare baru dari merek Glowvera untuk kulit lebih cerah.',
         isi = 'Glowvera merilis serum Vitamin C yang diklaim membantu kulit tampak lebih cerah dalam penggunaan rutin. Cocok untuk pemula yang ingin memulai perawatan mencerahkan dengan langkah sederhana.'
       WHERE id = 1 AND judul LIKE '%Glowvera%'`
    );

    const c = await q(
      `SELECT
         (SELECT COUNT(*) FROM produk WHERE aktif=1) AS produk,
         (SELECT COUNT(*) FROM artikel) AS artikel,
         (SELECT COUNT(*) FROM kategori_produk) AS kategori`
    );
    console.log("Selesai demo:", c[0]);
    process.exit(0);
  } catch (e) {
    console.error("Gagal seed demo:", e.message);
    process.exit(1);
  }
})();

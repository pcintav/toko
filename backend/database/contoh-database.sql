
Enum role {
  admin
  pembeli
}

Table users {
  id int [pk, increment]
  nama_d varchar(50) [not null]
  nama_b varchar(50) [not null]
  kelamin text [not null]
  lahir text [not null]
  alamat text [not null]
  phone bigint [not null]
  email varchar(30) [not null]
  role role [not null, default: `pembeli`]
  uname varchar(30) [not null]
  passwd varchar(256) [not null]
  foto varchar(500) [not null]

  created_at datetime [not null, default: `CURRENT_TIMESTAMP`]
  updated_at datetime [not null, default: `CURRENT_TIMESTAMP`]
}

Enum kategori_produk {
  "Mango Sticky Rice"
  "Mango Pudding"
  "Mango Milkshake"
}

Table produk {
  id_produk int [pk, increment]
  nama_produk varchar(255) [not null]
  deskripsi text [not null]
  harga int [not null]
  gambar varchar(500)
  kategori kategori_produk [not null, default: `Mango Sticky Rice`]

  created_at datetime [not null, default: `CURRENT_TIMESTAMP`]
  updated_at datetime [not null, default: `CURRENT_TIMESTAMP`]
}

Enum metode_bayar {
  "Bank Transfer"
  COD
}

Enum shipping {
  "JNT Express"
  JNE
}

Enum proses {
  Tertunda
  Dikemas
  Dikirim
  Diterima
  Selesai
}

Enum status_pembayaran {
  Belum
  Dibayar
}

Table pembelian {
  id int [pk, increment]
  id_pembeli int [not null, ref: > users.id]
  id_produk int [not null, ref: > produk.id_produk]

  nama_pembeli varchar(50)
  alamat_pembeli text
  phone_pembeli bigint

  metode_pembayaran metode_bayar [not null, default: `COD`]
  pembayaran status_pembayaran [not null, default: `Belum`]
  pengiriman shipping [not null, default: `JNT Express`]
  status proses [not null, default: `Tertunda`]
  catatan text

  created_at datetime [not null, default: `CURRENT_TIMESTAMP`]
  updated_at datetime [not null, default: `CURRENT_TIMESTAMP`]
}

Table artikel {
  id int(11) [pk, increment]
  judul varchar(225) [NOT NULL]
  ringkasan text [NOT NULL]
  isi text [NOT NULL]
  gambar varchar(500) [NOT NULL]

  created_at datetime [NOT NULL, default: `CURRENT_TIMESTAMP`]
  updated_at datetime [NOT NULL, default: `CURRENT_TIMESTAMP`]
}

Table kontak {
  id int(11) [pk, increment]
  nama_lengkap varchar(50) [NOT NULL]
  email varchar(30) [NOT NULL]
  no_hp bigint(20) [NOT NULL]
  isi_pesan text [NOT NULL]

  created_at datetime [NOT NULL, default: `CURRENT_TIMESTAMP`]
  updated_at datetime [NOT NULL, default: `CURRENT_TIMESTAMP`]
}

Table info_toko {
  logo_toko varchar(500) [NOT NULL]
  nama_toko varchar(50) [NOT NULL]
  tentang text [NOT NULL]
  foto_banner varchar(500) [NOT NULL]
  alamat_toko text [NOT NULL]
  email_toko varchar(30) [NOT NULL]
  tlp_toko bigint(20) [NOT NULL]
  nama_bank_a varchar(30) [NOT NULL]
  nama_bank_b varchar(30) [NOT NULL]
  no_rek_a bigint(20) [NOT NULL]
  no_rek_b bigint(20) [NOT NULL]
  jam_buka int(5) [NOT NULL]
  jam_tutup int(5) [NOT NULL]
  logo_wa varchar(500) [NOT NULL] 
  logo_ig varchar(500) [NOT NULL] 
  logo_fb varchar(500) [NOT NULL] 
  link_wa text [NOT NULL]
  link_ig text [NOT NULL]
  link_fb text [NOT NULL]

  created_at datetime [NOT NULL, default: `CURRENT_TIMESTAMP`]
  updated_at datetime [NOT NULL, default: `CURRENT_TIMESTAMP`]

}

Ref: "pembelian"."id" < "pembelian"."pembayaran"
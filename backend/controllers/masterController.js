/**
 * masterController.js — CRUD tabel master: kategori_produk, pengiriman, bank.
 * List publik (GET) juga dipakai dropdown frontend; mutasi hanya admin.
 */

const kategoriModel = require("../models/kategoriModel");
const pengirimanModel = require("../models/pengirimanModel");
const bankModel = require("../models/bankModel");

function parseIdPositive(param) {
  const n = parseInt(String(param), 10);
  if (Number.isNaN(n) || n < 1) return null;
  return n;
}

function duplicateError(error, res) {
  if (error.code === "ER_DUP_ENTRY" || error.errno === 1062) {
    return res.status(400).json({ message: "Nama sudah ada di daftar" });
  }
  return null;
}

// =============================================================================
// Kategori produk
// =============================================================================

exports.listKategori = async (req, res) => {
  try {
    const data = await kategoriModel.findAll();
    res.status(200).json({ message: "Daftar kategori", data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.createKategori = async (req, res) => {
  try {
    const nama = String(req.body.nama || "").trim();
    if (!nama) return res.status(400).json({ message: "nama wajib diisi" });
    if (nama.length > 100) return res.status(400).json({ message: "nama maksimal 100 karakter" });

    const result = await kategoriModel.insert(nama);
    const row = await kategoriModel.findById(result.insertId);
    res.status(201).json({ message: "Kategori ditambah", data: row });
  } catch (error) {
    if (duplicateError(error, res)) return;
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateKategori = async (req, res) => {
  try {
    const id = parseIdPositive(req.params.id);
    if (!id) return res.status(400).json({ message: "ID tidak valid" });

    const existing = await kategoriModel.findById(id);
    if (!existing) return res.status(404).json({ message: "Kategori tidak ditemukan" });

    const nama = String(req.body.nama || "").trim();
    if (!nama) return res.status(400).json({ message: "nama wajib diisi" });

    await kategoriModel.update(id, nama);

    // Sinkron nama di produk jika kategori diganti (produk.kategori = string nama)
    if (existing.nama !== nama) {
      const db = require("../config/db");
      await new Promise((resolve, reject) => {
        db.query(
          "UPDATE produk SET kategori = ? WHERE kategori = ?",
          [nama, existing.nama],
          (err) => (err ? reject(err) : resolve())
        );
      });
    }

    const row = await kategoriModel.findById(id);
    res.status(200).json({ message: "Kategori diubah", data: row });
  } catch (error) {
    if (duplicateError(error, res)) return;
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteKategori = async (req, res) => {
  try {
    const id = parseIdPositive(req.params.id);
    if (!id) return res.status(400).json({ message: "ID tidak valid" });

    const existing = await kategoriModel.findById(id);
    if (!existing) return res.status(404).json({ message: "Kategori tidak ditemukan" });

    const used = await kategoriModel.countProdukByNama(existing.nama);
    if (used > 0) {
      return res.status(409).json({
        message: `Kategori masih dipakai ${used} produk. Ubah kategori produk dulu.`
      });
    }

    await kategoriModel.remove(id);
    res.status(200).json({ message: "Kategori dihapus" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// =============================================================================
// Pengiriman (kurir)
// =============================================================================

exports.listPengiriman = async (req, res) => {
  try {
    const data = await pengirimanModel.findAll();
    res.status(200).json({ message: "Daftar pengiriman", data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.createPengiriman = async (req, res) => {
  try {
    const nama = String(req.body.nama || "").trim();
    if (!nama) return res.status(400).json({ message: "nama wajib diisi" });
    if (nama.length > 100) return res.status(400).json({ message: "nama maksimal 100 karakter" });

    const result = await pengirimanModel.insert(nama);
    const row = await pengirimanModel.findById(result.insertId);
    res.status(201).json({ message: "Pengiriman ditambah", data: row });
  } catch (error) {
    if (duplicateError(error, res)) return;
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updatePengiriman = async (req, res) => {
  try {
    const id = parseIdPositive(req.params.id);
    if (!id) return res.status(400).json({ message: "ID tidak valid" });

    const existing = await pengirimanModel.findById(id);
    if (!existing) return res.status(404).json({ message: "Pengiriman tidak ditemukan" });

    const nama = String(req.body.nama || "").trim();
    if (!nama) return res.status(400).json({ message: "nama wajib diisi" });

    await pengirimanModel.update(id, nama);

    if (existing.nama !== nama) {
      const db = require("../config/db");
      await new Promise((resolve, reject) => {
        db.query(
          "UPDATE pembelian SET pengiriman = ? WHERE pengiriman = ?",
          [nama, existing.nama],
          (err) => (err ? reject(err) : resolve())
        );
      });
    }

    const row = await pengirimanModel.findById(id);
    res.status(200).json({ message: "Pengiriman diubah", data: row });
  } catch (error) {
    if (duplicateError(error, res)) return;
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deletePengiriman = async (req, res) => {
  try {
    const id = parseIdPositive(req.params.id);
    if (!id) return res.status(400).json({ message: "ID tidak valid" });

    const existing = await pengirimanModel.findById(id);
    if (!existing) return res.status(404).json({ message: "Pengiriman tidak ditemukan" });

    const used = await pengirimanModel.countPembelianByNama(existing.nama);
    if (used > 0) {
      return res.status(409).json({
        message: `Pengiriman masih dipakai ${used} pesanan. Tidak bisa dihapus.`
      });
    }

    await pengirimanModel.remove(id);
    res.status(200).json({ message: "Pengiriman dihapus" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// =============================================================================
// Bank (rekening transfer)
// =============================================================================

exports.listBank = async (req, res) => {
  try {
    const data = await bankModel.findAll();
    res.status(200).json({ message: "Daftar bank", data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

function parseBankBody(body) {
  const nama_bank = String(body.nama_bank || "").trim();
  const no_rek = String(body.no_rek || "").trim();
  const atas_nama = String(body.atas_nama || "").trim();
  if (!nama_bank || !no_rek || !atas_nama) {
    return { error: "nama_bank, no_rek, dan atas_nama wajib diisi" };
  }
  if (nama_bank.length > 50) return { error: "nama_bank maksimal 50 karakter" };
  if (no_rek.length > 50) return { error: "no_rek maksimal 50 karakter" };
  if (atas_nama.length > 100) return { error: "atas_nama maksimal 100 karakter" };
  return { nama_bank, no_rek, atas_nama };
}

exports.createBank = async (req, res) => {
  try {
    const parsed = parseBankBody(req.body);
    if (parsed.error) return res.status(400).json({ message: parsed.error });

    const result = await bankModel.insert(parsed);
    const row = await bankModel.findById(result.insertId);
    res.status(201).json({ message: "Bank ditambah", data: row });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateBank = async (req, res) => {
  try {
    const id = parseIdPositive(req.params.id);
    if (!id) return res.status(400).json({ message: "ID tidak valid" });

    const existing = await bankModel.findById(id);
    if (!existing) return res.status(404).json({ message: "Bank tidak ditemukan" });

    const parsed = parseBankBody(req.body);
    if (parsed.error) return res.status(400).json({ message: parsed.error });

    await bankModel.update(id, parsed);
    const row = await bankModel.findById(id);
    res.status(200).json({ message: "Bank diubah", data: row });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteBank = async (req, res) => {
  try {
    const id = parseIdPositive(req.params.id);
    if (!id) return res.status(400).json({ message: "ID tidak valid" });

    const result = await bankModel.remove(id);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Bank tidak ditemukan" });
    }
    res.status(200).json({ message: "Bank dihapus" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

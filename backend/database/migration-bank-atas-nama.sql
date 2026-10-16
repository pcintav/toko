-- Migrasi: kolom atas_nama pada tabel bank (a.n. pemilik rekening)
ALTER TABLE bank
  ADD COLUMN atas_nama VARCHAR(100) NULL AFTER no_rek;

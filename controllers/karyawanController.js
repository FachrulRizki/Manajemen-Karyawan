const { query } = require('../config/db');

// GET /api/karyawan — Ambil semua data karyawan
async function getAll(req, res) {
  try {
    const [rows] = await query('SELECT * FROM KARYAWAN');
    return res.status(200).json(rows);
  } catch (err) {
    console.error('getAll error:', err);
    return res.status(500).json({ error: 'Terjadi kesalahan internal server' });
  }
}

// GET /api/karyawan/:id — Ambil karyawan berdasarkan ID
async function getById(req, res) {
  try {
    const { id } = req.params;
    const [rows] = await query('SELECT * FROM KARYAWAN WHERE Id = ?', [id]);

    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: `Karyawan dengan Id ${id} tidak ditemukan` });
    }

    return res.status(200).json(rows[0]);
  } catch (err) {
    console.error('getById error:', err);
    return res.status(500).json({ error: 'Terjadi kesalahan internal server' });
  }
}

// Validasi input karyawan (Nama, Tgl_Lahir, Gaji)
function validateInput({ Nama, Tgl_Lahir, Gaji }) {
  if (!Nama || typeof Nama !== 'string' || Nama.trim() === '') {
    return "Field 'Nama' wajib diisi dan tidak boleh kosong";
  }
  if (!Tgl_Lahir || !/^\d{4}-\d{2}-\d{2}$/.test(Tgl_Lahir)) {
    return "Field 'Tgl_Lahir' wajib diisi dalam format YYYY-MM-DD";
  }
  const gajiNum = Number(Gaji);
  if (Gaji === undefined || Gaji === null || Gaji === '' || isNaN(gajiNum) || gajiNum <= 0) {
    return "Field 'Gaji' wajib diisi dan harus berupa angka positif";
  }
  return null;
}

// POST /api/karyawan — Tambah karyawan baru
async function create(req, res) {
  try {
    const { Nama, Tgl_Lahir, Gaji } = req.body || {};

    const validationError = validateInput({ Nama, Tgl_Lahir, Gaji });
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const [result] = await query(
      'INSERT INTO KARYAWAN (Nama, Tgl_Lahir, Gaji) VALUES (?, ?, ?)',
      [Nama.trim(), Tgl_Lahir, Number(Gaji)]
    );

    const [newRows] = await query('SELECT * FROM KARYAWAN WHERE Id = ?', [result.insertId]);
    return res.status(201).json(newRows[0]);
  } catch (err) {
    console.error('create error:', err);
    return res.status(500).json({ error: 'Terjadi kesalahan internal server' });
  }
}

// PUT /api/karyawan/:id — Update karyawan berdasarkan ID
async function update(req, res) {
  try {
    const { id } = req.params;
    const { Nama, Tgl_Lahir, Gaji } = req.body || {};

    const validationError = validateInput({ Nama, Tgl_Lahir, Gaji });
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const [existing] = await query('SELECT Id FROM KARYAWAN WHERE Id = ?', [id]);
    if (!existing || existing.length === 0) {
      return res.status(404).json({ error: `Karyawan dengan Id ${id} tidak ditemukan` });
    }

    await query(
      'UPDATE KARYAWAN SET Nama = ?, Tgl_Lahir = ?, Gaji = ? WHERE Id = ?',
      [Nama.trim(), Tgl_Lahir, Number(Gaji), id]
    );

    const [updatedRows] = await query('SELECT * FROM KARYAWAN WHERE Id = ?', [id]);
    return res.status(200).json(updatedRows[0]);
  } catch (err) {
    console.error('update error:', err);
    return res.status(500).json({ error: 'Terjadi kesalahan internal server' });
  }
}

// DELETE /api/karyawan/:id — Hapus karyawan berdasarkan ID
async function remove(req, res) {
  try {
    const { id } = req.params;

    const [existing] = await query('SELECT Id FROM KARYAWAN WHERE Id = ?', [id]);
    if (!existing || existing.length === 0) {
      return res.status(404).json({ error: `Karyawan dengan Id ${id} tidak ditemukan` });
    }

    await query('DELETE FROM KARYAWAN WHERE Id = ?', [id]);
    return res.status(200).json({ message: 'Karyawan berhasil dihapus' });
  } catch (err) {
    console.error('remove error:', err);
    return res.status(500).json({ error: 'Terjadi kesalahan internal server' });
  }
}

module.exports = { getAll, getById, create, update, remove };

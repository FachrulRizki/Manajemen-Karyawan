const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { query } = require('../config/db');

/**
 * Login admin dengan email dan password.
 * Memvalidasi kredensial, membandingkan hash bcrypt, dan menerbitkan JWT.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function login(req, res) {
  try {
    const { email, password } = req.body || {};

    // Validasi body tidak lengkap
    if (!email || !password) {
      return res.status(400).json({ error: 'Email dan password wajib diisi' });
    }

    // Query user berdasarkan email menggunakan parameterized query
    const [rows] = await query('SELECT password_hash FROM USERS WHERE email = ?', [email]);

    // Jika user tidak ditemukan → kembalikan pesan generik
    if (!rows || rows.length === 0) {
      return res.status(401).json({ error: 'Kredensial tidak valid' });
    }

    const user = rows[0];

    // Bandingkan password dengan hash bcrypt
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ error: 'Kredensial tidak valid' });
    }

    // Terbitkan JWT dengan masa berlaku dari env
    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES || '1m' });

    return res.status(200).json({ token });
  } catch (err) {
    console.error('Auth controller error:', err);
    return res.status(500).json({ error: 'Terjadi kesalahan internal server' });
  }
}

module.exports = { login };

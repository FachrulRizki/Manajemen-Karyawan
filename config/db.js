require('dotenv').config();
const mysql = require('mysql2/promise');

let pool;

try {
  pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });
} catch (err) {
  console.error('Gagal membuat koneksi pool ke database:', err);
  throw err;
}

/**
 * Eksekusi query SQL menggunakan connection pool.
 * @param {string} sql - Query SQL dengan placeholder `?`
 * @param {Array} params - Parameter untuk prepared statement
 * @returns {Promise<Array>} Array baris hasil query
 */
async function query(sql, params = []) {
  try {
    const [rows] = await pool.execute(sql, params);
    return [rows];
  } catch (err) {
    console.error('Database query error:', err);
    throw err;
  }
}

/**
 * Ambil koneksi dari pool untuk keperluan transaksi.
 * @returns {Promise<mysql.PoolConnection>} Koneksi database
 */
async function getConnection() {
  try {
    return await pool.getConnection();
  } catch (err) {
    console.error('Gagal mendapatkan koneksi dari pool:', err);
    throw err;
  }
}

module.exports = { query, getConnection };

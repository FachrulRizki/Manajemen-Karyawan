const { query } = require('../config/db');
const { generateKaryawanPdf } = require('../services/pdfService');


// GET /api/karyawan/report/pdf — Generate dan download laporan PDF karyawan

async function generatePdf(req, res) {
  try {
    const [rows] = await query('SELECT * FROM KARYAWAN');

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="laporan-karyawan.pdf"');

    generateKaryawanPdf(rows, res);
  } catch (err) {
    console.error('generatePdf error:', err);
    if (!res.headersSent) {
      return res.status(500).json({ error: 'Gagal membuat laporan PDF' });
    }
  }
}

module.exports = { generatePdf };

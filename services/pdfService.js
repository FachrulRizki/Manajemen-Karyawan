const PDFDocument = require('pdfkit');

/**
 * Generate laporan PDF karyawan dan pipe ke response stream.
 * @param {Array} rows - Array data karyawan dari database
 * @param {import('express').Response} res - Express response stream
 */
function generateKaryawanPdf(rows, res) {
  const doc = new PDFDocument({ margin: 40 });

  doc.pipe(res);

  // Judul laporan
  doc.fontSize(18).font('Helvetica-Bold').text('Laporan Data Karyawan', { align: 'center' });
  doc.moveDown(0.5);

  // Tanggal dan waktu pembuatan
  const now = new Date();
  const dateStr = now.toLocaleDateString('id-ID', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
  const timeStr = now.toLocaleTimeString('id-ID');
  doc.fontSize(10).font('Helvetica').text(
    `Tanggal: ${dateStr}  |  Waktu: ${timeStr}`,
    { align: 'center' }
  );
  doc.moveDown(0.5);

  // Total jumlah karyawan
  doc.fontSize(10).text(`Total Karyawan: ${rows.length}`, { align: 'center' });
  doc.moveDown(1);

  if (rows.length === 0) {
    doc.fontSize(12).text('Tidak ada data karyawan yang tersedia.', { align: 'center' });
  } else {
    const tableTop = doc.y;
    const colWidths = { id: 50, nama: 180, tglLahir: 110, gaji: 120 };
    const startX = doc.page.margins.left;
    const totalWidth = colWidths.id + colWidths.nama + colWidths.tglLahir + colWidths.gaji;

    // Header tabel
    doc.fontSize(10).font('Helvetica-Bold');
    doc.rect(startX, tableTop, totalWidth, 20).fill('#CCCCCC').stroke();
    doc.fillColor('black');

    let x = startX;
    doc.text('Id',        x + 4, tableTop + 5, { width: colWidths.id - 8 });       x += colWidths.id;
    doc.text('Nama',      x + 4, tableTop + 5, { width: colWidths.nama - 8 });     x += colWidths.nama;
    doc.text('Tgl_Lahir', x + 4, tableTop + 5, { width: colWidths.tglLahir - 8 }); x += colWidths.tglLahir;
    doc.text('Gaji',      x + 4, tableTop + 5, { width: colWidths.gaji - 8 });

    doc.moveDown(0.5);

    // Baris data
    doc.font('Helvetica').fontSize(9);
    rows.forEach((karyawan, index) => {
      const rowY = doc.y;

      if (index % 2 === 0) {
        doc.rect(startX, rowY, totalWidth, 18).fill('#F5F5F5').stroke();
        doc.fillColor('black');
      }

      x = startX;
      doc.text(String(karyawan.Id), x + 4, rowY + 4, { width: colWidths.id - 8 });
      x += colWidths.id;
      doc.text(String(karyawan.Nama), x + 4, rowY + 4, { width: colWidths.nama - 8 });
      x += colWidths.nama;

      const tglLahir = karyawan.Tgl_Lahir instanceof Date
        ? karyawan.Tgl_Lahir.toISOString().split('T')[0]
        : String(karyawan.Tgl_Lahir);
      doc.text(tglLahir, x + 4, rowY + 4, { width: colWidths.tglLahir - 8 });
      x += colWidths.tglLahir;

      const gajiFormatted = Number(karyawan.Gaji).toLocaleString('id-ID');
      doc.text(`Rp ${gajiFormatted}`, x + 4, rowY + 4, { width: colWidths.gaji - 8 });

      doc.moveDown(0.5);
    });
  }

  doc.end();
}

module.exports = { generateKaryawanPdf };

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes    = require('./routes/authRoutes');
const karyawanRoutes = require('./routes/karyawanRoutes');
const reportRoutes  = require('./routes/reportRoutes');

const app = express();

//  Middleware global 

app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

// Sajikan file statis dari folder public/
app.use(express.static(path.join(__dirname, 'public')));

//  API Routes 

app.use('/api/auth',     authRoutes);
app.use('/api/karyawan', karyawanRoutes);
app.use('/api/report',   reportRoutes);

//  Global Handlers 

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint tidak ditemukan' });
});

// Error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Terjadi kesalahan internal server' });
});

//  Start Server ─

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});

module.exports = app;

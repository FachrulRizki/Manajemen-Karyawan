Aplikasi manajemen data karyawan berbasis web dengan Node.js/Express, MySQL, dan JWT authentication.

## Struktur Proyek

```
HR-PROJECT/
├── config/
│   └── db.js                 # Konfigurasi koneksi MySQL (connection pool)
├── controllers/
│   ├── authController.js     # Login & penerbitan JWT
│   ├── karyawanController.js # CRUD data karyawan
│   └── reportController.js   # Generate laporan PDF
├── middleware/
│   └── auth.js               # Verifikasi JWT pada protected routes
├── routes/
│   ├── authRoutes.js         # POST /api/auth/login
│   ├── karyawanRoutes.js     # GET/POST/PUT/DELETE /api/karyawan
│   └── reportRoutes.js       # GET /api/report/pdf
├── services/
│   └── pdfService.js         # Logic pembuatan dokumen PDF (PDFKit)
├── public/
│   ├── login.html            # Halaman login
│   ├── dashboard.html        # Halaman daftar & manajemen karyawan
│   ├── app.js                # Auth + CRUD + PDF export (frontend JS)
│   └── style.css             # Styling seluruh halaman
├── .env                      # Variabel environment (tidak di-commit)
├── package.json
├── server.js                 # Entry point Express
└── README.md
```

## Prasyarat

- Node.js >= 18
- MySQL / MariaDB

## Instalasi

```bash
cd HR-PROJECT
npm install
```

## Konfigurasi

Edit file `.env` sesuai environment Anda:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=HR
JWT_SECRET=ganti_dengan_secret_yang_kuat
PORT=3000
```

**Kredensial admin default:**
- Email: `admin@gmail.com`
- Password: `pass123`

## Menjalankan Server

```bash
npm start
```

## Catatan

- JWT berlaku selama **1 menit** — frontend akan redirect ke login otomatis saat token expired.
- Password disimpan sebagai bcrypt hash (cost factor 10).
- Setiap operasi INSERT/UPDATE/DELETE pada tabel KARYAWAN otomatis dicatat di tabel TLOG melalui database trigger.

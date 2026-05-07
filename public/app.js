// auth
function getToken() {
  return localStorage.getItem('token');
}

// cek user soal token
function isAuthenticated() {
  const token = getToken();
  if (!token) return false;

  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;

    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    const now = Math.floor(Date.now() / 1000);
    return payload.exp && payload.exp > now;
  } catch {
    return false;
  }
}

// proses login
async function login(email, password) {
  const errorEl = document.getElementById('error-message');
  if (errorEl) { errorEl.hidden = true; errorEl.textContent = ''; }

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok && data.token) {
      localStorage.setItem('token', data.token);
      window.location.href = 'dashboard.html';
    } else {
      const msg = data.error || 'Login gagal. Periksa email dan password Anda.';
      if (errorEl) { errorEl.textContent = msg; errorEl.hidden = false; }
    }
  } catch {
    const msg = 'Tidak dapat terhubung ke server. Coba lagi nanti.';
    if (errorEl) { errorEl.textContent = msg; errorEl.hidden = false; }
  }
}

// ketika logout hapus token direct ke login.html
function logout() {
  localStorage.removeItem('token');
  window.location.href = 'login.html';
}

// fetch
async function authFetch(url, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    logout();
    return response;
  }

  return response;
}

// Constants

const API_KARYAWAN = '/api/karyawan';
const API_REPORT_PDF = '/api/report/pdf';

// State

let isEditMode = false;

// UI Helpers 

function showTableError(msg) {
  const el = document.getElementById('table-error');
  if (!el) return;
  el.textContent = msg;
  el.hidden = !msg;
}

function showFormError(msg) {
  const el = document.getElementById('form-error');
  if (!el) return;
  el.textContent = msg;
  el.hidden = !msg;
}

function showFormSuccess(msg) {
  const el = document.getElementById('form-success');
  if (!el) return;
  el.textContent = msg;
  el.hidden = !msg;
  if (msg) setTimeout(() => { el.hidden = true; }, 3000);
}

function clearFormMessages() {
  showFormError('');
  showFormSuccess('');
}

// Load & Render 

async function loadEmployees() {
  showTableError('');
  const tbody = document.getElementById('employee-tbody');
  if (tbody) tbody.innerHTML = '<tr><td colspan="5" class="loading-row">Memuat data...</td></tr>';

  try {
    const response = await authFetch(API_KARYAWAN);
    const data = await response.json();

    if (!response.ok) {
      showTableError(data.error || 'Gagal memuat data karyawan.');
      if (tbody) tbody.innerHTML = '<tr><td colspan="5" class="empty-row">Gagal memuat data.</td></tr>';
      return;
    }

    renderTable(data);
  } catch {
    showTableError('Tidak dapat terhubung ke server.');
    if (tbody) tbody.innerHTML = '<tr><td colspan="5" class="empty-row">Tidak dapat terhubung ke server.</td></tr>';
  }
}

function renderTable(employees) {
  const tbody = document.getElementById('employee-tbody');
  if (!tbody) return;

  if (!employees || employees.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="empty-row">Belum ada data karyawan.</td></tr>';
    return;
  }

  tbody.innerHTML = employees.map(emp => `
    <tr>
      <td>${escapeHtml(String(emp.Id))}</td>
      <td>${escapeHtml(emp.Nama)}</td>
      <td>${escapeHtml(formatDate(emp.Tgl_Lahir))}</td>
      <td>${escapeHtml(formatGaji(emp.Gaji))}</td>
      <td class="action-cell">
        <button
          class="btn btn-edit btn-sm"
          data-id="${emp.Id}"
          data-nama="${escapeHtml(emp.Nama)}"
          data-tgl="${escapeHtml(formatDate(emp.Tgl_Lahir))}"
          data-gaji="${emp.Gaji}"
          aria-label="Edit karyawan ${escapeHtml(emp.Nama)}"
        >Edit</button>
        <button
          class="btn btn-delete btn-sm"
          data-id="${emp.Id}"
          data-nama="${escapeHtml(emp.Nama)}"
          aria-label="Hapus karyawan ${escapeHtml(emp.Nama)}"
        >Hapus</button>
      </td>
    </tr>
  `).join('');
}

function formatDate(val) {
  if (!val) return '';
  if (val instanceof Date) return val.toISOString().split('T')[0];
  return String(val).split('T')[0];
}

function formatGaji(val) {
  return 'Rp ' + Number(val).toLocaleString('id-ID');
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// CRUD

async function createEmployee(data) {
  clearFormMessages();
  try {
    const response = await authFetch(API_KARYAWAN, { method: 'POST', body: JSON.stringify(data) });
    const result = await response.json();
    if (!response.ok) { showFormError(result.error || 'Gagal menambah karyawan.'); return false; }
    showFormSuccess('Karyawan berhasil ditambahkan.');
    await loadEmployees();
    return true;
  } catch {
    showFormError('Tidak dapat terhubung ke server.');
    return false;
  }
}

async function updateEmployee(id, data) {
  clearFormMessages();
  try {
    const response = await authFetch(`${API_KARYAWAN}/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    const result = await response.json();
    if (!response.ok) { showFormError(result.error || 'Gagal memperbarui karyawan.'); return false; }
    showFormSuccess('Karyawan berhasil diperbarui.');
    await loadEmployees();
    return true;
  } catch {
    showFormError('Tidak dapat terhubung ke server.');
    return false;
  }
}

async function deleteEmployee(id, nama) {
  if (!confirm(`Apakah Anda yakin ingin menghapus karyawan "${nama}"?`)) return;
  showTableError('');
  try {
    const response = await authFetch(`${API_KARYAWAN}/${id}`, { method: 'DELETE' });
    const result = await response.json();
    if (!response.ok) { showTableError(result.error || 'Gagal menghapus karyawan.'); return; }
    await loadEmployees();
  } catch {
    showTableError('Tidak dapat terhubung ke server.');
  }
}

// Edit Mode

function startEdit(id, nama, tglLahir, gaji) {
  isEditMode = true;
  document.getElementById('edit-id').value = id;
  document.getElementById('input-nama').value = nama;
  document.getElementById('input-tgl-lahir').value = tglLahir;
  document.getElementById('input-gaji').value = gaji;

  const formTitle = document.getElementById('form-title');
  if (formTitle) formTitle.textContent = 'Edit Karyawan';
  const btnSubmit = document.getElementById('btn-submit');
  if (btnSubmit) btnSubmit.textContent = 'Simpan Perubahan';
  const btnCancel = document.getElementById('btn-cancel');
  if (btnCancel) btnCancel.hidden = false;

  clearFormMessages();
  document.getElementById('employee-form').scrollIntoView({ behavior: 'smooth' });
}

function cancelEdit() {
  isEditMode = false;
  resetForm();
}

function resetForm() {
  document.getElementById('employee-form').reset();
  document.getElementById('edit-id').value = '';

  const formTitle = document.getElementById('form-title');
  if (formTitle) formTitle.textContent = 'Tambah Karyawan';
  const btnSubmit = document.getElementById('btn-submit');
  if (btnSubmit) btnSubmit.textContent = 'Tambah Karyawan';
  const btnCancel = document.getElementById('btn-cancel');
  if (btnCancel) btnCancel.hidden = true;

  isEditMode = false;
  clearFormMessages();
}

// Form Submit 

document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('employee-form');
  if (form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      clearFormMessages();

      const nama     = document.getElementById('input-nama').value.trim();
      const tglLahir = document.getElementById('input-tgl-lahir').value;
      const gaji     = Number(document.getElementById('input-gaji').value);
      const editId   = document.getElementById('edit-id').value;
      const data     = { Nama: nama, Tgl_Lahir: tglLahir, Gaji: gaji };

      const success = isEditMode && editId
        ? await updateEmployee(Number(editId), data)
        : await createEmployee(data);

      if (success) resetForm();
    });
  }

  // Event delegation untuk tombol Edit dan Hapus di tabel
  const tbody = document.getElementById('employee-tbody');
  if (tbody) {
    tbody.addEventListener('click', function (e) {
      const btn = e.target.closest('button');
      if (!btn) return;

      const id   = Number(btn.dataset.id);
      const nama = btn.dataset.nama;

      if (btn.classList.contains('btn-edit')) {
        const tgl  = btn.dataset.tgl;
        const gaji = Number(btn.dataset.gaji);
        startEdit(id, nama, tgl, gaji);
      } else if (btn.classList.contains('btn-delete')) {
        deleteEmployee(id, nama);
      }
    });
  }
});

// PDF Export 

async function exportPdf() {
  try {
    const response = await authFetch(API_REPORT_PDF);

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      showTableError(data.error || 'Gagal mengunduh laporan PDF.');
      return;
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'laporan-karyawan.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch {
    showTableError('Tidak dapat terhubung ke server untuk mengunduh PDF.');
  }
}

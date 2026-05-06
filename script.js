// script.js - Sistem Rujukan Klinik Sederhana
class RujukanKlinik {
    constructor() {
        this.klinikSaya = localStorage.getItem('klinikSaya') || 'Klinik Utama';
        this.users = {
            'admin@klinik.com': 'admin123',
            'dokter1@klinik.com': '123456',
            'dokter2@klinik.com': '123456'
        };
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadData();
        this.updateUI();
    }

    bindEvents() {
        // Login
        document.getElementById('formLogin').addEventListener('submit', (e) => {
            e.preventDefault();
            this.login();
        });

        // Buat Rujukan
        document.getElementById('formRujukan').addEventListener('submit', (e) => {
            e.preventDefault();
            this.buatRujukan();
        });

        // Logout
        document.getElementById('btnLogout')?.addEventListener('click', () => this.logout());

        // FAB
        document.getElementById('fabBuatRujukan').addEventListener('click', () => {
            document.getElementById('formRujukan').reset();
        });
    }

    login() {
        const user = document.getElementById('loginUser').value;
        const pass = document.getElementById('loginPass').value;

        if (this.users[user] && this.users[user] === pass) {
            localStorage.setItem('loggedIn', 'true');
            localStorage.setItem('currentUser', user);
            bootstrap.Modal.getInstance(document.getElementById('modalLogin')).hide();
            this.showAlert('Login berhasil! 👋', 'success');
            this.loadData();
            this.updateUI();
        } else {
            this.showAlert('Username atau password salah! ❌', 'danger');
        }
    }

    logout() {
        localStorage.removeItem('loggedIn');
        localStorage.removeItem('currentUser');
        this.updateUI();
        this.showAlert('Logout berhasil!', 'info');
    }

    // Update di fungsi updateUI()
updateUI() {
    const isLoggedIn = localStorage.getItem('loggedIn') === 'true';
    
    // ... kode existing ...
    
    document.getElementById('exportSection').style.display = isLoggedIn ? 'block' : 'none';
    
    if (isLoggedIn) {
        // ... kode existing ...
        this.updateExportStats(JSON.parse(localStorage.getItem('rujukan') || '[]'));
    }
}

// Update di fungsi loadData()
loadData() {
    const rujukan = JSON.parse(localStorage.getItem('rujukan') || '[]');
    this.renderRujukan(rujukan);
    this.updateStats(rujukan);
    this.updateExportStats(rujukan); // TAMBAHKAN INI
}

    buatRujukan() {
        const rujukanBaru = {
            id: Date.now(),
            noRujukan: 'RUJ-' + Date.now().toString().slice(-6),
            rmPasien: document.getElementById('rmPasien').value,
            namaPasien: document.getElementById('namaPasien').value,
            klinikAsal: this.klinikSaya,
            klinikTujuan: document.getElementById('klinikTujuan').value,
            dokterPenerima: document.getElementById('dokterPenerima').value,
            diagnosis: document.getElementById('diagnosis').value,
            terapi: document.getElementById('terapi').value,
            alasanRujukan: document.getElementById('alasanRujukan').value,
            status: 'dikirim',
            tanggal: new Date().toLocaleString('id-ID'),
            dokterPengirim: localStorage.getItem('currentUser') || 'Dokter'
        };

        let rujukan = JSON.parse(localStorage.getItem('rujukan') || '[]');
        rujukan.unshift(rujukanBaru);
        localStorage.setItem('rujukan', JSON.stringify(rujukan));

        bootstrap.Modal.getInstance(document.getElementById('modalBuatRujukan')).hide();
        this.showAlert(`✅ Rujukan ${rujukanBaru.noRujukan} berhasil dikirim!`, 'success');
        this.loadData();
    }

    renderRujukan(data) {
        const container = document.getElementById('listRujukan');
        
        if (data.length === 0) {
            container.innerHTML = `
                <div class="col-12">
                    <div class="text-center py-5 text-muted">
                        <i class="fas fa-inbox fa-3x mb-3 opacity-50"></i>
                        <h5>Belum ada data rujukan</h5>
                        <p class="mb-0">Buat rujukan pertama Anda sekarang!</p>
                    </div>
                </div>
            `;
            return;
        }

        container.innerHTML = data.map(item => `
            <div class="col-md-6 col-lg-4 mb-4">
                <div class="card rujukan-item h-100" onclick="app.showDetail(${item.id})">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <h6 class="fw-bold text-primary mb-1">${item.noRujukan}</h6>
                            <span class="status-badge 
                                ${item.status === 'dikirim' ? 'bg-warning text-dark' : 
                                  item.status === 'diterima' ? 'bg-success' : 'bg-danger'}">
                                ${item.status.toUpperCase()}
                            </span>
                        </div>
                        <h6 class="fw-bold mb-2">${item.namaPasien}</h6>
                        <p class="small mb-2"><i class="fas fa-id-card me-1"></i>${item.rmPasien}</p>
                        <p class="small mb-2">
                            <i class="fas fa-hospital me-1 text-primary"></i>
                            ${item.klinikAsal} → ${item.klinikTujuan}
                        </p>
                        <p class="small mb-2 text-truncate" title="${item.alasanRujukan}">
                            <i class="fas fa-info-circle me-1"></i>${item.alasanRujukan}
                        </p>
                        <small class="text-muted">${item.tanggal}</small>
                    </div>
                </div>
            </div>
        `).join('');
    }

    updateStats(data) {
        document.getElementById('totalRujukan').textContent = data.length;
        document.getElementById('rujukanPending').textContent = data.filter(r => r.status === 'dikirim').length;
        document.getElementById('rujukanDiterima').textContent = data.filter(r => r.status === 'diterima').length;
        document.getElementById('rujukanDitolak').textContent = data.filter(r => r.status === 'ditolak').length;
    }

    showDetail(id) {
        const rujukan = JSON.parse(localStorage.getItem('rujukan') || '[]').find(r => r.id == id);
        if (!rujukan) return;

        document.getElementById('detailTitle').textContent = `Rujukan ${rujukan.noRujukan}`;
        document.getElementById('detailContent').innerHTML = `
            <div class="row">
                <div class="col-md-6">
                    <h6><i class="fas fa-user me-2"></i>Pasien</h6>
                    <p class="fw-bold mb-1">${rujukan.namaPasien}</p>
                    <p class="small mb-0"><i class="fas fa-id-card me-1"></i>${rujukan.rmPasien}</p>
                </div>
                <div class="col-md-6">
                    <h6><i class="fas fa-exchange-alt me-2"></i>Rujukan</h6>
                    <p class="small mb-1"><strong>Dari:</strong> ${rujukan.klinikAsal}</p>
                    <p class="small mb-0"><strong>Ke:</strong> ${rujukan.klinikTujuan}</p>
                </div>
            </div>
            <hr>
            <h6><i class="fas fa-stethoscope me-2"></i>Diagnosis</h6>
            <p class="mb-3">${rujukan.diagnosis || '-'}</p>
            <h6><i class="fas fa-pills me-2"></i>Terapi</h6>
            <p class="mb-3">${rujukan.terapi || '-'}</p>
            <h6><i class="fas fa-exclamation-triangle me-2"></i>Alasan Rujukan</h6>
            <p class="mb-0">${rujukan.alasanRujukan}</p>
        `;

        const actions = document.getElementById('detailActions');
        if (rujukan.status === 'dikirim') {
            actions.innerHTML = `
                <button class="btn btn-success me-2" onclick="app.ubahStatus(${id}, 'diterima')">
                    <i class="fas fa-check me-1"></i>Terima
                </button>
                <button class="btn btn-danger" onclick="app.ubahStatus(${id}, 'ditolak')">
                    <i class="fas fa-times me-1"></i>Tolak
                </button>
            `;
        } else {
            actions.innerHTML = '<button class="btn btn-secondary">Tutup</button>';
        }

        new bootstrap.Modal(document.getElementById('modalDetail')).show();
    }

    ubahStatus(id, status) {
        if (!confirm(`Konfirmasi ${status === 'diterima' ? 'MENERIMA' : 'MENOLAK'} rujukan ini?`)) return;

        let rujukan = JSON.parse(localStorage.getItem('rujukan') || '[]');
        const index = rujukan.findIndex(r => r.id == id);
        if (index > -1) {
            rujukan[index].status = status;
            localStorage.setItem('rujukan', JSON.stringify(rujukan));
            this.loadData();
            bootstrap.Modal.getInstance(document.getElementById('modalDetail')).hide();
            this.showAlert(`Rujukan ${status === 'diterima' ? 'DITERIMA' : 'DITOLAK'}! ✅`, 'success');
        }
    }

    showAlert(message, type = 'info') {
        const alert = document.createElement('div');
        alert.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        alert.style.cssText = 'top: 100px; right: 20px; z-index: 9999; min-width: 300px;';
        alert.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        document.body.appendChild(alert);
        setTimeout(() => alert.remove(), 4000);
    }
}

// Tambahkan library SheetJS CDN di <head> index.html
// <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"></script>

// Fungsi Export Excel
exportExcel(filter = 'semua') {
    const rujukan = JSON.parse(localStorage.getItem('rujukan') || '[]');
    let dataExport = [];

    // Filter data berdasarkan pilihan
    switch(filter) {
        case 'bulan':
            const bulanIni = new Date().getMonth();
            dataExport = rujukan.filter(r => new Date(r.tanggal).getMonth() === bulanIni);
            break;
        case 'minggu':
            const mingguLalu = new Date();
            mingguLalu.setDate(mingguLalu.getDate() - 7);
            dataExport = rujukan.filter(r => new Date(r.tanggal) >= mingguLalu);
            break;
        case 'json':
            this.exportJSON(rujukan);
            return;
        default:
            dataExport = rujukan;
    }

    if (dataExport.length === 0) {
        this.showAlert('❌ Tidak ada data untuk diekspor!', 'warning');
        return;
    }

    // Format data untuk Excel
    const excelData = dataExport.map((r, index) => ({
        'No': index + 1,
        'No Rujukan': r.noRujukan,
        'RM Pasien': r.rmPasien,
        'Nama Pasien': r.namaPasien,
        'Klinik Asal': r.klinikAsal,
        'Klinik Tujuan': r.klinikTujuan,
        'Dokter Penerima': r.dokterPenerima,
        'Dokter Pengirim': r.dokterPengirim,
        'Diagnosis': r.diagnosis || '-',
        'Terapi': r.terapi || '-',
        'Alasan Rujukan': r.alasanRujukan,
        'Status': r.status.toUpperCase(),
        'Tanggal': r.tanggal
    }));

    // Buat workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Auto resize kolom
    const colWidths = [
        {wch: 6},  // No
        {wch: 12}, // No Rujukan
        {wch: 12}, // RM Pasien
        {wch: 20}, // Nama Pasien
        {wch: 18}, // Klinik Asal
        {wch: 18}, // Klinik Tujuan
        {wch: 20}, // Dokter Penerima
        {wch: 15}, // Dokter Pengirim
        {wch: 25}, // Diagnosis
        {wch: 20}, // Terapi
        {wch: 30}, // Alasan Rujukan
        {wch: 10}, // Status
        {wch: 18}  // Tanggal
    ];
    ws['!cols'] = colWidths;

    // Header styling
    const headerRange = XLSX.utils.decode_range(ws['!ref']);
    for (let C = headerRange.s.c; C <= headerRange.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({c: C, r: 0});
        if (!ws[cellAddress]) continue;
        ws[cellAddress].s = {
            font: { bold: true, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "2563EB" } },
            alignment: { horizontal: "center", vertical: "center" }
        };
    }

    // Nama file berdasarkan filter
    const namaFile = `Laporan_Rujukan_${this.klinikSaya}_${filter}_${new Date().toISOString().slice(0,10)}.xlsx`;
    
    XLSX.utils.book_append_sheet(wb, ws, "Rujukan Klinik");
    XLSX.writeFile(wb, namaFile);
    
    this.showAlert(`✅ ${dataExport.length} rujukan berhasil diekspor ke Excel! 📥`, 'success');
    this.updateExportStats(rujukan);
}

// Export JSON Backup
exportJSON(data) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_rujukan_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    this.showAlert('📦 Backup JSON berhasil diunduh!', 'info');
}

// Update statistik export
updateExportStats(data) {
    const bulanIni = new Date().getMonth();
    const mingguLalu = new Date();
    mingguLalu.setDate(mingguLalu.getDate() - 7);
    
    document.getElementById('exportSemua').textContent = data.length;
    document.getElementById('exportBulan').textContent = data.filter(r => new Date(r.tanggal).getMonth() === bulanIni).length;
    document.getElementById('exportMinggu').textContent = data.filter(r => new Date(r.tanggal) >= mingguLalu).length;
}

// Inisialisasi aplikasi
const app = new RujukanKlinik();

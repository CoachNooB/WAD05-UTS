# Ruang Baca — Dashboard Perpustakaan

UTS CIK3101 Web Application Development, **Soal A untuk NIM ganjil**. Vue 3 Composition API + FastAPI, dengan antarmuka bahasa Indonesia.

## Menjalankan

Prasyarat: Python 3.10+ dan Node.js 22.12+ (atau 20.19+). Buka dua terminal **dari folder UTS ini**.

**Terminal 1 — backend:**

```bash
python -m venv backend/.venv
source backend/.venv/bin/activate
python -m pip install -r backend/requirements.txt
python -m uvicorn backend.main:app --reload --host 127.0.0.1 --port 8001
```

Windows PowerShell: gunakan `backend\.venv\Scripts\Activate.ps1` sebagai pengganti `source`.

**Terminal 2 — frontend:**

```bash
cd frontend
npm ci
npm run dev
```

Buka **http://localhost:5174**. Dokumentasi API interaktif: **http://127.0.0.1:8001/docs**.

Port 5174 dan 8001 dipilih agar tidak berbenturan dengan proyek latihan lain pada port 5173 dan 8000.

Frontend memakai `http://127.0.0.1:8001` secara default. Untuk alamat lain, salin `frontend/.env.example` ke `frontend/.env`, ubah `VITE_API_BASE_URL`, lalu mulai ulang Vite. CORS mengizinkan origin localhost/127.0.0.1 pada port 5174 dan 4173. Origin tambahan dapat diatur melalui environment variable backend `CORS_ORIGINS` (daftar dipisahkan koma).

Untuk demo lewat ponsel di jaringan yang sama, jalankan backend dengan `--host 0.0.0.0`, arahkan `VITE_API_BASE_URL` ke `http://IP-KOMPUTER:8001`, dan atur `CORS_ORIGINS=http://IP-KOMPUTER:5174,http://localhost:5174`. Buka `http://IP-KOMPUTER:5174` di ponsel.

## Fitur dan aturan stok

- Cari **judul atau penulis**, filter kategori/status, urutkan judul **A–Z / Z–A**, dan navigasi 8 buku per halaman.
- Tambah, edit, dan hapus dengan konfirmasi; semua perubahan dikirim ke backend lalu daftar diambil ulang.
- Empat tile dihitung dengan `computed` dari seluruh koleksi: jumlah judul, jumlah judul dengan stok ≤ 3, kategori unik, dan jumlah eksemplar. Pencarian tidak mengubah cakupan statistik.
- Grafik CSS menampilkan total eksemplar per kategori. Lebar relatif terhadap kategori dengan stok terbanyak, dihitung dengan `computed`.
- Tampilan loading, error + coba lagi, hasil kosong, berhasil dimuat, dan notifikasi perubahan.
- Desktop ≥ 1024px, tablet 768–1023px, mobile < 768px; tabel menjadi kartu pada mobile.

| Status | Stok | Alasan |
| --- | --- | --- |
| Stok Habis | 0 | Tidak ada eksemplar tersedia |
| Menipis | 1–3 | Perlu penambahan sebelum stok habis |
| Tersedia | ≥ 4 | Masih cukup untuk beberapa pembaca |

Ambang menipis adalah `LOW_STOCK = 3` di `frontend/src/utils/books.js`. Tile **Total Buku** menghitung judul/record, bukan jumlah stok. **Total Eksemplar** menjumlahkan stok. Stok wajib bilangan bulat JSON, 0–1.000.000; string `"5"`, pecahan, boolean, dan angka negatif ditolak dengan HTTP 422. Teks wajib diisi dan spasi tepi dibersihkan.

## API dan penyimpanan

| Metode | Endpoint | Hasil |
| --- | --- | --- |
| GET | `/api/books` | 200, seluruh buku |
| POST | `/api/books` | 201, buku baru dengan ID otomatis |
| PUT | `/api/books/{id}` | 200, semua field buku diperbarui |
| DELETE | `/api/books/{id}` | 204, buku dihapus |

Contoh body POST/PUT:

```json
{"judul":"Catatan dari Kota Hujan","penulis":"Ayu Pramesti","kategori":"Fiksi","stok":5}
```

Data disimpan sebagai **list Python in-memory**, bukan database/localStorage. `backend/seed.json` dimuat saat aplikasi startup. Perubahan **hilang setelah backend restart**, termasuk restart otomatis `--reload` setelah perubahan kode. Gunakan satu worker; tiap proses mempunyai koleksi sendiri. ID dibuat server dan tidak digunakan ulang selama proses berjalan. Buku tidak ditemukan menghasilkan 404.

## Struktur dan alur kode

```text
backend/
  main.py                 # Pydantic, lifespan seed, CORS, endpoint REST
  seed.json               # 24 contoh buku, 6 kategori
  requirements.txt        # Dependensi aplikasi
  requirements-dev.txt    # Dependensi pengujian
  tests/test_books.py      # Kontrak API, validasi, CORS, reset seed
frontend/
  src/App.vue             # Layout utama dan penghubung event antarkomponen
  src/api.js              # fetch, timeout, parsing error HTTP
  src/composables/
    useBooks.js           # Koleksi API, loading/error, kategori, refresh
    useBookFilters.js     # Pencarian, computed berantai, urutan, pagination
  src/utils/books.js      # Ambang stok, label status, format angka
  src/components/
    AppIcon.vue           # Ikon SVG bersama
    BookStats.vue         # Empat statistik computed dari seluruh buku
    BookCollection.vue    # Daftar, status fetch, pagination
    BookToolbar.vue       # Pencarian, filter, tombol urutkan (v-model)
    BookTable.vue         # Baris buku, badge stok, event edit/hapus
    StockInsights.vue     # Grafik kategori dan ringkasan stok computed
    BookFormDialog.vue    # State form lokal, validasi, POST/PUT
    DeleteBookDialog.vue  # Konfirmasi dan DELETE
    DashboardHelpDialog.vue
    NotificationToast.vue
  src/style.css           # Grid/Flexbox, grafik CSS, 3 breakpoint
  package-lock.json       # Versi dependensi frontend
  tests/dashboard.spec.js # Pengujian integrasi browser Playwright
```

Alur: `onMounted → GET → books (ref) → filteredBooks (computed) → sortedBooks (computed) → visibleBooks (computed)`. Pengurutan memakai salinan array agar koleksi asli tidak dimutasi. `.filter()`, `.sort()`, `.map()`, dan `.reduce()` dipakai tanpa library utilitas. Form menggunakan `ref`; komunikasi memakai `fetch` dengan `async/await` dan `try/catch`. Badge menggunakan conditional class binding. Dialog native menyediakan fokus modal dan tombol Escape. Font Google bersifat opsional; fallback sans-serif tetap bekerja tanpa internet.

`App.vue` mengambil data melalui `useBooks`, lalu meneruskan koleksi dengan **props**. `BookCollection` mengelola filter lewat `useBookFilters`; `BookToolbar` memakai `v-model` untuk memperbarui filter tersebut. Tabel mengirim event `edit`/`delete`, sedangkan dialog mengirim `saved`/`deleted` setelah request berhasil. App kemudian memuat ulang koleksi dan menampilkan notifikasi. State form, error mutasi, dan status penyimpanan dimiliki masing-masing dialog. Metode `defineExpose` dipakai secara terbatas untuk membuka dialog, menampilkan notifikasi, dan mengarahkan filter dari ringkasan stok.

Referensi: [Vue computed](https://vuejs.org/guide/essentials/computed), [FastAPI CORS](https://fastapi.tiangolo.com/tutorial/cors/).

## Pengujian

Dari folder UTS:

```bash
backend/.venv/bin/python -m pip install -r backend/requirements-dev.txt
backend/.venv/bin/python -m pytest backend/tests -q
```

Build produksi frontend:

```bash
cd frontend
npm run build
npm run preview
```

Preview produksi tersedia di http://localhost:4173 dan tetap memerlukan backend.

Pengujian browser (kedua server harus berjalan pada port default di atas):

```bash
cd frontend
npx playwright install chromium
npm run test:e2e
```

Jika Chromium sudah terpasang di Linux, gunakan `CHROMIUM_PATH=/usr/bin/chromium npm run test:e2e` tanpa mengunduh browser lagi. Tes membuat lalu menghapus satu buku uji; skenario kosong/error disimulasikan di browser dan tidak menghapus koleksi asli. Tes pencarian mengacu pada contoh seed, jadi sesuaikan ekspektasinya jika judul/penulis seed diganti.

Hasil verifikasi: **22 tes backend**, **8 tes browser**, dan **build produksi** lulus. Tes browser meliputi pencarian penulis, urutan judul, filter, pagination, statistik, tambah/edit/hapus nyata, batas stok 4/3/0, pembatalan hapus, loading, error/retry, koleksi kosong, kegagalan POST, serta lebar 375/768/1024/1440px tanpa overflow horizontal halaman.

Checklist demo: cari nama penulis → balik urutan → coba pencarian tanpa hasil → tambah buku → edit stok menjadi 0 → periksa badge, statistik, grafik → hapus → coba ukuran 375px → hentikan backend dan muat ulang untuk menampilkan error → mulai backend dan klik Coba lagi.

## Sebelum dikumpulkan

1. **Personalisasi seed.** 24 judul dan penulis yang disediakan adalah contoh fiktif, dibuat sebagai data awal proyek ini. Instruksi UTS meminta seed buatan mahasiswa sendiri: tinjau/ganti dengan pilihanmu, pertahankan minimal 20 data valid dan ID unik.
2. Tambahkan nama, NIM, dan kelas milikmu pada README; jangan memakai identitas contoh.
3. Pelajari alur `ref`, rantai `computed`, validasi Pydantic, dan request REST untuk presentasi langsung di pertemuan 8.
4. Buat repository GitHub dan commit perubahan nyata secara bertahap selama personalisasi/pengembangan. Proyek ini tidak menyertakan riwayat commit buatan. Jangan commit `.venv`, `node_modules`, atau `.env`.
5. Kumpulkan link repository melalui media yang ditentukan dosen.

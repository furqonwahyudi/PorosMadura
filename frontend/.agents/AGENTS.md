# Project Development Rules: Full Stack End-to-End

Mulai sekarang, semua pengembangan di project ini wajib dilakukan secara full stack dan end-to-end. Project ini sudah memiliki backend, database, API, dan struktur aplikasi, sehingga dilarang membuat fitur prototype frontend yang tidak terhubung ke backend.

## Aturan Utama

- Jangan pernah membuat UI, halaman, card, dashboard, tombol, statistik, grafik, tabel, badge, widget, atau fitur yang belum benar-benar terhubung dengan backend.
- Setiap komponen frontend wajib menggunakan data nyata dari backend dan database sebenarnya.
- Dilarang menggunakan mock data, dummy data, fake API, placeholder, simulasi, hardcode, data random, static JSON, fake statistics, contoh XML, atau contoh response.
- Jika fitur membutuhkan data baru, backend harus dibuat atau diperluas terlebih dahulu sebelum frontend dihubungkan.

## Alur Wajib Setiap Fitur

1. Analisis struktur backend yang sudah ada.
2. Gunakan model yang sudah ada.
3. Gunakan service yang sudah ada.
4. Gunakan repository yang sudah ada.
5. Gunakan endpoint API yang sudah ada.
6. Jika endpoint belum ada, buat endpoint, controller, service, validasi, query database, dan dokumentasi endpoint.
7. Setelah backend selesai, hubungkan frontend ke backend.
8. Pastikan frontend mengambil data realtime dari backend.
9. Pastikan seluruh tombol benar-benar menjalankan proses backend.
10. Pastikan seluruh perubahan tersimpan ke database.

## Audit CMS Wajib

Saat menemukan halaman CMS yang masih berupa prototype frontend, pertahankan UI yang ada dan hubungkan ke backend. Audit harus mencari dan memperbaiki:

- Tombol yang tidak bekerja.
- Statistik palsu.
- Data dummy.
- Tabel kosong.
- Chart palsu.
- XML contoh.
- Preview palsu.
- Upload palsu.
- Download palsu.
- Export palsu.
- Import palsu.
- Search palsu.
- Filter palsu.

Semua fitur harus disinkronkan dengan database, API, service, scheduler, cache, dan storage bila relevan.

## Sitemap

Implementasi sitemap harus memastikan:

- Generator membaca seluruh artikel published.
- Generator membaca kategori, halaman, tag, dan penulis.
- XML sesuai standar sitemap.org.
- Google News Sitemap tersedia.
- Sitemap Index tersedia.
- `lastmod` berasal dari database.
- URL berasal dari database.
- File benar-benar ditulis ke storage/public.
- Route sitemap membaca file yang benar.
- Jumlah URL pada CMS sama dengan jumlah URL pada file XML.
- Tombol "Buat Ulang Sitemap" benar-benar melakukan generate ulang.

## Statistik

Seluruh statistik dashboard harus berasal dari query database. Tidak boleh ada count palsu, angka hardcode, angka random, simulasi, atau placeholder.

## Tombol

Setiap tombol harus memiliki alur nyata:

Frontend Event -> API Request -> Controller -> Service -> Repository -> Database -> Response -> Update UI

Jika salah satu tahap belum ada, tahap tersebut wajib dibuat.

## Validasi

Setiap form harus memiliki:

- Frontend validation.
- Backend validation.
- Error handling.
- Success handling.
- Logging.

## Checklist Sebelum Fitur Dianggap Selesai

- Sudah tersimpan di database.
- Sudah mengambil data dari database.
- Sudah memiliki endpoint.
- Sudah memiliki validasi.
- Sudah memiliki error handling.
- Sudah bisa CRUD bila relevan.
- Sudah bisa diuji.
- Sudah sinkron frontend-backend.
- Tidak ada mock data.
- Tidak ada hardcode.
- Tidak ada placeholder.

Jika masih ada satu poin yang belum terpenuhi, fitur belum dianggap selesai.

## Prioritas Pengembangan

Urutan prioritas pengerjaan:

Database -> Model -> Repository -> Service -> Controller -> API -> Business Logic -> Scheduler -> Storage -> Frontend -> Testing -> Optimasi

## Target Project

Target project ini adalah aplikasi enterprise production ready, bukan prototype, demo, mockup, atau proof of concept. Seluruh fitur harus berjalan end-to-end dan sinkron antara frontend, backend, database, API, storage, cache, scheduler, dan modul lainnya.

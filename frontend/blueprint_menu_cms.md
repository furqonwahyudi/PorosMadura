# ARCHITECTURE BLUEPRINT: COMPLETE NEWS PORTAL CMS ADMIN

## 1. Dashboard

### 1.1 Overview
*   **H1 Page Title:** Editorial & System Overview
*   **Komponen UI & Fungsi:**
    *   **Counter Cards (Real-time Metric Blocks):**
        *   `Total Artikel Hari Ini`: Jumlah artikel yang berhasil rilis dari pukul 00:00 hingga saat ini.
        *   `Artikel Perlu Review`: Antrean draf jurnalis yang membutuhkan persetujuan editor (berstatus `Pending Review`).
        *   `Jurnalis Online`: Jumlah akun dengan *role* jurnalis/reporter yang sedang memiliki sesi aktif di CMS.
        *   `Server Performance Status`: Indikator warna (Hijau/Kuning/Merah) berdasarkan utilisasi CPU, RAM, dan waktu respons database (ms).
    *   **Editorial Leaderboard Table:**
        *   Kolom: `Nama Jurnalis` | `Jumlah Post (Hari Ini)` | `Total Pageviews` | `Rata-rata Durasi Baca (Menit)`.
        *   Fungsi: Menampilkan performa tim redaksi secara *real-time* untuk membantu evaluasi harian produktivitas konten.
    *   **System Health & Cron Diagnostics:**
        *   Indikator status untuk fungsionalitas otomasi inti website, seperti status eksekusi *cron-job* (untuk artikel terjadwal), sisa kuota API (Google Indexing API, Open Weather API), dan status sinkronisasi *Object Storage* (AWS S3/Google Cloud Storage).

### 1.2 Analytics
*   **H1 Page Title:** Real-time Content Performance Analytics
*   **Komponen UI & Fungsi:**
    *   **Main Traffic Chart (Integrasi GA4 Realtime / Plausible Client / Umami):**
        *   Grafik garis dinamis (*interactive spline chart*) yang memantau metrik pengunjung secara berkala (interval per menit atau per jam).
        *   Metrik terpantau: `Active Real-time Visitors`, `Pageviews`, dan `Unique Visitors`.
        *   Fitur: Tombol filter rentang waktu cepat (`1 Jam Terakhir`, `24 Jam Terakhir`, `7 Hari Terakhir`).
    *   **Top Performing Articles List:**
        *   Tabel dinamis berisi 10 artikel dengan akumulasi pembaca terbanyak saat ini.
        *   Kolom: `Rank` | `Thumbnail` | `Judul Berita` | `Kategori` | `Live Pageviews` | `Traffic Source Breakdown` (Persentase visual asal pengunjung: Google Discover, Google Search, Direct, Social Media).
        *   Indikator Tren: Ikon panah hijau (naik signifikan), panah abu-abu (stabil), atau panah merah (menurun).

### 1.3 Visitor
*   **H1 Page Title:** Visitor Demographics & Tech Stack Logs
*   **Komponen UI & Fungsi:**
    *   **Geographical Distribution Map:**
        *   Peta wilayah interaktif (skala nasional Indonesia per provinsi dan global per negara). Wilayah dengan densitas *traffic* tinggi akan berwarna lebih pekat (*heatmap*).
        *   Tabel detail di bawah peta: `Provinsi/Kota` | `Total Sesi` | `Persentase Kontribusi Traffic`.
    *   **Technology Breakdown Widgets (Donut Charts):**
        *   *Chart 1 (Device Class):* Mobile vs Desktop vs Tablet.
        *   *Chart 2 (Browser & In-App Browsers):* Chrome, Safari, Firefox, Opera, serta identifikasi lalu lintas penjelajah bawaan aplikasi seperti LINE Browser, Facebook Browser, dan Instagram WebView.
        *   *Chart 3 (Operating System):* Android, iOS, Windows, macOS, Linux.

## 2. Post Management

### 2.1 All Articles
*   **H1 Page Title:** Master Article Repository
*   **Komponen UI & Fungsi:**
    *   **Advanced Multi-Filter Bar:**
        *   Komponen input pencarian pintar (pencarian berdasarkan judul, slug, atau ID artikel).
        *   Dropdown filter bertingkat: `Kategori & Sub-Kategori`, `Penulis (Jurnalis)`, `Editor (Petugas Approval)`, `Status` (All, Published, Draft, Scheduled, Pending), dan `Date Range Picker` (Rentang tanggal pembuatan).
    *   **Master Data Table:**
        *   Kolom: `Checkbox` | `Thumbnail` | `Judul Berita & URL Slug` | `Penulis & Editor` | `Kategori` | `Tag (Badges)` | `Status (Colored Labels)` | `Tanggal Modifikasi` | `Aksi`.
        *   Kolom Aksi berisi tombol cepat: `Edit` (Halaman editor penuh), `Quick Edit` (Modal *pop-up* untuk mengubah judul, kategori, status, dan tag tanpa *reload* halaman), `View` (Buka tautan asli di tab baru), dan `Move to Trash`.
    *   **Bulk Actions Selector:**
        *   Aksi massal untuk baris yang dicentang: `Ubah Status ke Draft`, `Ubah Kategori Massal`, `Tambah Tag Massal`, dan `Hapus Massal`.

### 2.2 Create Article
*   **H1 Page Title:** Write & Publish New Article
*   **Komponen UI & Fungsi:**
    *   **Main WYSIWYG Editor Workspace:**
        *   Editor blok modern (seperti Gutenberg atau TipTap) yang mendukung input teks, pemisah halaman untuk artikel multi-page, penyisipan kode *embed* (X/Twitter, Instagram, TikTok, YouTube), kutipan teks (*blockquote*), tabel, dan galeri gambar di dalam teks.
    *   **Sidebar Metadata Panel (Sisi Kanan):**
        *   *Publish Box:* Tombol `Save Draft`, `Preview`, `Submit for Review`, dan `Publish`. Pengaturan visibilitas (Publik, Privat, Password) dan opsi pengaturan waktu (Segera atau pilih tanggal & jam untuk dijadwalkan).
        *   *Taxonomy Checklist:* Manajemen kategori (sistem pohon/hirarki dengan tombol cepat menambah kategori baru) dan input Tag (sistem tokenizing otomatis).
        *   *Featured Image Box:* Area drag-and-drop untuk mengunggah atau memilih gambar utama berita dari *Media Gallery*, lengkap dengan kolom input wajib `Caption` dan `Fotografer/Sumber Gambar`.
    *   **Inline SEO Box (Di Bawah Editor):**
        *   Input khusus: `Focus Keyword`, `Custom Meta Title`, `Custom Meta Description`.
        *   *Real-time Snippet Preview:* Simulasi tampilan cuplikan ketika artikel muncul di Google Search (versi Mobile & Desktop).
        *   *SEO & Readability Checklist:* Evaluasi otomatis (seperti panjang judul, kepadatan kata kunci, keberadaan tautan internal/eksternal, serta keterbacaan paragraf).

### 2.3 Published
*   **H1 Page Title:** Live & Published Articles Archive
*   **Komponen UI & Fungsi:**
    *   **Live Feed View:**
        *   Tabel yang khusus menyaring data dengan parameter `status = 'published'`, diurutkan berdasarkan tanggal rilis terbaru (*descending*).
    *   **Real-time Performance Metrics Badge:**
        *   Setiap baris artikel dilengkapi lencana visual yang menampilkan jumlah akumulasi klik dari Google Search Console dan jumlah interaksi komentar publik yang disetujui.
    *   **Instant Rollback Feature:**
        *   Tombol `"Unpublish"` atau `"Revert to Draft"` yang dilengkapi konfirmasi keamanan, berfungsi membatalkan penayangan artikel seketika dari halaman publik jika terdapat kekeliruan fatal atau sengketa hukum.

### 2.4 Draft
*   **H1 Page Title:** Drafts & Unsubmitted Articles
*   **Komponen UI & Fungsi:**
    *   **Draft Repository Table:**
        *   Daftar tulisan jurnalis yang masih dalam proses pengerjaan atau tulisan dari kontributor luar yang belum diajukan ke meja redaksi.
    *   **Editorial Communication Logs Column:**
        *   Kolom khusus yang menampilkan gelembung teks berisi catatan revisi terakhir dari editor kepada jurnalis (Contoh: "Tambahkan konfirmasi dari pihak kepolisian setempat di paragraf 4").
    *   **One-Click Submit Workflow:**
        *   Tombol cepat bagi reporter untuk mengubah status draf menjadi `Pending Review`, yang otomatis mengirimkan notifikasi ke dasbor akun editor.

### 2.5 Scheduled
*   **H1 Page Title:** Scheduled Publications & Content Pipeline
*   **Komponen UI & Fungsi:**
    *   **Chronological Pipeline Table:**
        *   Menampilkan deretan berita yang sudah selesai disunting dan siap tayang otomatis berdasarkan pengaturan waktu masa depan.
        *   Kolom: `Judul` | `Kategori` | `Target Waktu Rilis (Tanggal, Jam, Menit)` | `Countdown Timer` (Waktu mundur menuju rilis otomatis) | `Petugas Jadwal`.
    *   **Interactive Editorial Calendar View:**
        *   Transformasi visual tabel ke bentuk kalender penuh. Editor dapat menggeser (*drag-and-drop*) kotak artikel dari satu slot tanggal/jam ke slot lainnya untuk mendistribusikan frekuensi penayangan berita agar merata.

### 2.6 Recommendation
*   **H1 Page Title:** Curated Content & Editors Picks Management
*   **Komponen UI & Fungsi:**
    *   **Featured Positions Slots Manager:**
        *   Sistem manajemen untuk menempatkan artikel khusus pada posisi strategis di *homepage* (Contoh slot: `Main Headline (1)`, `Sub Headline (3)`, `Editors Picks (5)`, `Trending Column (5)`).
    *   **Search & Assign Widget:**
        *   Modul pencarian berbasis AJAX untuk mencari artikel aktif, lalu memasukkannya ke dalam slot pilihan redaksi dengan sekali klik.
    *   **Drag-and-Drop Reorder Layout:**
        *   UI untuk menyusun ulang prioritas atau nomor urut penampilan artikel rekomendasi di halaman depan secara visual.

### 2.7 Breaking
*   **H1 Page Title:** Breaking News Ticker & Emergency Flash Settings
*   **Komponen UI & Fungsi:**
    *   **Live Banner Control Form:**
        *   Input teks pendek (maksimal 100 karakter) yang akan muncul sebagai teks berjalan (*running text*) atau spanduk merah berkedip di bagian paling atas seluruh halaman situs web.
    *   **Internal Link Binder:**
        *   Kolom pencarian cepat untuk menautkan teks *Breaking News* ke URL artikel berita utama yang sedang diperbarui secara berkala (*live report*).
    *   **Automated Expiration Settings:**
        *   Input durasi aktif banner (Contoh: Berakhir otomatis dalam `30 Menit`, `1 Jam`, `3 Jam`), atau opsi mati manual melalui tombol toggle `"Matikan Banner Sekarang"`.

### 2.8 Trash
*   **H1 Page Title:** Deleted Articles Archive (Recycle Bin)
*   **Komponen UI & Fungsi:**
    *   **Soft-Deleted Records Table:**
        *   Tempat penampungan artikel yang dihapus oleh pengguna. Artikel disimpan selama 30 hari sebelum dihapus permanen oleh sistem secara otomatis.
        *   Kolom: `Judul` | `Dihapus Oleh` | `Tanggal Dihapus` | `Sisa Waktu Auto-Purge (Hari)`.
    *   **Recovery Actions:**
        *   Tombol `Restore` (Mengementerian artikel ke status draf semula) dan tombol `Delete Permanently` (Menghapus seluruh baris data dari database beserta keterikatan relasi medianya).

## 3. Taxonomies

### 3.1 Kategori
*   **H1 Page Title:** Article Categories Hierarchy
*   **Komponen UI & Fungsi:**
    *   **Split Two-Column Interface:**
        *   *Sisi Kiri (Form Tambah/Edit):* Input `Nama Kategori` (Contoh: Olahraga), `Slug URL` (Otomatis terisi, contoh: olahraga), Dropdown `Parent Category` (Untuk membuat struktur hirarki, contoh: Olahraga -> Sepak Bola), dan `SEO Deskripsi Kategori`.
        *   *Sisi Kanan (Hierarchical Data Table):* Tabel pohon yang menampilkan semua kategori terdaftar. Kolom: `Nama Kategori (dengan indentasi untuk sub-kategori)` | `Slug` | `Jumlah Artikel Aktif (Berupa link yang mengarah ke All Articles terfilter)`.
    *   **Category Color Badge Picker:**
        *   Input warna (*Color Palette Picker*) untuk menentukan warna penanda kategori yang akan muncul di halaman depan situs web.

### 3.2 Tag
*   **H1 Page Title:** Keyword Tags Management (Keywords Cloud)
*   **Komponen UI & Fungsi:**
    *   **Tag Directory Table:**
        *   Menampilkan kumpulan kata kunci penanda artikel berita dalam skala besar.
        *   Kolom: `Checkbox` | `Nama Tag` | `Slug` | `Deskripsi` | `Count (Frekuensi Penggunaan)`.
        *   Fitur: Kolom pencarian tag secara spesifik dan fitur navigasi halaman (*pagination*).
    *   **Tag Merger Tool:**
        *   Sistem untuk menggabungkan dua atau lebih tag yang mengalami redundansi akibat variasi penulisan.
        *   Form: Input `Tag Asal` (Contoh: `Sepakbola`, `Sepak-Bola`) -> diakumulasikan ke `Tag Tujuan` (Contoh: `Sepak Bola`). Sistem otomatis memperbarui semua relasi ID artikel terkait di database.

## 4. Media

### 4.1 Gallery
*   **H1 Page Title:** Central Media Library
*   **Komponen UI & Fungsi:**
    *   **Responsive Grid Asset View:**
        *   Tampilan mosaik/grid dari seluruh aset media (gambar, video, dokumen) yang diurutkan berdasarkan tanggal diunggah, didukung fitur *Infinite Scroll* atau *Lazy Pagination*.
        *   Filter Bar atas: Filter berdasarkan jenis file (`Images`, `Videos`, `Audio`, `Documents`), filter berdasarkan tanggal bulan/tahun, dan kolom pencarian nama file berita.
    *   **Asset Detail Slide-out Inspector (Sidebar Kanan):**
        *   Akan meluncur keluar ketika salah satu aset media diklik. Menampilkan metadata: Nama file, tipe berkas, ukuran (KB/MB), dimensi piksel, tanggal unggah, dan nama pengunggah.
        *   Editable Fields: `Alternative Text (Alt Text - Wajib untuk SEO)`, `Title`, `Caption`, dan `Description/Credits`.
        *   Tombol Aksi: `Copy URL Berkas` dan `Hapus Selamanya`.

### 4.2 Upload
*   **H1 Page Title:** Bulk Media Upload Zone
*   **Komponen UI & Fungsi:**
    *   **Drag & Drop Interactive Area:**
        *   Kotak besar bermotif putus-putus dengan ikon unggah yang responsif terhadap aksi penarikan file dari komputer lokal admin.
        *   Teks pemberitahuan dinamis: Menampilkan batas kapasitas maksimal berkas (*Max File Upload Size*, misal: 20MB untuk gambar, 200MB untuk video) dan ekstensi berkas yang diizinkan.
    *   **Upload Progress Monitor Table:**
        *   Daftar file yang sedang dikirim ke server. Menampilkan bar kemajuan (*Progress Bar*) berwarna biru yang berjalan real-time per file, ukuran file, serta status (`Sukses` atau `Gagal dengan indikator pesan eror`, contoh: "File terlalu besar" atau "Format tidak didukung").

### 4.3 Images
*   **H1 Page Title:** Image Asset Management
*   **Komponen UI & Fungsi:**
    *   **Image Exclusive Gallery View:**
        *   Sub-menu khusus yang hanya memfilter berkas bertipe gambar (`.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`).
    *   **In-App Image Cropper & Editor Modal:**
        *   Ketika tombol *Edit Image* ditekan, muncul jendela modal penyuntingan gambar tanpa merusak file asli (*non-destructive editing*).
        *   Fitur: Pemotongan gambar (*Aspect Ratio Cropper* khusus portal berita: `16:9` untuk gambar utama artikel, `4:3` untuk list thumbnail, dan `1:1` untuk grid feed), rotasi gambar, dan kompresi visual instan.

### 4.4 Videos
*   **H1 Page Title:** Video Asset Management & Embed Streaming Configuration
*   **Komponen UI & Fungsi:**
    *   **Video Library Table:**
        *   Daftar aset multimedia bergerak (.mp4, .mov, .avi) yang digunakan sebagai pelengkap konten berita audio visual atau portal TV berita.
    *   **Streaming Strategy Selector Form:**
        *   Opsi konfigurasi sumber per berkas video:
            *   `Self-Hosted/Object Storage`: Berkas video diunggah ke infrastruktur server sendiri/S3 bucket, menampilkan opsi pembuatan file *HLS streaming* (`.m3u8`) otomatis untuk menghemat bandwidth.
            *   `External Embed Service`: Kolom input untuk menempelkan kode embed / ID dari platform eksternal seperti YouTube, TikTok, Facebook Watch, atau Vimeo.

### 4.5 Documents
*   **H1 Page Title:** Document Attachments & Press Release Repositories
*   **Komponen UI & Fungsi:**
    *   **Document Registry Table:**
        *   Tempat penyimpanan berkas non-media pendukung artikel berita hukum, rilis pers instansi pemerintah, atau laporan PDF keuangan (`.pdf`, `.doc`, `.docx`, `.xls`, `.xlsx`, `.txt`).
        *   Kolom: `Nama Dokumen` | `Tipe Ekstensi` | `Ukuran` | `Artikel Terkait` (Daftar artikel berita yang melampirkan file ini) | `Download Count` (Menghitung berapa kali dokumen diunduh oleh pembaca).

### 4.6 Optimization
*   **H1 Page Title:** Automated Media Optimization & Edge Compression Settings
*   **Komponen UI & Fungsi:**
    *   **Next-Gen Format Converter Toggle:**
        *   Tombol switch (ON/OFF): `"Auto-Convert Images to WebP/AVIF"`. Jika aktif, CMS otomatis mengonversi gambar format lama yang diunggah jurnalis menjadi format modern yang jauh lebih ringan sebelum disimpan ke server.
    *   **Global Compression Level Engine:**
        *   Slider persentase tingkat kompresi berkas gambar (Default direkomendasikan pada angka `75% - 80%`, menyeimbangkan antara ukuran file minimal dan ketajaman visual berita).
    *   **Image Dimension Max Thresholds:**
        *   Input batasan piksel otomatis: `Max Width (px)` dan `Max Height (px)`. Jika jurnalis mengunggah foto mentah beresolusi 4K (4000px+), sistem otomatis melakukan pengecilan skala (*downscale*) ke batas maksimal (misal: lebar 1920px) demi menghemat ruang penyimpanan.

## 5. Comments

### 5.1 Moderation
*   **H1 Page Title:** Comment Moderation & Approval Queue
*   **Komponen UI & Fungsi:**
    *   **Pending Comments Workflow Queue Table:**
        *   Tempat menyaring semua komentar dari pembaca sebelum disetujui muncul di halaman publik berita.
        *   Kolom: `Data Pembaca (Nama, Email, Alamat IP, User Agent)` | `Isi Teks Komentar` | `Artikel Berita Asal (Tautan cepat ke artikel)` | `Waktu Kirim`.
    *   **Mass Action Quick Approve/Reject:**
        *   Di setiap baris komentar tersedia tombol aksi cepat: `Approve` (Loloskan langsung ke publik situs), `Reply` (Ketik balasan admin/redaksi langsung dari antrean), `Mark as Spam`, dan `Move to Trash`.

### 5.2 Spam
*   **H1 Page Title:** Automated & Manual Spam Comments Box
*   **Komponen UI & Fungsi:**
    *   **Spam Collection Table:**
        *   Menampung komentar yang ditandai sebagai spam secara manual oleh moderator atau ditangkap otomatis oleh sistem proteksi (seperti integrasi API Akismet atau Captcha).
    *   **Database Purge Button:**
        *   Tombol `"Empty Spam Storage"`. Aksi satu klik untuk menghapus seluruh rekam data komentar spam secara permanen dari database guna menjaga optimasi performa indeks tabel.

### 5.3 Blacklist
*   **H1 Page Title:** Forbidden Comment Keywords & User Ban Lists
*   **Komponen UI & Fungsi:**
    *   **Profanity & Sensitive Word Filter Textarea:**
        *   Kotak besar untuk menginput kata-kata kasar, makian, istilah bermuatan SARA, pornografi, atau daftar kata radikal. Sistem otomatis memblokir atau memasukkan ke antrean *Spam* jika terdeteksi kata-kata ini.
    *   **Banned User Identifiers Matrix:**
        *   Form input dan tabel untuk mencekal pengguna bermasalah secara permanen. Input fields: `Banned IP Addresses` dan `Banned Email Addresses`.

### 5.4 User Reports
*   **H1 Page Title:** Flagged Comments & Community Reports Log
*   **Komponen UI & Fungsi:**
    *   **Community Report Center Table:**
        *   Menampung aduan pembaca terhadap komentar pengguna lain yang dinilai melanggar panduan komunitas.
        *   Kolom: `Teks Komentar Terlaporkan` | `Penulis Komentar` | `Alasan Laporan Pembaca` (Dropdown: Pelecehan/SARA/Ujaran Kebencian/Hoaks) | `Jumlah Pelapor (Report Counter)` | `Aksi Penanganan`.
    *   **Aksi Penanganan:** Tombol `Abaikan Laporan (Keep Comment)` atau `Eksekusi Hapus & Blokir`.

## 6. User Management

### 6.1 All Users
*   **H1 Page Title:** CMS User Directory & Activity Accounts
*   **Komponen UI & Fungsi:**
    *   **Master Users Table:**
        *   Kolom: `Avatar` | `Username` | `Nama Lengkap` | `Email` | `Role (System Badge)` | `Total Articles Written` | `Status (Active/Suspended)` | `Aksi`.
    *   **CMS Security Activity Log Shortcut:**
        *   Tombol pintas di setiap akun untuk melihat log aktivitas: `Waktu Login terakhir`, `Alamat IP Akses`, dan `Daftar Tindakan Terakhir`.

### 6.2 Add User
*   **H1 Page Title:** Create New Administrative Account
*   **Komponen UI & Fungsi:**
    *   **Account Creation Form Fields:**
        *   Input wajib: `Username`, `Alamat Email Resmi Perusahaan`, `Nama Depan & Belakang`.
        *   *Password Field:* Fitur klik otomatis `"Generate Strong Password"`.
        *   *Role Assignment:* Dropdown pilihan level akun (`Super Admin`, `Pemimpin Redaksi`, `Redaktur/Editor`, `Reporter/Jurnalis`, `Kontributor Luar`, `Sales/Marketing`).
    *   **Automated Activation Email Toggle:**
        *   Opsi switch (ON/OFF) untuk mengirimkan surat pemberitahuan otomatis ke email bersangkutan berisi link aktivasi akun.

### 6.3 Roles & Permissions
*   **H1 Page Title:** Role-Based Access Control (RBAC) Matrices
*   **Komponen UI & Fungsi:**
    *   **Dynamic Access Authorization Grid:**
        *   Tabel matriks dua dimensi. Sumbu vertikal (Baris) menampilkan nama *Role*. Sumbu horizontal (Kolom) menampilkan hak izin tindakan sistem (`create_post`, `publish_post`, `edit_others_post`, `manage_ads`, dsb).

## 7. Ad Management

### 7.1 Overview
*   **H1 Page Title:** Advertising Dashboard & Inventory Overview
*   **Komponen UI & Fungsi:**
    *   **Ad Revenue Performance High-Level Cards:** Menampilkan metrik iklan mandiri (Direct Ads): `Total Impressions Hari Ini`, `Total Clicks`, `Rata-rata CTR Global`, dan `Estimasi Pendapatan`.
    *   **Ad Inventory Capacity Bar:** Visualisasi grafik batang horisontal persentase keterisian iklan (*Fill Rate*).

### 7.2 Analytics
*   **H1 Page Title:** Granular Advertising Performance Analytics
*   **Komponen UI & Fungsi:**
    *   **Comparative Ad Slots Performance Chart:** Grafik batang/garis interaktif untuk membandingkan efektivitas performa iklan antar zona penempatan (Contoh: `Homepage Top` vs `Article MiddleContent`).

### 7.3 Ad Slots
*   **H1 Page Title:** Website Layout Ad Zones Configuration
*   **Komponen UI & Fungsi:**
    *   **Ad Zones Registry Table:** Kolom: `ID Slot` | `Nama Lokasi Slot` | `Target Dimensi Ukuran (px)` | `Status Slot (Aktif/Kosong)` | `Aksi`.

### 7.4 Advertisements
*   **H1 Page Title:** Master Banner & Programmatic Scripts Repository
*   **Komponen UI & Fungsi:**
    *   **Ad Creative Material Creator Form:** Dropdown Pilihan `Ad Type` (`Direct Image/Media Banner` + `Target URL Redirection Link` ATAU `Programmatic Ad Network Script` untuk kode Google AdSense/MGID).

### 7.5 Campaigns
*   **H1 Page Title:** Ad Campaigns & Contract Management
*   **Komponen UI & Fungsi:**
    *   **Campaign Definition & Contract Form:** Input data: `Nama Kampanye Iklan`, Dropdown `Advertiser Profile`, dan `Campaign Goal Constraints` (Max Impressions, Max Clicks, atau Rentang Waktu Kontrak).

### 7.6 Advertisers
*   **H1 Page Title:** Client & Advertiser CRM Profiles
*   **Komponen UI & Fungsi:**
    *   **Advertiser Directory Database:** Menyimpan kontak rekam data klien pengiklan lokal. Fields: `Nama Perusahaan`, `Nama PIC`, `WhatsApp`, `Email Tagihan`, `Status Keuangan Invoice`.

### 7.7 Pricing Setup
*   **H1 Page Title:** Ad Inventory Pricing Models (Rate Cards)
*   **Komponen UI & Fungsi:**
    *   **Rate Card Configurator Matrix:** Input model penetapan biaya: `CPM Rate`, `CPC Rate`, atau `Flat Rate Pricing`.

### 7.8 Scheduled Ads
*   **H1 Page Title:** Automated Ad Publication Flight Scheduler
*   **Komponen UI & Fungsi:**
    *   **Chronological Ad Deployment Queue:** Input Fields: `Start Flight Date & Time` dan `End Flight Date & Time` untuk pencopotan iklan otomatis.

### 7.9 Report & Export
*   **H1 Page Title:** Exportable Advertising Analytical Performance Reports
*   **Komponen UI & Fungsi:**
    *   **Custom Report Generation Form & Export Action Buttons:** Tombol `"Download Executive PDF Report"` untuk dikirim ke klien (Proof of Performance) dan tombol `"Export Raw Analytics (CSV/XLSX)"`.

### 7.10 Global Settings
*   **H1 Page Title:** Global Advertising Controls & Verification Files
*   **Komponen UI & Fungsi:**
    *   **Anti-AdBlock Detection Mitigation Toggle:** Memunculkan modal jika user menggunakan pemblokir iklan.
    *   **Direct Ads.txt Terminal Editor:** Textarea besar yang terhubung langsung untuk membuat atau mengubah isi berkas teks `ads.txt` di root server.

## 8. SEO

### 8.1 Analytics
*   **H1 Page Title:** Organic Search Performance Engine Metrics
*   **Komponen UI & Fungsi:**
    *   **Google Search Console Core Sync API Dashboard:** Melacak `Total Clicks`, `Total Impressions`, `Average CTR`, dan `Average SERP Position`.
    *   **Organic Search Queries Monitor Table:** Menampilkan daftar kueri pencarian kata kunci teratas dari mesin pencari.

### 8.2 General Settings
*   **H1 Page Title:** SEO Global Core Foundations
*   **Komponen UI & Fungsi:**
    *   **Meta Automation Architecture (Horizontal Tabs Interface):** Form untuk `Homepage Meta Title`, `Meta Description`, dan `Global Title Formulations` via token.
    *   **Technical SEO Directives & Open Graph:** Opsi untuk `Enforce Global Canonical Links` dan pengaturan data Open Graph entity.

### 8.3 Indexing
*   **H1 Page Title:** Search Engine Crawl Control & Automated Sitemaps
*   **Komponen UI & Fungsi:**
    *   **Dual-Engine XML Sitemap Automator Generator:**
        *   `Standard XML Sitemap`: Untuk kategori dan page statis di `domain.com/sitemap.xml`.
        *   `Google News Specialized Sitemap` (**SANGAT KRUSIAL**): Memasukkan artikel rilis dalam **48 jam terakhir** dengan tag XML khusus standar Google News di `domain.com/news-sitemap.xml`.
    *   **Robots.txt Terminal Panel & Google Indexing API Setup:** Area input file kredensial JSON Google Service Account. Setiap kali artikel dipublikasikan, CMS otomatis mengirim sinyal API ping instan ke Google server agar diindeks dalam hitungan detik.

### 8.4 Redirect & Social
*   **H1 Page Title:** URL Redirection Engine & Social Media Fallbacks
*   **Komponen UI & Fungsi:**
    *   **301/302 URL Redirection Manager Matrix:** Form input tautan lama broken ke tautan baru yang aktif.
    *   **Dead Links 404 Interception Log Monitor:** Mencatat kegagalan akses halaman 404 oleh user untuk dievaluasi dan diredirect dengan cepat.
    *   **Social Open Graph Media Fallback:** Pengunggahan banner gambar default jika artikel tidak memiliki featured image saat dibagikan ke WhatsApp/Telegram.

## 9. Market Live Widget

*   **H1 Page Title:** Financial & Market Live Ticker Feed Settings
*   **Komponen UI & Fungsi:**
    *   **Market Data Streams Selector Board:** Opsi penayangan live scrolling widget: `Kurs Valas (USD/IDR)`, `Harga Emas Antam`, `IHSG/Saham`, atau `Harga Kripto`.
    *   **API Provider Secure Connection Credentials & Caching Engine:** Input API Key eksternal (Yahoo Finance/Alpha Vantage) dan slider durasi transient cache untuk menghemat kuota panggilah API.

## 10. WEB Settings

### 10.1 General
*   **H1 Page Title:** Core System & News Portal Identity Configuration
*   **Komponen UI & Fungsi:**
    *   **Corporate Identity Metadata Fields:** Form `Nama Portal Berita`, `Slogan`, `Nama Badan Hukum PT`, `Alamat Fisik Kantor Redaksi`, `Nomor Kontak`, dan `Email Resmi`.
    *   **Branding Graphics Asset Manager:** Upload area untuk logo versi Light Mode, Dark Mode, dan Favicon Browser.

### 10.2 Pages
*   **H1 Page Title:** Core Static Pages Manager (Legal & Press Disclosures)
*   **Komponen UI & Fungsi:**
    *   **Static Editorial Pages Library Table:** Mengelola halaman wajib media siber Indonesia standar Dewan Pers: `Tentang Kami`, `Susunan Redaksi & Struktur Organisasi`, `Pedoman Pemberitaan Media Siber` (Wajib ada), `Kebijakan Privasi (Privacy Policy)`, dan `Info Kontak Pengaduan Sengketa`.

---

### PRINSIP IMPLEMENTASI UTAMA BAGI DEVELOPER DIRECTIVES:
1. **Asynchronous Fetch & Decoupled State Handling:** Jangan menggabungkan pemanggilan fungsi API eksternal (Search Console, Analytics, Live Market Widgets) secara sinkronus di dalam main thread yang merender halaman admin CMS. Gunakan async data fetching setelah UI terpasang agar panel tidak freeze.
2. **Role-Based Access Control (RBAC) Route Guards:** Pengamanan pada tingkat middleware routing backend. Peran seperti `Reporter/Jurnalis` yang mencoba mengakses menu Ad Management atau WEB Settings secara paksa harus langsung diblok dengan respons HTTP `403 Forbidden Access Denied`.
3. **Unified Post Table with Filter-Optimized Indexes:** Untuk sub-menu di Post Management (All Articles, Published, Draft, Scheduled), semua data harus disimpan dalam satu tabel database utama `posts`. Pemisahan halaman dilakukan murni menggunakan optimalisasi indeks kueri filter database (`WHERE status = 'published'`, dst).

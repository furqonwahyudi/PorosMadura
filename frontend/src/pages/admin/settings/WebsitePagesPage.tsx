import React, { useState, useEffect } from "react";
import { BookOpen, FileText, Edit2, Eye, Circle, HelpCircle, X, Save, Loader2 } from "lucide-react";
import { adminApi } from "../../../lib/adminApi";
import { useDialog } from "../../../context/DialogContext";

interface StaticPageData {
  title: string;
  subtitle: string;
  content: string;
}

interface PageItem {
  id: number;
  name: string;
  slug: string;
  status: string;
  mandatory: boolean;
}

export default function WebsitePagesPage() {
  const { showConfirm, showToast } = useDialog();
  const [pages, setPages] = useState<PageItem[]>([
    { id: 1, name: "Tentang Kami", slug: "/pages/about", status: "Published", mandatory: true },
    { id: 2, name: "Susunan Redaksi & Struktur Organisasi", slug: "/pages/editorial-board", status: "Published", mandatory: true },
    { id: 3, name: "Pedoman Pemberitaan Media Siber", slug: "/pages/cyber-media-guidelines", status: "Published", mandatory: true },
    { id: 4, name: "Kebijakan Privasi (Privacy Policy)", slug: "/pages/privacy-policy", status: "Published", mandatory: true },
    { id: 5, name: "Info Kontak Pengaduan Sengketa", slug: "/pages/dispute-contact", status: "Published", mandatory: true },
    { id: 7, name: "RSS Feed & Sindikasi Berita", slug: "/pages/rss", status: "Published", mandatory: true },
    { id: 6, name: "Karir / Lowongan Kerja", slug: "/pages/careers", status: "Draft", mandatory: false },
  ]);

  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Editor Modal State
  const [editingPage, setEditingPage] = useState<PageItem | null>(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedSubtitle, setEditedSubtitle] = useState("");
  const [editedContent, setEditedContent] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await adminApi.get<any>("/api/settings");
      if (res && res.success) {
        setSettings(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch site settings", err);
    } finally {
      setLoading(false);
    }
  };

  const getPageKey = (slug: string) => {
    return slug.replace("/pages/", "");
  };

  const getDefaultData = (slug: string): StaticPageData => {
    const key = getPageKey(slug);
    switch (key) {
      case "about":
        return {
          title: "Tentang Kami",
          subtitle: "Profil & Visi Misi Poros Madura",
          content: `<p><strong>Poros Madura</strong> adalah portal berita digital independen nasional yang berkomitmen menyajikan informasi aktual, tajam, terpercaya, dan berimbang seputar Pulau Madura serta dinamika nasional yang relevan.</p>
<p>Sebagai media massa digital, kami menjunjung tinggi kode etik jurnalistik dan berkomitmen untuk mencerdaskan kehidupan masyarakat melalui penyajian berita yang mendalam, independen, dan berlandaskan kebenaran fakta.</p>

<div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
  <div class="bg-slate-50 border border-slate-100 rounded-xl p-5">
    <h4 class="font-bold text-slate-800 text-sm mb-3 uppercase tracking-wider border-b pb-1.5 border-slate-200">Visi Kami</h4>
    <p class="text-xs text-gray-600 font-light">Menjadi media rujukan informasi tepercaya di Madura yang mampu menjembatani aspirasi masyarakat lokal menuju panggung nasional melalui jurnalisme yang sehat dan mencerahkan.</p>
  </div>
  <div class="bg-slate-50 border border-slate-100 rounded-xl p-5">
    <h4 class="font-bold text-slate-800 text-sm mb-3 uppercase tracking-wider border-b pb-1.5 border-slate-200">Misi Kami</h4>
    <ul class="list-disc list-inside text-xs text-gray-600 font-light flex flex-col gap-2">
      <li>Menyajikan berita berkualitas secara cepat, akurat, dan mendalam.</li>
      <li>Menjaga independensi pers dengan berpegang teguh pada fakta riil lapangan.</li>
      <li>Mendukung pembangunan daerah lewat kritik yang konstruktif dan solutif.</li>
    </ul>
  </div>
</div>`
        };
      case "editorial-board":
        return {
          title: "Susunan Redaksi",
          subtitle: "Struktur Organisasi & Tim Jurnalis",
          content: `<p class="leading-relaxed mb-4">PT Poros Madura Multi Media menaungi tim jurnalis profesional berdedikasi tinggi yang tersebar di wilayah Madura (Bangkalan, Sampang, Pamekasan, Sumenep) serta koresponden nasional di Jakarta.</p>

<div class="border border-slate-100 rounded-xl overflow-hidden mt-2 mb-6">
  <div class="bg-[#0D2B5C]/5 border-b border-slate-100 px-4 py-3">
    <h4 class="font-bold text-slate-800 text-sm uppercase tracking-wider">Penanggung Jawab & Manajemen</h4>
  </div>
  <div class="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
    <div>
      <span class="text-gray-400 font-medium uppercase text-[10px]">Penerbit (Publisher)</span>
      <p class="font-bold text-slate-800 text-sm mt-0.5">PT Poros Madura Multi Media</p>
    </div>
    <div>
      <span class="text-gray-400 font-medium uppercase text-[10px]">Pemimpin Redaksi / Penanggung Jawab</span>
      <p class="font-bold text-slate-800 text-sm mt-0.5">Ahmad Syafi'i</p>
    </div>
    <div>
      <span class="text-gray-400 font-medium uppercase text-[10px]">Redaktur Pelaksana (Managing Editor)</span>
      <p class="font-bold text-slate-800 text-sm mt-0.5">Fatimah Z.</p>
    </div>
    <div>
      <span class="text-gray-400 font-medium uppercase text-[10px]">Redaktur Senior (Editors)</span>
      <p class="font-bold text-slate-800 text-sm mt-0.5">Rudi Santoso, Nia Kurniasih</p>
    </div>
  </div>
</div>

<div class="border border-slate-100 rounded-xl overflow-hidden">
  <div class="bg-[#0D2B5C]/5 border-b border-slate-100 px-4 py-3">
    <h4 class="font-bold text-slate-800 text-sm uppercase tracking-wider">Koresponden / Reporter Daerah</h4>
  </div>
  <div class="p-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
    <div>
      <span class="text-gray-400 font-medium uppercase text-[10px]">Bangkalan</span>
      <p class="font-semibold text-slate-800 mt-0.5">Samsul Arifin</p>
    </div>
    <div>
      <span class="text-gray-400 font-medium uppercase text-[10px]">Sampang</span>
      <p class="font-semibold text-slate-800 mt-0.5">Budi Hariono</p>
    </div>
    <div>
      <span class="text-gray-400 font-medium uppercase text-[10px]">Pamekasan</span>
      <p class="font-semibold text-slate-800 mt-0.5">Zainal Abidin</p>
    </div>
    <div>
      <span class="text-gray-400 font-medium uppercase text-[10px]">Sumenep</span>
      <p class="font-semibold text-slate-800 mt-0.5">Faisal R.</p>
    </div>
  </div>
</div>`
        };
      case "cyber-media-guidelines":
        return {
          title: "Pedoman Pemberitaan Media Siber",
          subtitle: "Peraturan Dewan Pers Nomor: 1/Peraturan-DP/III/2012",
          content: `<div class="bg-slate-50 border border-slate-100 rounded-2xl p-5 mb-6 text-center text-xs text-slate-600">
  <p class="font-bold text-slate-800 uppercase tracking-wider mb-2">Peraturan Dewan Pers Nomor 1/Peraturan-DP/III/2012</p>
  <p class="font-semibold text-[#0D2B5C] uppercase tracking-wider mb-3">Tentang Pedoman Pemberitaan Media Siber</p>
  <p class="text-[11px] leading-relaxed max-w-2xl mx-auto font-light">Kemerdekaan berpendapat, kemerdekaan berekspresi, dan kemerdekaan pers adalah hak asasi manusia yang dilindungi Pancasila, Undang-Undang Dasar 1945, dan Deklarasi Universal Hak Asasi Manusia PBB. Keberadaan media siber di Indonesia juga merupakan bagian dari kemerdekaan berpendapat, kemerdekaan berekspresi, dan kemerdekaan pers.</p>
  <p class="text-[11px] leading-relaxed max-w-2xl mx-auto font-light mt-2.5">Media siber memiliki karakter khusus sehingga memerlukan pedoman agar pengelolaannya dapat dilaksanakan secara profesional, memenuhi fungsi, hak, dan kewajibannya sesuai Undang-Undang Nomor 40 Tahun 1999 tentang Pers dan Kode Etik Jurnalistik. Untuk itu Dewan Pers bersama organisasi pers, pengelola media siber, dan masyarakat menyusun Pedoman Pemberitaan Media Siber sebagai berikut:</p>
</div>

<h2>1. Ruang Lingkup</h2>
<p><strong>Media Siber</strong> adalah segala bentuk media yang menggunakan wahana internet dan melaksanakan kegiatan jurnalistik, serta memenuhi persyaratan Undang-Undang Pers dan Standar Perusahaan Pers yang ditetapkan Dewan Pers.</p>
<p><strong>Isi Buatan Pengguna (User Generated Content)</strong> adalah segala isi yang dibuat dan atau dipublikasikan oleh pengguna media siber, antara lain, artikel, gambar, komentar, suara, video dan berbagai bentuk unggahan yang melekat pada media siber, seperti blog, forum, komentar pembaca atau pemirsa, dan bentuk lain.</p>

<h2>2. Verifikasi dan keberimbangan berita</h2>
<p>a. Pada prinsipnya setiap berita harus melalui verifikasi.</p>
<p>b. Berita yang dapat merugikan pihak lain memerlukan verifikasi pada berita yang sama untuk memenuhi prinsip akurasi dan keberimbangan.</p>
<p>c. Ketentuan dalam butir (a) di atas dikecualikan, dengan syarat:</p>
<ul>
  <li>1) Berita benar-benar mengandung kepentingan publik yang bersifat mendesak;</li>
  <li>2) Sumber berita yang pertama adalah sumber yang jelas disebutkan identitasnya, kredibel dan kompeten;</li>
  <li>3) Subyek berita yang harus dikonfirmasi tidak diketahui keberadaannya dan atau tidak dapat diwawancarai;</li>
  <li>4) Media memberikan penjelasan kepada pembaca bahwa berita tersebut masih memerlukan verifikasi lebih lanjut yang diupayakan dalam waktu secepatnya. Penjelasan dimuat pada bagian akhir dari berita yang sama, di dalam kurung dan menggunakan huruf miring.</li>
</ul>
<p>d. Setelah memuat berita sesuai dengan butir (c), media wajib meneruskan upaya verifikasi, dan setelah verifikasi didapatkan, hasil verifikasi dicantumkan pada berita pemutakhiran (update) dengan tautan pada berita yang belum terverifikasi.</p>

<h2>3. Isi Buatan Pengguna (User Generated Content)</h2>
<p>a. Media siber wajib mencantumkan syarat dan ketentuan mengenai Isi Buatan Pengguna yang tidak bertentangan dengan Undang-Undang No. 40 tahun 1999 tentang Pers dan Kode Etik Jurnalistik, yang ditempatkan secara terang dan jelas.</p>
<p>b. Media siber mewajibkan setiap pengguna untuk melakukan registrasi keanggotaan dan melakukan proses log-in terlebih dahulu untuk dapat mempublikasikan semua bentuk Isi Buatan Pengguna. Ketentuan mengenai log-in akan diatur lebih lanjut.</p>
<p>c. Dalam registrasi tersebut, media siber mewajibkan pengguna memberi persetujuan tertulis bahwa Isi Buatan Pengguna yang dipublikasikan:</p>
<ul>
  <li>1) Tidak memuat isi bohong, fitnah, sadis dan cabul;</li>
  <li>2) Tidak memuat isi yang mengandung prasangka dan kebencian terkait dengan SARA, serta menganjurkan tindakan kekerasan;</li>
  <li>3) Tidak memuat isi diskriminatif atas dasar perbedaan jenis kelamin dan bahasa, serta tidak merendahkan martabat orang lemah, miskin, sakit, cacat jiwa, atau cacat jasmani.</li>
</ul>
<p>d. Media siber memiliki kewenangan mutlak untuk mengedit atau menghapus Isi Buatan Pengguna yang bertentangan dengan butir (c).</p>
<p>e. Media siber wajib menyediakan mekanisme pengaduan Isi Buatan Pengguna yang dinilai melanggar ketentuan pada butir (c). Mekanisme tersebut harus disediakan di tempat yang dengan mudah dapat diakses pengguna.</p>
<p>f. Media siber wajib menyunting, menghapus, dan melakukan tindakan koreksi setiap Isi Buatan Pengguna yang dilaporkan dan melanggar ketentuan butir (c), sesegera mungkin secara proporsional selambat-lambatnya 2 x 24 jam setelah pengaduan diterima.</p>
<p>g. Media siber yang telah memenuhi ketentuan pada butir (a), (b), (c), dan (f) tidak dibebani tanggung jawab atas masalah yang ditimbulkan akibat pemuatan isi yang melanggar ketentuan pada butir (c).</p>
<p>h. Media siber bertanggung jawab atas Isi Buatan Pengguna yang dilaporkan bila tidak mengambil tindakan koreksi setelah batas waktu sebagaimana tersebut pada butir (f).</p>

<h2>4. Ralat, Koreksi, dan Hak Jawab</h2>
<p>a. Ralat, koreksi, dan hak jawab mengacu pada Undang-Undang Pers, Kode Etik Jurnalistik, dan Pedoman Hak Jawab yang ditetapkan Dewan Pers.</p>
<p>b. Ralat, koreksi dan atau hak jawab wajib ditautkan pada berita yang diralat, dikoreksi atau yang diberi hak jawab.</p>
<p>c. Di setiap berita ralat, koreksi, dan hak jawab wajib dicantumkan waktu pemuatan ralat, koreksi, dan atau hak jawab tersebut.</p>
<p>d. Bila suatu berita media siber tertentu disebarluaskan media siber lain, maka:</p>
<ul>
  <li>1) Tanggung jawab media siber pembuat berita terbatas pada berita yang dipublikasikan di media siber tersebut atau media siber yang berada di bawah otoritas teknisnya;</li>
  <li>2) Koreksi berita yang dilakukan oleh sebuah media siber, juga harus dilakukan oleh media siber lain yang mengutip berita dari media siber yang dikoreksi itu;</li>
  <li>3) Media yang menyebarluaskan berita dari sebuah media siber dan tidak melakukan koreksi atas berita sesuai yang dilakukan oleh media siber pemilik dan atau pembuat berita tersebut, bertanggung jawab penuh atas semua akibat hukum dari berita yang tidak dikoreksinya itu.</li>
</ul>
<p>e. Sesuai dengan Undang-Undang Pers, media siber yang tidak melayani hak jawab dapat dijatuhi sanksi hukum pidana denda paling banyak Rp500.000.000 (Lima ratus juta rupiah).</p>

<h2>5. Pencabutan Berita</h2>
<p>a. Berita yang sudah dipublikasikan tidak dapat dicabut karena alasan penyensoran dari pihak luar redaksi, kecuali terkait masalah SARA, kesusilaan, masa depan anak, pengalaman traumatik korban atau berdasarkan pertimbangan khusus lain yang ditetapkan Dewan Pers.</p>
<p>b. Media siber lain wajib mengikuti pencabutan kutipan berita dari media asal yang telah dicabut.</p>
<p>c. Pencabutan berita wajib disertai dengan alasan pencabutan dan diumumkan kepada publik.</p>

<h2>6. Iklan</h2>
<p>a. Media siber wajib membedakan dengan tegas antara produk berita dan iklan.</p>
<p>b. Setiap berita/artikel/isi yang merupakan iklan dan atau isi berbayar wajib mencantumkan keterangan "advertorial", "iklan", "ads", "sponsored", atau kata lain yang menjelaskan bahwa berita/artikel/isi tersebut adalah iklan.</p>

<h2>7. Hak Cipta</h2>
<p>Media siber wajib menghormati hak cipta sebagaimana diatur dalam peraturan perundang-undangan yang berlaku.</p>

<h2>8. Pencantuman Pedoman</h2>
<p>Media siber wajib mencantumkan Pedoman Pemberitaan Media Siber ini di medianya secara terang dan jelas.</p>

<h2>9. Sengketa</h2>
<p>Penilaian akhir atas sengketa mengenai pelaksanaan Pedoman Pemberitaan Media Siber ini diselesaikan oleh Dewan Pers.</p>

<div class="text-right text-[10px] text-gray-400 mt-6 font-mono">Jakarta, 3 Februari 2012</div>`
        };
      case "privacy-policy":
        return {
          title: "Kebijakan Privasi",
          subtitle: "Perlindungan Data & Informasi Pengunjung",
          content: `<p>Kebijakan Privasi ini menjelaskan bagaimana <strong>Poros Madura</strong> mengumpulkan, mengelola, dan melindungi data pribadi pembaca ketika menggunakan layanan portal berita kami.</p>

<h2>Informasi Yang Kami Kumpulkan</h2>
<p>Kami mengumpulkan data kunjungan berupa cookies untuk melacak analytics jumlah pembaca, preferensi bahasa, iklan kontekstual, serta alamat email bagi pembaca yang mendaftar ke newsletter resmi kami.</p>

<h2>Perlindungan Data</h2>
<p>Poros Madura berkomitmen untuk menjaga keamanan data pembaca dan tidak akan pernah menjual, menyewakan, atau menyebarkan data tersebut kepada pihak ketiga tanpa persetujuan tertulis dari pengguna.</p>`
        };
      case "dispute-contact":
        return {
          title: "Kontak Kami",
          subtitle: "Pengaduan Sengketa & Info Bisnis",
          content: `<p>Hubungi meja redaksi Poros Madura untuk pengaduan sengketa pers, hak koreksi, ralat, maupun keperluan bisnis/iklan:</p>
<p><strong>Alamat Kantor Redaksi:</strong><br/>Gedung Poros Madura Lt. 12-15, Jalan Jend. Sudirman No. 50, Jakarta</p>
<p><strong>Telepon:</strong> (021) 555-0199<br/><strong>Email:</strong> redaksi@porosmadura.com / info@porosmadura.com</p>`
        };
      case "rss":
        return {
          title: "RSS Feed",
          subtitle: "Langganan Sindikasi Berita Poros Madura",
          content: `<p>Ikuti pembaruan berita terbaru dari Poros Madura secara real-time melalui RSS Feed kami. Anda dapat menggunakan pembaca RSS (Feed Reader) favorit Anda seperti Feedly, Inoreader, atau Netvibes untuk mendapatkan informasi terkini langsung tanpa harus membuka situs.</p>`
        };
      default:
        return {
          title: "Halaman Baru",
          subtitle: "Deskripsi halaman baru",
          content: "<p>Tulis isi konten halaman baru di sini.</p>"
        };
    }
  };

  const handleOpenEditor = (p: PageItem) => {
    const key = getPageKey(p.slug);
    const dbPage = settings?.staticPages?.[key];
    const defaultData = getDefaultData(p.slug);

    setEditingPage(p);
    setEditedTitle(dbPage?.title || defaultData.title);
    setEditedSubtitle(dbPage?.subtitle || defaultData.subtitle);
    setEditedContent(dbPage?.content || defaultData.content);
  };

  const handleSave = async () => {
    if (!editingPage) return;
    try {
      setSaving(true);
      const key = getPageKey(editingPage.slug);
      
      const updatedStaticPages = {
        ...(settings?.staticPages || {}),
        [key]: {
          title: editedTitle,
          subtitle: editedSubtitle,
          content: editedContent
        }
      };

      // Jalankan request API dan delay buatan secara paralel (min 800ms)
      const apiPromise = adminApi.put<any>("/api/settings", {
        staticPages: updatedStaticPages
      });
      const delayPromise = new Promise(resolve => setTimeout(resolve, 800));

      const [res] = await Promise.all([apiPromise, delayPromise]);

      if (res && res.success) {
        setSettings(res.data);
        setEditingPage(null); // Close modal after the delay completes
        showToast("Konten halaman statis berhasil disimpan ke database!", "success");
      }
    } catch (err) {
      console.error("Failed to save static page data", err);
      showToast("Gagal mensinkronisasikan perubahan terbaru ke server. Pastikan server backend & database Anda aktif.", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 20 }} className="animate-fade-in">
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", margin: 0, letterSpacing: -0.5 }}>
          Core Static Pages Manager (Legal &amp; Press Disclosures)
        </h1>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "4px 0 0" }}>
          Kelola halaman editorial statis wajib standar Dewan Pers Indonesia dan halaman legalitas hukum lainnya secara dinamis
        </p>
      </div>

      {/* Mandatory alert block */}
      <div style={{
        background: "var(--brand-subtle)", border: "1px solid var(--brand)",
        borderRadius: 10, padding: 14, display: "flex", gap: 10, alignItems: "flex-start"
      }}>
        <HelpCircle size={16} style={{ color: "var(--brand)", flexShrink: 0, marginTop: 2 }} />
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: "var(--brand)", margin: "0 0 2px" }}>Standar Verifikasi Dewan Pers</p>
          <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0 }}>
            Sebagai media pers resmi, halaman <strong style={{ color: "var(--text-primary)" }}>Pedoman Pemberitaan Media Siber</strong> dan <strong style={{ color: "var(--text-primary)" }}>Susunan Redaksi</strong> wajib dalam keadaan terbit dan mudah diakses oleh pembaca umum. Anda dapat menyunting konten halaman-halaman tersebut secara dinamis.
          </p>
        </div>
      </div>

      {/* Pages table grid */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
        {/* Table header */}
        <div style={{
          display: "grid", gridTemplateColumns: "2fr 1.5fr 120px 100px 100px",
          gap: 12, padding: "10px 16px",
          background: "var(--bg-subtle)", borderBottom: "1px solid var(--border)",
        }}>
          {["Nama Halaman", "URL Slug", "Status", "Kategori", "Aksi"].map(h => (
            <span key={h} style={{ fontSize: 11, fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</span>
          ))}
        </div>

        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "40px", gap: 8, color: "var(--text-secondary)" }}>
            <Loader2 size={16} className="animate-spin" />
            <span style={{ fontSize: 12 }}>Memuat data halaman...</span>
          </div>
        ) : (
          pages.map((p, i) => {
            const key = getPageKey(p.slug);
            const isEdited = !!settings?.staticPages?.[key];
            return (
              <div key={p.id} style={{
                display: "grid", gridTemplateColumns: "2fr 1.5fr 120px 100px 100px",
                gap: 12, padding: "14px 16px", alignItems: "center",
                borderBottom: i < pages.length - 1 ? "1px solid var(--border)" : "none",
              }}>
                {/* Page name */}
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <FileText size={15} style={{ color: "var(--text-tertiary)" }} />
                  <div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{p.name}</span>
                    {isEdited && (
                      <span style={{ fontSize: 9, fontWeight: 700, color: "var(--green)", background: "var(--green-subtle)", padding: "1px 5px", borderRadius: 4, marginLeft: 6 }}>Custom</span>
                    )}
                  </div>
                </div>

                {/* Slug */}
                <span style={{ fontSize: 12, fontFamily: "monospace", color: "var(--text-secondary)" }}>{p.slug}</span>

                {/* Status */}
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 4,
                  fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 20,
                  background: p.status === "Published" ? "var(--green-subtle)" : "var(--bg-muted)",
                  color: p.status === "Published" ? "var(--green)" : "var(--text-secondary)",
                }}>
                  <div style={{ width: 5, height: 5, borderRadius: "50%", background: "currentColor" }} />
                  {p.status}
                </span>

                {/* Category Mandatory badge */}
                <div>
                  {p.mandatory ? (
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: "3px 7px", borderRadius: 6,
                      background: "var(--brand-subtle)", color: "var(--brand)"
                    }}>Dewan Pers</span>
                  ) : (
                    <span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>Statis</span>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: 5 }}>
                  <button 
                    onClick={() => handleOpenEditor(p)}
                    style={{ padding: "5px 8px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--bg-subtle)", color: "var(--text-secondary)", cursor: "pointer" }}
                    title="Edit Konten Halaman"
                  >
                    <Edit2 size={12} />
                  </button>
                  <button 
                    onClick={() => window.open(p.slug, '_blank')}
                    style={{ padding: "5px 8px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--bg-subtle)", color: "var(--text-tertiary)", cursor: "pointer" }}
                    title="Pratinjau Halaman"
                  >
                    <Eye size={12} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Editor Modal Overlay */}
      {editingPage && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-all duration-300 animate-fade-in">
          <div className="bg-white border border-slate-100 rounded-3xl w-full max-w-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden transform scale-100 transition-all duration-300 animate-scale-up">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
              <div>
                <span className="text-[10px] font-bold text-[#0D2B5C] uppercase tracking-widest block mb-1">SUNTING HALAMAN STATIS</span>
                <h3 className="text-lg font-black text-slate-800 tracking-tight leading-none">{editingPage.name}</h3>
              </div>
              <button 
                onClick={() => setEditingPage(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form Content */}
            <div className="p-6 overflow-y-auto flex flex-col gap-5">
              {/* Slug info */}
              <div className="bg-slate-50/80 border border-slate-100 px-4 py-3 rounded-2xl flex justify-between items-center text-xs">
                <span className="font-medium text-slate-500">URL Halaman Publik:</span>
                <span className="font-mono font-bold text-[#0D2B5C] bg-[#0D2B5C]/5 px-2.5 py-1 rounded-lg">{editingPage.slug}</span>
              </div>

              {/* Title Input */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Judul Halaman (H1)</label>
                <input 
                  type="text" 
                  value={editedTitle} 
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:border-[#0D2B5C] focus:ring-1 focus:ring-[#0D2B5C] rounded-xl px-4 py-3 text-sm text-slate-800 outline-none transition-all"
                  placeholder="Masukkan judul utama halaman..."
                />
              </div>

              {/* Subtitle Input */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Sub-Judul (Subtitle)</label>
                <input 
                  type="text" 
                  value={editedSubtitle} 
                  onChange={(e) => setEditedSubtitle(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:border-[#0D2B5C] focus:ring-1 focus:ring-[#0D2B5C] rounded-xl px-4 py-3 text-sm text-slate-800 outline-none transition-all"
                  placeholder="Masukkan sub-judul deskriptif..."
                />
              </div>

              {/* Content Textarea */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Isi Konten Halaman (Plain Text / HTML)</label>
                  <span className="text-[10px] text-slate-400 font-light">Mendukung baris baru dan elemen HTML dasar</span>
                </div>
                <textarea 
                  value={editedContent} 
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:border-[#0D2B5C] focus:ring-1 focus:ring-[#0D2B5C] rounded-xl p-4 text-sm text-slate-800 outline-none transition-all font-mono min-h-[300px] leading-relaxed resize-y"
                  placeholder="Tulis atau paste isi halaman lengkap di sini..."
                />
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
              <button 
                onClick={() => setEditingPage(null)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs sm:text-sm font-bold transition-all cursor-pointer"
                disabled={saving}
              >
                Batal
              </button>
              <button 
                onClick={handleSave}
                className="px-6 py-2.5 rounded-xl bg-[#0D2B5C] hover:bg-[#1E40AF] disabled:bg-slate-400 text-white text-xs sm:text-sm font-bold shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer min-w-[155px]"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <Save size={14} />
                    <span>Simpan Konten</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

import React from "react";
import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import { Shield, Users, HelpCircle, FileText, Phone, Mail, MapPin, ChevronLeft, Send, CheckCircle2 } from "lucide-react";

interface PortalContext {
  lang: "ID" | "EN";
}

export default function StaticPage() {
  const { pageSlug } = useParams<{ pageSlug: string }>();
  const { lang } = useOutletContext<PortalContext>();
  const navigate = useNavigate();
  const [contactSubmitted, setContactSubmitted] = React.useState(false);

  // Scroll to top on mount or slug change
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pageSlug]);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSubmitted(true);
    setTimeout(() => setContactSubmitted(false), 5000);
  };

  // Content Registry
  const getPageContent = () => {
    switch (pageSlug) {
      case "about":
        return {
          title: lang === "ID" ? "Tentang Kami" : "About Us",
          subtitle: lang === "ID" ? "Profil & Visi Misi Poros Madura" : "Profile & Vision of Poros Madura",
          icon: <FileText className="text-[#0D2B5C]" size={28} />,
          content: (
            <div className="flex flex-col gap-6 text-gray-700 leading-relaxed text-sm font-sans">
              <p>
                <strong>Poros Madura</strong> adalah portal berita digital independen nasional yang berkomitmen menyajikan informasi aktual, tajam, terpercaya, dan berimbang seputar Pulau Madura serta dinamika nasional yang relevan.
              </p>
              <p>
                Sebagai media massa digital, kami menjunjung tinggi kode etik jurnalistik dan berkomitmen untuk mencerdaskan kehidupan masyarakat melalui penyajian berita yang mendalam, independen, dan berlandaskan kebenaran fakta.
              </p>
              
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-5">
                  <h4 className="font-bold text-slate-800 text-sm mb-3 uppercase tracking-wider border-b pb-1.5 border-slate-200">
                    {lang === "ID" ? "Visi Kami" : "Our Vision"}
                  </h4>
                  <p className="text-xs text-gray-600 font-light">
                    Menjadi media rujukan informasi tepercaya di Madura yang mampu menjembatani aspirasi masyarakat lokal menuju panggung nasional melalui jurnalisme yang sehat dan mencerahkan.
                  </p>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-5">
                  <h4 className="font-bold text-slate-800 text-sm mb-3 uppercase tracking-wider border-b pb-1.5 border-slate-200">
                    {lang === "ID" ? "Misi Kami" : "Our Mission"}
                  </h4>
                  <ul className="list-disc list-inside text-xs text-gray-600 font-light flex flex-col gap-2">
                    <li>Menyajikan berita berkualitas secara cepat, akurat, dan mendalam.</li>
                    <li>Menjaga independensi pers dengan berpegang teguh pada fakta riil lapangan.</li>
                    <li>Mendukung pembangunan daerah lewat kritik yang konstruktif dan solutif.</li>
                  </ul>
                </div>
              </div>
            </div>
          )
        };

      case "editorial-board":
        return {
          title: lang === "ID" ? "Susunan Redaksi" : "Editorial Board",
          subtitle: lang === "ID" ? "Struktur Organisasi & Tim Jurnalis" : "Editorial Structure & Journalists",
          icon: <Users className="text-[#0D2B5C]" size={28} />,
          content: (
            <div className="flex flex-col gap-6 text-gray-700 text-sm font-sans">
              <p className="leading-relaxed">
                PT Poros Madura Multi Media menaungi tim jurnalis profesional berdedikasi tinggi yang tersebar di wilayah Madura (Bangkalan, Sampang, Pamekasan, Sumenep) serta koresponden nasional di Jakarta.
              </p>

              <div className="border border-slate-100 rounded-xl overflow-hidden mt-2">
                <div className="bg-[#0D2B5C]/5 border-b border-slate-100 px-4 py-3">
                  <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wider">
                    {lang === "ID" ? "Penanggung Jawab & Manajemen" : "Management Team"}
                  </h4>
                </div>
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-gray-400 font-medium uppercase text-[10px]">Penerbit (Publisher)</span>
                    <p className="font-bold text-slate-800 text-sm mt-0.5">PT Poros Madura Multi Media</p>
                  </div>
                  <div>
                    <span className="text-gray-400 font-medium uppercase text-[10px]">Pemimpin Redaksi / Penanggung Jawab</span>
                    <p className="font-bold text-slate-800 text-sm mt-0.5">Ahmad Syafi'i</p>
                  </div>
                  <div>
                    <span className="text-gray-400 font-medium uppercase text-[10px]">Redaktur Pelaksana (Managing Editor)</span>
                    <p className="font-bold text-slate-800 text-sm mt-0.5">Fatimah Z.</p>
                  </div>
                  <div>
                    <span className="text-gray-400 font-medium uppercase text-[10px]">Redaktur Senior (Editors)</span>
                    <p className="font-bold text-slate-800 text-sm mt-0.5">Rudi Santoso, Nia Kurniasih</p>
                  </div>
                </div>
              </div>

              <div className="border border-slate-100 rounded-xl overflow-hidden">
                <div className="bg-[#0D2B5C]/5 border-b border-slate-100 px-4 py-3">
                  <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wider">
                    {lang === "ID" ? "Koresponden / Reporter Daerah" : "Regional Reporters"}
                  </h4>
                </div>
                <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-gray-400 font-medium uppercase text-[10px]">Bangkalan</span>
                    <p className="font-semibold text-slate-800 mt-0.5">Samsul Arifin</p>
                  </div>
                  <div>
                    <span className="text-gray-400 font-medium uppercase text-[10px]">Sampang</span>
                    <p className="font-semibold text-slate-800 mt-0.5">Budi Hariono</p>
                  </div>
                  <div>
                    <span className="text-gray-400 font-medium uppercase text-[10px]">Pamekasan</span>
                    <p className="font-semibold text-slate-800 mt-0.5">Zainal Abidin</p>
                  </div>
                  <div>
                    <span className="text-gray-400 font-medium uppercase text-[10px]">Sumenep</span>
                    <p className="font-semibold text-slate-800 mt-0.5">Faisal R.</p>
                  </div>
                </div>
              </div>
            </div>
          )
        };

      case "cyber-media-guidelines":
        return {
          title: lang === "ID" ? "Pedoman Pemberitaan Media Siber" : "Cyber Media Guidelines",
          subtitle: lang === "ID" ? "Peraturan Dewan Pers Nomor: 1/Peraturan-DP/III/2012" : "Press Council Regulation No. 1/2012",
          icon: <Shield className="text-[#0D2B5C]" size={28} />,
          content: (
            <div className="flex flex-col gap-6 text-gray-700 text-xs sm:text-sm font-sans leading-relaxed">
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 mb-2 text-center text-xs text-slate-600">
                <p className="font-bold text-slate-800 uppercase tracking-wider mb-2">Peraturan Dewan Pers Nomor 1/Peraturan-DP/III/2012</p>
                <p className="font-semibold text-[#0D2B5C] uppercase tracking-wider mb-3">Tentang Pedoman Pemberitaan Media Siber</p>
                <p className="text-[11px] leading-relaxed max-w-2xl mx-auto font-light">
                  Kemerdekaan berpendapat, kemerdekaan berekspresi, dan kemerdekaan pers adalah hak asasi manusia yang dilindungi Pancasila, Undang-Undang Dasar 1945, dan Deklarasi Universal Hak Asasi Manusia PBB. Keberadaan media siber di Indonesia juga merupakan bagian dari kemerdekaan berpendapat, kemerdekaan berekspresi, dan kemerdekaan pers.
                </p>
                <p className="text-[11px] leading-relaxed max-w-2xl mx-auto font-light mt-2.5">
                  Media siber memiliki karakter khusus sehingga memerlukan pedoman agar pengelolaannya dapat dilaksanakan secara profesional, memenuhi fungsi, hak, dan kewajibannya sesuai Undang-Undang Nomor 40 Tahun 1999 tentang Pers dan Kode Etik Jurnalistik. Untuk itu Dewan Pers bersama organisasi pers, pengelola media siber, dan masyarakat menyusun Pedoman Pemberitaan Media Siber sebagai berikut:
                </p>
              </div>

              {/* 1. Ruang Lingkup */}
              <div className="border border-slate-100 rounded-xl p-4 sm:p-5">
                <h4 className="font-bold text-slate-850 text-sm mb-3">1. Ruang Lingkup</h4>
                <div className="flex flex-col gap-3 pl-2">
                  <div className="flex gap-2">
                    <span className="font-bold text-slate-800 shrink-0">a.</span>
                    <p>
                      <strong className="text-slate-800 font-bold">Media Siber</strong> adalah segala bentuk media yang menggunakan wahana internet dan melaksanakan kegiatan jurnalistik, serta memenuhi persyaratan Undang-Undang Pers dan Standar Perusahaan Pers yang ditetapkan Dewan Pers.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-bold text-slate-800 shrink-0">b.</span>
                    <p>
                      <strong className="text-slate-800 font-bold">Isi Buatan Pengguna (User Generated Content)</strong> adalah segala isi yang dibuat dan atau dipublikasikan oleh pengguna media siber, antara lain, artikel, gambar, komentar, suara, video dan berbagai bentuk unggahan yang melekat pada media siber, seperti blog, forum, komentar pembaca atau pemirsa, dan bentuk lain.
                    </p>
                  </div>
                </div>
              </div>

              {/* 2. Verifikasi dan keberimbangan berita */}
              <div className="border border-slate-100 rounded-xl p-4 sm:p-5">
                <h4 className="font-bold text-slate-850 text-sm mb-3">2. Verifikasi dan keberimbangan berita</h4>
                <div className="flex flex-col gap-3 pl-2">
                  <div className="flex gap-2">
                    <span className="font-bold text-slate-800 shrink-0">a.</span>
                    <p>Pada prinsipnya setiap berita harus melalui verifikasi.</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-bold text-slate-800 shrink-0">b.</span>
                    <p>Berita yang dapat merugikan pihak lain memerlukan verifikasi pada berita yang sama untuk memenuhi prinsip akurasi dan keberimbangan.</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-bold text-slate-800 shrink-0">c.</span>
                    <div>
                      <p>Ketentuan dalam butir (a) di atas dikecualikan, dengan syarat:</p>
                      <div className="pl-4 mt-2 flex flex-col gap-2 text-gray-600 text-xs sm:text-[13px]">
                        <p>1) Berita benar-benar mengandung kepentingan publik yang bersifat mendesak;</p>
                        <p>2) Sumber berita yang pertama adalah sumber yang jelas disebutkan identitasnya, kredibel dan kompeten;</p>
                        <p>3) Subyek berita yang harus dikonfirmasi tidak diketahui keberadaannya dan atau tidak dapat diwawancarai;</p>
                        <p>4) Media memberikan penjelasan kepada pembaca bahwa berita tersebut masih memerlukan verifikasi lebih lanjut yang diupayakan dalam waktu secepatnya. Penjelasan dimuat pada bagian akhir dari berita yang sama, di dalam kurung dan menggunakan huruf miring.</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-bold text-slate-800 shrink-0">d.</span>
                    <p>Setelah memuat berita sesuai dengan butir (c), media wajib meneruskan upaya verifikasi, dan setelah verifikasi didapatkan, hasil verifikasi dicantumkan pada berita pemutakhiran (update) dengan tautan pada berita yang belum terverifikasi.</p>
                  </div>
                </div>
              </div>

              {/* 3. Isi Buatan Pengguna */}
              <div className="border border-slate-100 rounded-xl p-4 sm:p-5">
                <h4 className="font-bold text-slate-850 text-sm mb-3">3. Isi Buatan Pengguna (User Generated Content)</h4>
                <div className="flex flex-col gap-3 pl-2">
                  <div className="flex gap-2">
                    <span className="font-bold text-slate-800 shrink-0">a.</span>
                    <p>Media siber wajib mencantumkan syarat dan ketentuan mengenai Isi Buatan Pengguna yang tidak bertentangan dengan Undang-Undang No. 40 tahun 1999 tentang Pers dan Kode Etik Jurnalistik, yang ditempatkan secara terang dan jelas.</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-bold text-slate-800 shrink-0">b.</span>
                    <p>Media siber mewajibkan setiap pengguna untuk melakukan registrasi keanggotaan dan melakukan proses log-in terlebih dahulu untuk dapat mempublikasikan semua bentuk Isi Buatan Pengguna. Ketentuan mengenai log-in akan diatur lebih lanjut.</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-bold text-slate-800 shrink-0">c.</span>
                    <div>
                      <p>Dalam registrasi tersebut, media siber mewajibkan pengguna memberi persetujuan tertulis bahwa Isi Buatan Pengguna yang dipublikasikan:</p>
                      <div className="pl-4 mt-2 flex flex-col gap-2 text-gray-600 text-xs sm:text-[13px]">
                        <p>1) Tidak memuat isi bohong, fitnah, sadis dan cabul;</p>
                        <p>2) Tidak memuat isi yang mengandung prasangka dan kebencian terkait dengan suku, agama, ras, dan antargolongan (SARA), serta menganjurkan tindakan kekerasan;</p>
                        <p>3) Tidak memuat isi diskriminatif atas dasar perbedaan jenis kelamin dan bahasa, serta tidak merendahkan martabat orang lemah, miskin, sakit, cacat jiwa, atau cacat jasmani.</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-bold text-slate-800 shrink-0">d.</span>
                    <p>Media siber memiliki kewenangan mutlak untuk mengedit atau menghapus Isi Buatan Pengguna yang bertentangan dengan butir (c).</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-bold text-slate-800 shrink-0">e.</span>
                    <p>Media siber wajib menyediakan mekanisme pengaduan Isi Buatan Pengguna yang dinilai melanggar ketentuan pada butir (c). Mekanisme tersebut harus disediakan di tempat yang dengan mudah dapat diakses pengguna.</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-bold text-slate-800 shrink-0">f.</span>
                    <p>Media siber wajib menyunting, menghapus, dan melakukan tindakan koreksi setiap Isi Buatan Pengguna yang dilaporkan dan melanggar ketentuan butir (c), sesegera mungkin secara proporsional selambat-lambatnya 2 x 24 jam setelah pengaduan diterima.</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-bold text-slate-800 shrink-0">g.</span>
                    <p>Media siber yang telah memenuhi ketentuan pada butir (a), (b), (c), dan (f) tidak dibebani tanggung jawab atas masalah yang ditimbulkan akibat pemuatan isi yang melanggar ketentuan pada butir (c).</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-bold text-slate-800 shrink-0">h.</span>
                    <p>Media siber bertanggung jawab atas Isi Buatan Pengguna yang dilaporkan bila tidak mengambil tindakan koreksi setelah batas waktu sebagaimana tersebut pada butir (f).</p>
                  </div>
                </div>
              </div>

              {/* 4. Ralat, Koreksi, dan Hak Jawab */}
              <div className="border border-slate-100 rounded-xl p-4 sm:p-5">
                <h4 className="font-bold text-slate-850 text-sm mb-3">4. Ralat, Koreksi, dan Hak Jawab</h4>
                <div className="flex flex-col gap-3 pl-2">
                  <div className="flex gap-2">
                    <span className="font-bold text-slate-800 shrink-0">a.</span>
                    <p>Ralat, koreksi, dan hak jawab mengacu pada Undang-Undang Pers, Kode Etik Jurnalistik, dan Pedoman Hak Jawab yang ditetapkan Dewan Pers.</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-bold text-slate-800 shrink-0">b.</span>
                    <p>Ralat, koreksi dan atau hak jawab wajib ditautkan pada berita yang diralat, dikoreksi atau yang diberi hak jawab.</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-bold text-slate-800 shrink-0">c.</span>
                    <p>Di setiap berita ralat, koreksi, dan hak jawab wajib dicantumkan waktu pemuatan ralat, koreksi, dan atau hak jawab tersebut.</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-bold text-slate-800 shrink-0">d.</span>
                    <div>
                      <p>Bila suatu berita media siber tertentu disebarluaskan media siber lain, maka:</p>
                      <div className="pl-4 mt-2 flex flex-col gap-2 text-gray-600 text-xs sm:text-[13px]">
                        <p>1) Tanggung jawab media siber pembuat berita terbatas pada berita yang dipublikasikan di media siber tersebut atau media siber yang berada di bawah otoritas teknisnya;</p>
                        <p>2) Koreksi berita yang dilakukan oleh sebuah media siber, juga harus dilakukan oleh media siber lain yang mengutip berita dari media siber yang dikoreksi itu;</p>
                        <p>3) Media yang menyebarluaskan berita dari sebuah media siber dan tidak melakukan koreksi atas berita sesuai yang dilakukan oleh media siber pemilik dan atau pembuat berita tersebut, bertanggung jawab penuh atas semua akibat hukum dari berita yang tidak dikoreksinya itu.</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-bold text-slate-800 shrink-0">e.</span>
                    <p>Sesuai dengan Undang-Undang Pers, media siber yang tidak melayani hak jawab dapat dijatuhi sanksi hukum pidana denda paling banyak Rp500.000.000 (Lima ratus juta rupiah).</p>
                  </div>
                </div>
              </div>

              {/* 5. Pencabutan Berita */}
              <div className="border border-slate-100 rounded-xl p-4 sm:p-5">
                <h4 className="font-bold text-slate-850 text-sm mb-3">5. Pencabutan Berita</h4>
                <div className="flex flex-col gap-3 pl-2">
                  <div className="flex gap-2">
                    <span className="font-bold text-slate-800 shrink-0">a.</span>
                    <p>Berita yang sudah dipublikasikan tidak dapat dicabut karena alasan penyensoran dari pihak luar redaksi, kecuali terkait masalah SARA, kesusilaan, masa depan anak, pengalaman traumatik korban atau berdasarkan pertimbangan khusus lain yang ditetapkan Dewan Pers.</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-bold text-slate-800 shrink-0">b.</span>
                    <p>Media siber lain wajib mengikuti pencabutan kutipan berita dari media asal yang telah dicabut.</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-bold text-slate-800 shrink-0">c.</span>
                    <p>Pencabutan berita wajib disertai dengan alasan pencabutan dan diumumkan kepada publik.</p>
                  </div>
                </div>
              </div>

              {/* 6. Iklan */}
              <div className="border border-slate-100 rounded-xl p-4 sm:p-5">
                <h4 className="font-bold text-slate-850 text-sm mb-3">6. Iklan</h4>
                <div className="flex flex-col gap-3 pl-2">
                  <div className="flex gap-2">
                    <span className="font-bold text-slate-800 shrink-0">a.</span>
                    <p>Media siber wajib membedakan dengan tegas antara produk berita dan iklan.</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-bold text-slate-800 shrink-0">b.</span>
                    <p>Setiap berita/artikel/isi yang merupakan iklan dan atau isi berbayar wajib mencantumkan keterangan "advertorial", "iklan", "ads", "sponsored", atau kata lain yang menjelaskan bahwa berita/artikel/isi tersebut adalah iklan.</p>
                  </div>
                </div>
              </div>

              {/* 7. Hak Cipta */}
              <div className="border border-slate-100 rounded-xl p-4 sm:p-5">
                <h4 className="font-bold text-slate-850 text-sm mb-3">7. Hak Cipta</h4>
                <p className="pl-2">Media siber wajib menghormati hak cipta sebagaimana diatur dalam peraturan perundang-undangan yang berlaku.</p>
              </div>

              {/* 8. Pencantuman Pedoman */}
              <div className="border border-slate-100 rounded-xl p-4 sm:p-5">
                <h4 className="font-bold text-slate-850 text-sm mb-3">8. Pencantuman Pedoman</h4>
                <p className="pl-2">Media siber wajib mencantumkan Pedoman Pemberitaan Media Siber ini di medianya secara terang dan jelas.</p>
              </div>

              {/* 9. Sengketa */}
              <div className="border border-slate-100 rounded-xl p-4 sm:p-5">
                <h4 className="font-bold text-slate-850 text-sm mb-3">9. Sengketa</h4>
                <p className="pl-2">Penilaian akhir atas sengketa mengenai pelaksanaan Pedoman Pemberitaan Media Siber ini diselesaikan oleh Dewan Pers.</p>
              </div>

              <div className="text-right text-[10px] text-gray-400 mt-2 font-mono">
                Jakarta, 3 Februari 2012
              </div>
            </div>
          )
        };

      case "privacy-policy":
        return {
          title: lang === "ID" ? "Kebijakan Privasi" : "Privacy Policy",
          subtitle: lang === "ID" ? "Perlindungan Data & Informasi Pengunjung" : "Data Protection & Reader Information",
          icon: <HelpCircle className="text-[#0D2B5C]" size={28} />,
          content: (
            <div className="flex flex-col gap-6 text-gray-700 text-sm font-sans leading-relaxed">
              <p>
                Kebijakan Privasi ini menjelaskan bagaimana <strong>Poros Madura</strong> mengumpulkan, mengelola, dan melindungi data pribadi pembaca ketika menggunakan layanan portal berita kami.
              </p>

              <div>
                <h4 className="font-bold text-slate-800 text-sm mb-2 uppercase tracking-wider">Informasi Yang Kami Kumpulkan</h4>
                <p className="text-xs text-gray-600 font-light">
                  Kami mengumpulkan data kunjungan berupa cookies untuk melacak analytics jumlah pembaca, preferensi bahasa, iklan kontekstual, serta alamat email bagi pembaca yang mendaftar ke newsletter resmi kami.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 text-sm mb-2 uppercase tracking-wider">Perlindungan Data</h4>
                <p className="text-xs text-gray-600 font-light">
                  Poros Madura berkomitmen untuk menjaga keamanan data pembaca dan tidak akan pernah menjual, menyewakan, atau menyebarkan data tersebut kepada pihak ketiga tanpa persetujuan tertulis dari pengguna.
                </p>
              </div>
            </div>
          )
        };

      case "dispute-contact":
      case "kontak":
        return {
          title: lang === "ID" ? "Kontak Kami" : "Contact Us",
          subtitle: lang === "ID" ? "Pengaduan Sengketa & Info Bisnis" : "Disputes & Business Inquiries",
          icon: <Phone className="text-[#0D2B5C]" size={28} />,
          content: (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 font-sans">
              {/* Form (Col 7) */}
              <div className="lg:col-span-7 bg-slate-50 border border-slate-100 rounded-2xl p-5 sm:p-6">
                {contactSubmitted ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center animate-fade-in">
                    <CheckCircle2 size={48} className="text-green-600 mb-4" />
                    <h4 className="font-bold text-slate-800 text-sm mb-1">
                      {lang === "ID" ? "Pesan Berhasil Terkirim!" : "Message Sent Successfully!"}
                    </h4>
                    <p className="text-xs text-gray-500 max-w-sm">
                      {lang === "ID" 
                        ? "Terima kasih. Pesan Anda telah diterima oleh meja redaksi. Kami akan segera menghubungi Anda kembali."
                        : "Thank you. Your message has been received. We will contact you back shortly."}
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} className="flex flex-col gap-4">
                    <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wider border-b pb-2 border-slate-200">
                      {lang === "ID" ? "Kirim Pesan Ke Redaksi" : "Send Message to Editorial Team"}
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Nama Lengkap</label>
                        <input required type="text" className="w-full bg-white border border-slate-200 px-3 py-2 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0D2B5C]" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Email</label>
                        <input required type="email" className="w-full bg-white border border-slate-200 px-3 py-2 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0D2B5C]" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Subjek / Perihal</label>
                      <input required type="text" className="w-full bg-white border border-slate-200 px-3 py-2 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0D2B5C]" />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Pesan Lengkap</label>
                      <textarea required rows={4} className="w-full bg-white border border-slate-200 p-3 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0D2B5C]" />
                    </div>

                    <button type="submit" className="bg-[#0D2B5C] hover:bg-[#1E40AF] text-white py-2 px-4 rounded-lg text-xs font-bold transition-colors cursor-pointer self-start flex items-center gap-1.5">
                      <Send size={12} />
                      <span>{lang === "ID" ? "Kirim Pesan" : "Send Message"}</span>
                    </button>
                  </form>
                )}
              </div>

              {/* Info (Col 5) */}
              <div className="lg:col-span-5 flex flex-col gap-6 text-xs sm:text-sm text-gray-600 font-light">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm mb-3 uppercase tracking-wider">Informasi Kontak</h4>
                  <ul className="flex flex-col gap-4">
                    <li className="flex gap-2 items-start">
                      <MapPin size={16} className="text-[#D71920] shrink-0 mt-0.5" />
                      <span>Gedung Poros Madura Lt. 12-15, Jalan Jend. Sudirman No. 50, Jakarta</span>
                    </li>
                    <li className="flex gap-2 items-center">
                      <Phone size={16} className="text-[#D71920] shrink-0" />
                      <span>+62 21 5550 123</span>
                    </li>
                    <li className="flex gap-2 items-center">
                      <Mail size={16} className="text-[#D71920] shrink-0" />
                      <span>redaksi@porosmadura.com</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-[#D71920]/5 border border-[#D71920]/15 rounded-xl p-4">
                  <h5 className="font-bold text-[#D71920] text-xs uppercase tracking-wider mb-1">Hak Jawab & Koreksi</h5>
                  <p className="text-xs text-gray-500 font-light">
                    Bagi pembaca yang ingin mengajukan hak jawab, sanggahan, maupun koreksi atas pemberitaan, harap menyertakan tautan berita yang dimaksud beserta bukti tertulis pendukung.
                  </p>
                </div>
              </div>
            </div>
          )
        };

      default:
        return {
          title: lang === "ID" ? "Halaman Tidak Ditemukan" : "Page Not Found",
          subtitle: lang === "ID" ? "Kesalahan Alamat URL Halaman" : "Error 404 URL",
          icon: <HelpCircle className="text-red-600" size={28} />,
          content: (
            <div className="text-center py-10 font-sans">
              <p className="text-gray-500 text-sm mb-6">
                {lang === "ID" ? "Maaf, halaman statis yang Anda tuju tidak ditemukan." : "Sorry, the static page you are looking for does not exist."}
              </p>
              <button onClick={() => navigate("/")} className="px-4 py-2 bg-[#0D2B5C] hover:bg-[#1E40AF] text-white text-xs font-bold rounded-lg cursor-pointer">
                {lang === "ID" ? "Kembali Ke Beranda" : "Back to Homepage"}
              </button>
            </div>
          )
        };
    }
  };

  const { title, subtitle, icon, content } = getPageContent();

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 bg-[#FAFAFB]">
      
      {/* Back Button */}
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-[#0D2B5C] transition-colors mb-6 cursor-pointer"
      >
        <ChevronLeft size={14} />
        <span>{lang === "ID" ? "Kembali" : "Back"}</span>
      </button>

      <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 md:p-10 shadow-xs">
        {/* Page Header */}
        <div className="flex items-center gap-4 border-b border-slate-100 pb-6 mb-8">
          <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
            {icon}
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-mono uppercase tracking-widest font-black block">
              {lang === "ID" ? "INFORMASI EDITORIAL" : "EDITORIAL INFORMATION"}
            </span>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-800 tracking-tight mt-0.5">
              {title}
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 font-light mt-0.5">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Page Content Body */}
        {content}
      </div>
    </main>
  );
}

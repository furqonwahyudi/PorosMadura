import React from "react";
import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import { Shield, Users, HelpCircle, FileText, Phone, Mail, MapPin, ChevronLeft, Send, CheckCircle2, Rss, Loader2 } from "lucide-react";

interface PortalContext {
  lang: "ID" | "EN";
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export default function StaticPage() {
  const { pageSlug } = useParams<{ pageSlug: string }>();
  const { lang } = useOutletContext<PortalContext>();
  const navigate = useNavigate();
  const [contactSubmitted, setContactSubmitted] = React.useState(false);

  const [settings, setSettings] = React.useState<any>(null);
  const [loadingSettings, setLoadingSettings] = React.useState(true);

  // RSS dynamic states
  const [categories, setCategories] = React.useState<any[]>([]);
  const [loadingCategories, setLoadingCategories] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [expandedCards, setExpandedCards] = React.useState<Record<string, boolean>>({ latest: true });
  const [toastMsg, setToastMsg] = React.useState<string | null>(null);

  // Scroll to top on mount or slug change
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pageSlug]);

  React.useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoadingSettings(true);
        const res = await fetch(`${API_URL}/api/settings`);
        const json = await res.json();
        if (json && json.success) {
          setSettings(json.data);
        }
      } catch (err) {
        console.error("Failed to load settings in static page", err);
      } finally {
        setLoadingSettings(false);
      }
    };
    fetchSettings();
  }, []);

  // Fetch categories dynamic for RSS
  React.useEffect(() => {
    if (pageSlug === "rss") {
      const fetchCategories = async () => {
        try {
          setLoadingCategories(true);
          const res = await fetch(`${API_URL}/api/categories`);
          const json = await res.json();
          if (json && json.success) {
            const list: any[] = [];
            // Flatten categories (root + children)
            json.data.forEach((cat: any) => {
              list.push({ id: cat.id, name: cat.name, slug: cat.slug });
              if (cat.children && cat.children.length > 0) {
                cat.children.forEach((child: any) => {
                  list.push({ id: child.id, name: `${cat.name} > ${child.name}`, slug: child.slug });
                });
              }
            });
            setCategories(list);
          }
        } catch (err) {
          console.error("Failed to load categories in RSS page", err);
        } finally {
          setLoadingCategories(false);
        }
      };
      fetchCategories();
    }
  }, [pageSlug]);

  // Client-side SEO update
  React.useEffect(() => {
    if (pageSlug === "rss") {
      document.title = "RSS Feed Sindikasi Berita Resmi - Poros Madura";

      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute('content', 'RSS (Really Simple Syndication) memungkinkan pembaca menerima berita terbaru Poros Madura secara otomatis melalui aplikasi RSS Reader maupun layanan agregasi berita.');

      // Canonical link
      let canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.setAttribute('rel', 'canonical');
        document.head.appendChild(canonical);
      }
      canonical.setAttribute('href', window.location.href);

      // Open Graph Tags
      const ogMeta = [
        { property: 'og:title', content: 'RSS Feed Resmi - Poros Madura' },
        { property: 'og:description', content: 'Sindikasi berita terbaru Poros Madura secara real-time via RSS Reader.' },
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: window.location.href },
        { property: 'og:image', content: `${window.location.origin}/logo.png` }
      ];

      ogMeta.forEach(meta => {
        let el = document.querySelector(`meta[property="${meta.property}"]`);
        if (!el) {
          el = document.createElement('meta');
          el.setAttribute('property', meta.property);
          document.head.appendChild(el);
        }
        el.setAttribute('content', meta.content);
      });

      // Twitter Cards
      const twitterMeta = [
        { name: 'twitter:card', content: 'summary' },
        { name: 'twitter:title', content: 'RSS Feed Resmi - Poros Madura' },
        { name: 'twitter:description', content: 'Sindikasi berita terbaru Poros Madura secara real-time via RSS Reader.' }
      ];

      twitterMeta.forEach(meta => {
        let el = document.querySelector(`meta[name="${meta.name}"]`);
        if (!el) {
          el = document.createElement('meta');
          el.setAttribute('name', meta.name);
          document.head.appendChild(el);
        }
        el.setAttribute('content', meta.content);
      });
    }
  }, [pageSlug]);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSubmitted(true);
    setTimeout(() => setContactSubmitted(false), 5000);
  };

  // Content Registry
  const getPageContent = () => {
    if (pageSlug && settings?.staticPages?.[pageSlug]) {
      const customPage = settings.staticPages[pageSlug];
      
      const renderContent = (rawContent: string) => {
        if (!rawContent) return null;
        if (rawContent.includes("<") && rawContent.includes(">")) {
          return (
            <>
              <style>{`
                .static-html-content h1 { font-size: 1.5rem; font-weight: 800; color: #1e293b; margin-top: 1.5rem; margin-bottom: 0.75rem; }
                .static-html-content h2 { font-size: 1.25rem; font-weight: 700; color: #1e293b; margin-top: 1.25rem; margin-bottom: 0.75rem; }
                .static-html-content h3 { font-size: 1.1rem; font-weight: 700; color: #1e293b; margin-top: 1rem; margin-bottom: 0.5rem; }
                .static-html-content p { margin-bottom: 1rem; color: #374151; line-height: 1.7; }
                .static-html-content ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 1rem; display: flex; flex-direction: column; gap: 0.5rem; }
                .static-html-content ol { list-style-type: decimal; padding-left: 1.5rem; margin-bottom: 1rem; display: flex; flex-direction: column; gap: 0.5rem; }
                .static-html-content li { color: #374151; }
                .static-html-content a { color: #0D2B5C; text-decoration: underline; font-weight: 600; }
                .static-html-content a:hover { color: #1E40AF; }
                .static-html-content strong { font-weight: 700; color: #1f2937; }
              `}</style>
              <div 
                className="static-html-content text-gray-700 leading-relaxed text-sm font-sans" 
                dangerouslySetInnerHTML={{ __html: rawContent }} 
              />
            </>
          );
        }
        return (
          <div className="space-y-4 text-gray-700 leading-relaxed text-sm font-sans">
            {rawContent.split("\n").map((para: string, i: number) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        );
      };

      const getIcon = (slug: string) => {
        switch (slug) {
          case "about": return <FileText className="text-[#0D2B5C]" size={28} />;
          case "editorial-board": return <Users className="text-[#0D2B5C]" size={28} />;
          case "cyber-media-guidelines": return <Shield className="text-[#0D2B5C]" size={28} />;
          case "rss": return <Rss className="text-[#0D2B5C]" size={28} />;
          case "privacy-policy": return <HelpCircle className="text-[#0D2B5C]" size={28} />;
          case "dispute-contact":
          case "kontak": return <Phone className="text-[#0D2B5C]" size={28} />;
          default: return <FileText className="text-[#0D2B5C]" size={28} />;
        }
      };

      if (pageSlug === "dispute-contact" || pageSlug === "kontak") {
        return {
          title: customPage.title,
          subtitle: customPage.subtitle,
          icon: getIcon(pageSlug),
          content: (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 font-sans">
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
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Subjek</label>
                      <input required type="text" className="w-full bg-white border border-slate-200 px-3 py-2 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0D2B5C]" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Isi Pengaduan / Pesan</label>
                      <textarea required rows={5} className="w-full bg-white border border-slate-200 px-3 py-2 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0D2B5C] resize-none" />
                    </div>
                    <button type="submit" className="bg-[#0D2B5C] hover:bg-[#1E40AF] text-white py-2.5 px-4 rounded-xl text-xs font-bold transition-colors cursor-pointer self-start flex items-center gap-1.5 mt-2">
                      <Send size={12} />
                      <span>{lang === "ID" ? "Kirim Pesan" : "Send Message"}</span>
                    </button>
                  </form>
                )}
              </div>
              <div className="lg:col-span-5 flex flex-col gap-6">
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 flex flex-col gap-4">
                  <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wider border-b pb-2 border-slate-200">
                    {lang === "ID" ? "Info Kontak Redaksi" : "Editorial Contact Info"}
                  </h4>
                  {renderContent(customPage.content)}
                </div>
              </div>
            </div>
          )
        };
      }

      if (pageSlug === "rss") {
        return {
          title: customPage.title,
          subtitle: customPage.subtitle,
          icon: getIcon(pageSlug),
          content: (
            <div className="flex flex-col gap-6 text-gray-700 text-sm font-sans leading-relaxed">
              {renderContent(customPage.content)}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 flex flex-col gap-3">
                <label className="block text-[10px] font-bold text-gray-500 uppercase">
                  {lang === "ID" ? "URL RSS Feed Resmi" : "Official RSS Feed URL"}
                </label>
                <div className="flex gap-2">
                  <input 
                    readOnly 
                    type="text" 
                    value={`${window.location.origin}/api/rss`} 
                    className="flex-1 bg-white border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-mono text-slate-800 focus:outline-none"
                  />
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/api/rss`);
                      alert(lang === "ID" ? "Link RSS disalin ke clipboard!" : "RSS Link copied to clipboard!");
                    }}
                    className="bg-[#0D2B5C] hover:bg-[#1E40AF] text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <span>{lang === "ID" ? "Salin Link" : "Copy Link"}</span>
                  </button>
                </div>
              </div>
            </div>
          )
        };
      }

      return {
        title: customPage.title,
        subtitle: customPage.subtitle,
        icon: getIcon(pageSlug),
        content: renderContent(customPage.content)
      };
    }

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
                <h4 className="font-bold text-slate-800 text-sm mb-3">1. Ruang Lingkup</h4>
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
                <h4 className="font-bold text-slate-800 text-sm mb-3">2. Verifikasi dan keberimbangan berita</h4>
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
                <h4 className="font-bold text-slate-800 text-sm mb-3">3. Isi Buatan Pengguna (User Generated Content)</h4>
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
                <h4 className="font-bold text-slate-800 text-sm mb-3">4. Ralat, Koreksi, dan Hak Jawab</h4>
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
                        <p>3) Media yang menyebarluaskan berita dari sebuah media siber and tidak melakukan koreksi atas berita sesuai yang dilakukan oleh media siber pemilik dan atau pembuat berita tersebut, bertanggung jawab penuh atas semua akibat hukum dari berita yang tidak dikoreksinya itu.</p>
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
                <h4 className="font-bold text-slate-800 text-sm mb-3">5. Pencabutan Berita</h4>
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
                <h4 className="font-bold text-slate-800 text-sm mb-3">6. Iklan</h4>
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
                <h4 className="font-bold text-slate-800 text-sm mb-3">7. Hak Cipta</h4>
                <p className="pl-2">Media siber wajib menghormati hak cipta sebagaimana diatur dalam peraturan perundang-undangan yang berlaku.</p>
              </div>

              {/* 8. Pencantuman Pedoman */}
              <div className="border border-slate-100 rounded-xl p-4 sm:p-5">
                <h4 className="font-bold text-slate-800 text-sm mb-3">8. Pencantuman Pedoman</h4>
                <p className="pl-2">Media siber wajib mencantumkan Pedoman Pemberitaan Media Siber ini di medianya secara terang dan jelas.</p>
              </div>

              {/* 9. Sengketa */}
              <div className="border border-slate-100 rounded-xl p-4 sm:p-5">
                <h4 className="font-bold text-slate-800 text-sm mb-3">9. Sengketa</h4>
                <p className="pl-2">Penilaian akhir atas sengketa mengenai pelaksanaan Pedoman Pemberitaan Media Siber ini diselesaikan oleh Dewan Pers.</p>
              </div>

              <div className="text-right text-[10px] text-gray-400 mt-2 font-mono">
                Jakarta, 3 Februari 2012
              </div>
            </div>
          )
        };
      case "rss": {
        const mainFeedUrl = `${window.location.origin}/feed`;
        const filteredCats = categories.filter(cat => 
          cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          cat.slug.toLowerCase().includes(searchQuery.toLowerCase())
        );

        const handleCopy = (url: string, name: string) => {
          navigator.clipboard.writeText(url);
          setToastMsg(`Link RSS ${name} disalin ke clipboard!`);
          setTimeout(() => setToastMsg(null), 3000);
        };

        const handleCopyAll = () => {
          const allUrls = [
            `Feed Utama: ${mainFeedUrl}`,
            ...categories.map(cat => `${cat.name}: ${window.location.origin}/category/${cat.slug}/feed`)
          ].join("\n");
          navigator.clipboard.writeText(allUrls);
          setToastMsg("Semua link RSS disalin ke clipboard!");
          setTimeout(() => setToastMsg(null), 3000);
        };

        const handleExpandAll = () => {
          const states: Record<string, boolean> = { latest: true };
          categories.forEach(cat => {
            states[cat.slug] = true;
          });
          setExpandedCards(states);
        };

        const handleCollapseAll = () => {
          setExpandedCards({});
        };

        const toggleCard = (key: string) => {
          setExpandedCards(prev => ({
            ...prev,
            [key]: !prev[key]
          }));
        };

        return {
          title: lang === "ID" ? "RSS Feed & Sindikasi Berita" : "RSS Feed & News Syndicate",
          subtitle: lang === "ID" ? "Langganan Sindikasi Berita Poros Madura" : "Poros Madura News Syndicate Subscription",
          icon: <Rss className="text-[#D71920]" size={28} />,
          content: (
            <div className="flex flex-col gap-8 text-gray-700 text-sm font-sans leading-relaxed relative">
              {/* Toast Notification */}
              {toastMsg && (
                <div className="fixed bottom-6 right-6 bg-[#0D2B5C] dark:bg-[#1E40AF] text-white text-xs px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 border border-slate-700/50 z-50 animate-bounce">
                  <CheckCircle2 size={16} className="text-orange-500" />
                  <span>{toastMsg}</span>
                </div>
              )}

              {/* Penjelasan Singkat */}
              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6">
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed font-light">
                  RSS (Really Simple Syndication) memungkinkan pembaca menerima berita terbaru Poros Madura secara otomatis melalui aplikasi RSS Reader maupun layanan agregasi berita.
                </p>
              </div>

              {/* Panduan dan Ketentuan Penggunaan (Grid 2 Kolom) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-xs">
                  <h4 className="font-extrabold text-slate-800 text-sm mb-3 uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle2 className="text-[#D71920]" size={16} />
                    Cara Menggunakan RSS
                  </h4>
                  <ul className="list-decimal pl-5 text-xs text-gray-600 flex flex-col gap-2 font-light">
                    <li>Salin URL Feed yang Anda butuhkan di bawah ini.</li>
                    <li>Tempel ke aplikasi RSS Reader.</li>
                    <li>Berita akan diperbarui otomatis setiap ada artikel baru.</li>
                  </ul>
                </div>

                <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-xs">
                  <h4 className="font-extrabold text-slate-800 text-sm mb-3 uppercase tracking-wider flex items-center gap-2">
                    <Shield className="text-[#D71920]" size={16} />
                    Ketentuan Penggunaan
                  </h4>
                  <p className="text-xs text-gray-500 font-light leading-relaxed">
                    Seluruh konten RSS merupakan milik Poros Madura. Penggunaan RSS diperbolehkan untuk membaca dan agregasi berita. Dilarang melakukan republication penuh tanpa izin tertulis dari Poros Madura.
                  </p>
                </div>
              </div>

              {/* Feed Controls (Search, Copy All, Expand, Collapse) */}
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between border-t border-slate-100 pt-6">
                {/* Search Bar */}
                <div className="relative w-full sm:max-w-xs">
                  <input 
                    type="text" 
                    placeholder="Cari kategori feed..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0D2B5C] pl-8"
                  />
                  <span className="absolute left-2.5 top-3 text-gray-400 text-xs">🔍</span>
                </div>

                {/* Batch Action Buttons */}
                <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-end">
                  <button 
                    onClick={handleCopyAll}
                    className="bg-[#0D2B5C] hover:bg-[#1E40AF] text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all cursor-pointer shadow-sm hover:shadow"
                  >
                    Copy All Feed URLs
                  </button>
                  <button 
                    onClick={handleExpandAll}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-2 rounded-xl transition-all cursor-pointer"
                  >
                    Expand All
                  </button>
                  <button 
                    onClick={handleCollapseAll}
                    className="bg-slate-150 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-2 rounded-xl transition-all cursor-pointer"
                  >
                    Collapse All
                  </button>
                </div>
              </div>

              {/* Feeds List */}
              <div className="flex flex-col gap-4">
                {/* ── 1. Feed Utama (Latest News) ── */}
                <div className="border border-slate-150 rounded-2xl overflow-hidden transition-all shadow-xs hover:border-[#D71920]/40">
                  <div 
                    onClick={() => toggleCard("latest")}
                    className="bg-slate-50/50 p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-orange-100 rounded-xl text-orange-600 shrink-0">
                        <Rss size={18} />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-slate-800 text-sm">Feed Utama (Latest News)</h4>
                        <span className="text-[10px] text-gray-400 font-mono">{mainFeedUrl}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 select-none">
                        {expandedCards["latest"] ? "▲" : "▼"}
                      </span>
                    </div>
                  </div>

                  {expandedCards["latest"] && (
                    <div className="p-4 border-t border-slate-100 bg-white flex flex-col gap-3">
                      <p className="text-xs text-gray-500 font-light">
                        Sindikasi berita utama terlengkap dari Poros Madura. Dapatkan update real-time langsung dari seluruh kategori berita dalam satu feed terpadu.
                      </p>
                      <div className="flex gap-2 w-full mt-1">
                        <input 
                          readOnly 
                          type="text" 
                          value={mainFeedUrl} 
                          className="flex-1 bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg text-xs font-mono text-slate-800 focus:outline-none"
                        />
                        <button 
                          onClick={() => handleCopy(mainFeedUrl, "Feed Utama")}
                          className="bg-[#0D2B5C] hover:bg-[#1E40AF] text-white px-3 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                        >
                          Copy
                        </button>
                        <a 
                          href={mainFeedUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-lg text-xs font-bold transition-colors flex items-center justify-center text-center font-bold"
                        >
                          Open
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {/* ── 2. Feed Kategori (Dinamis dari Database) ── */}
                {loadingCategories ? (
                  <div className="flex items-center justify-center py-10 text-gray-400 gap-2">
                    <Loader2 className="animate-spin text-[#0D2B5C]" size={20} />
                    <span className="text-xs">Memuat daftar kategori...</span>
                  </div>
                ) : filteredCats.length === 0 ? (
                  <div className="text-center py-10 text-gray-400 text-xs font-light">
                    Tidak ditemukan kategori feed yang cocok dengan pencarian Anda.
                  </div>
                ) : (
                  filteredCats.map(cat => {
                    const catFeedUrl = `${window.location.origin}/category/${cat.slug}/feed`;
                    const isExpanded = expandedCards[cat.slug] || false;

                    return (
                      <div key={cat.id} className="border border-slate-150 rounded-2xl overflow-hidden transition-all shadow-xs hover:border-[#D71920]/40">
                        <div 
                          onClick={() => toggleCard(cat.slug)}
                          className="bg-slate-50/50 p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-orange-50 rounded-xl text-orange-500 shrink-0">
                              <Rss size={18} />
                            </div>
                            <div>
                              <h4 className="font-extrabold text-slate-800 text-sm">Feed Kategori: {cat.name}</h4>
                              <span className="text-[10px] text-gray-400 font-mono">{catFeedUrl}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400 select-none">
                              {isExpanded ? "▲" : "▼"}
                            </span>
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="p-4 border-t border-slate-100 bg-white flex flex-col gap-3">
                            <p className="text-xs text-gray-500 font-light">
                              Sindikasi berita khusus untuk kategori <strong>{cat.name}</strong> di Poros Madura. Berlangganan feed ini jika Anda hanya ingin memantau topik ini secara spesifik.
                            </p>
                            <div className="flex gap-2 w-full mt-1">
                              <input 
                                readOnly 
                                type="text" 
                                value={catFeedUrl} 
                                className="flex-1 bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg text-xs font-mono text-slate-800 focus:outline-none"
                              />
                              <button 
                                onClick={() => handleCopy(catFeedUrl, `Kategori ${cat.name}`)}
                                className="bg-[#0D2B5C] hover:bg-[#1E40AF] text-white px-3 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                              >
                                Copy
                              </button>
                              <a 
                                href={catFeedUrl} 
                                target="_blank" 
                                rel="noreferrer"
                                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-lg text-xs font-bold transition-colors flex items-center justify-center text-center font-bold"
                              >
                                Open
                              </a>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )
        };
      }
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

  if (loadingSettings) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-[#FAFAFB] flex flex-col items-center justify-center min-h-[300px] text-gray-400 gap-3">
        <Loader2 className="animate-spin text-[#0D2B5C]" size={28} />
        <span className="text-xs font-sans">Memuat halaman...</span>
      </main>
    );
  }

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

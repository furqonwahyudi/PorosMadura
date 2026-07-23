import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Send, Phone, Mail, MapPin, Facebook, Instagram, Twitter, Youtube, Award, ShieldCheck, Rss } from "lucide-react";
import logoPutihUrl from "@/Logo_Type_trans_Putih.png";
import suramaduUrl from "@/suramadu.png";

interface PortalFooterProps {
  lang: "ID" | "EN";
}

export default function PortalFooter({ lang }: PortalFooterProps) {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);

    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() })
      });
      if (res.ok) {
        setSubscribed(true);
        setEmail("");
      }
    } catch (e) {
      console.error("Subscription failed", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="relative overflow-hidden w-full bg-[#061229] text-white pt-16 pb-8 border-t-4 border-[#D71920]">
      {/* Suramadu Bridge Image Background */}
      <div className="absolute inset-0 w-full h-full pointer-events-none select-none z-0 overflow-hidden">
        <img 
          src={suramaduUrl} 
          alt="Suramadu Bridge Background" 
          className="w-full h-full object-cover object-bottom opacity-40"
          referrerPolicy="no-referrer"
        />
        {/* Gradient overlay to fade the image nicely towards the top and ensure extreme readability for footer text */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#061229]/95 via-[#0D2B5C]/75 to-[#050e20]/95" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* Column 1: Brand Info Links */}
          <div className="flex flex-col gap-4">
            <img src={logoPutihUrl} alt="Poros Madura" className="h-10 sm:h-12 w-auto object-contain self-start" />
            <div className="flex flex-col gap-2.5 text-xs text-gray-400 font-sans mt-2">
              <Link to="/pages/about" className="hover:text-white transition-colors">
                {lang === "ID" ? "Tentang Kami" : "About Us"}
              </Link>
              <Link to="/pages/editorial-board" className="hover:text-white transition-colors">
                {lang === "ID" ? "Susunan Redaksi" : "Editorial Board"}
              </Link>
              <Link to="/pages/cyber-media-guidelines" className="hover:text-white transition-colors">
                {lang === "ID" ? "Pedoman Media Siber" : "Cyber Media Guidelines"}
              </Link>
              <Link to="/pages/dispute-contact" className="hover:text-white transition-colors">
                {lang === "ID" ? "Kontak Kami" : "Contact Us"}
              </Link>
              <Link to="/pages/privacy-policy" className="hover:text-white transition-colors">
                {lang === "ID" ? "Kebijakan Privasi" : "Privacy Policy"}
              </Link>
              <Link to="/pages/rss" className="hover:text-white transition-colors">
                RSS
              </Link>
              <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                Sitemap
              </a>
            </div>
          </div>

          {/* Column 2: Categories Guide */}
          <div>
            <h4 className="text-sm font-bold tracking-wider uppercase text-[#D71920] mb-5">
              {lang === "ID" ? "Kategori Utama" : "Top Categories"}
            </h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-gray-400">
              {/* Daerah */}
              <Link to="/bangkalan" className="hover:text-white transition-colors">Bangkalan</Link>
              <Link to="/sampang" className="hover:text-white transition-colors">Sampang</Link>
              <Link to="/pamekasan" className="hover:text-white transition-colors">Pamekasan</Link>
              <Link to="/sumenep" className="hover:text-white transition-colors">Sumenep</Link>

              {/* Nasional */}
              <Link to="/politik" className="hover:text-white transition-colors">Politik</Link>
              <Link to="/pemerintahan" className="hover:text-white transition-colors">Pemerintahan</Link>
              <Link to="/hukum" className="hover:text-white transition-colors">Hukum</Link>
              <Link to="/kriminal" className="hover:text-white transition-colors">Kriminal</Link>
              <Link to="/pendidikan" className="hover:text-white transition-colors">Pendidikan</Link>
              <Link to="/kesehatan" className="hover:text-white transition-colors">Kesehatan</Link>
              <Link to="/ekonomi" className="hover:text-white transition-colors">Ekonomi</Link>
              <Link to="/olahraga" className="hover:text-white transition-colors">Olahraga</Link>

              {/* Rubrik & Lainnya */}
              <Link to="/teknologi" className="hover:text-white transition-colors">Teknologi</Link>
              <Link to="/otomotif" className="hover:text-white transition-colors">Otomotif</Link>
              <Link to="/lifestyle" className="hover:text-white transition-colors">Lifestyle</Link>
              <Link to="/budaya" className="hover:text-white transition-colors">Budaya</Link>
              <Link to="/wisata" className="hover:text-white transition-colors">Wisata</Link>
              <Link to="/kuliner" className="hover:text-white transition-colors">Kuliner</Link>
              <Link to="/hiburan" className="hover:text-white transition-colors">Hiburan</Link>
              <Link to="/opini" className="hover:text-white transition-colors">Opini</Link>
            </div>
          </div>

          {/* Column 3: Redaksi / Contact */}
          <div>
            <h4 className="text-sm font-bold tracking-wider uppercase text-[#D71920] mb-5">
              {lang === "ID" ? "Hubungi Redaksi" : "Contact Redaksi"}
            </h4>
            <ul className="flex flex-col gap-3.5 text-xs text-gray-400">
              <li className="flex items-start gap-2.5">
                <MapPin size={16} className="text-[#D71920] shrink-0 mt-0.5" />
                <span>Gedung Poros Madura Lt. 12-15, Jalan Jend. Sudirman No. 50, Jakarta</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone size={16} className="text-[#D71920] shrink-0" />
                <span>+62 21 5550 123</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail size={16} className="text-[#D71920] shrink-0" />
                <span>redaksi@porosmadura.com</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter Automation */}
          <div>
            <h4 className="text-sm font-bold tracking-wider uppercase text-[#D71920] mb-5">
              NEWSLETTER
            </h4>
            <p className="text-gray-400 text-xs leading-relaxed mb-4">
              {lang === "ID" 
                ? "Dapatkan rangkuman berita terpenting dan kurasi pilihan redaksi langsung di kotak masuk email Anda setiap pagi."
                : "Get a summary of the most important news curated directly to your email inbox every single morning."
              }
            </p>
            {subscribed ? (
              <div className="bg-green-900/30 border border-green-700/50 rounded-lg p-3 text-center">
                <span className="text-xs text-green-400 font-semibold block">🎉 Langganan Berhasil!</span>
                <span className="text-[10px] text-gray-400 block mt-0.5">Kami akan mengirimkan kurasi berita berkualitas.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  required
                  placeholder="name@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#D71920] focus:border-[#D71920]"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#D71920] hover:bg-[#D71920]/95 text-white px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center disabled:opacity-50"
                >
                  {loading ? "..." : <Send size={14} />}
                </button>
              </form>
            )}
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 pt-8 mt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-400">
          <div>
            <span>&copy; {new Date().getFullYear()} POROS MADURA. All Rights Reserved. Terdaftar di Dewan Pers.</span>
          </div>

          {/* Social icons */}
          <div className="flex items-center gap-3">
            <a href="#" className="hover:text-white transition-colors"><Facebook size={16} /></a>
            <a href="#" className="hover:text-white transition-colors"><Instagram size={16} /></a>
            <a href="#" className="hover:text-white transition-colors"><Twitter size={16} /></a>
            <a href="#" className="hover:text-white transition-colors"><Youtube size={16} /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}

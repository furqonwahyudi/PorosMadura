import React, { useState } from "react";
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
          
          {/* Column 1: Brand Intro */}
          <div className="flex flex-col gap-4">
            <img src={logoPutihUrl} alt="Poros Madura" className="h-10 sm:h-12 w-auto object-contain self-start" />
            <p className="text-gray-400 text-xs leading-relaxed">
              {lang === "ID" 
                ? "Poros Madura adalah media portal berita digital nasional berkomitmen menyajikan kebenaran informasi terpercaya, aktual, akurat, tajam, serta menjunjung tinggi pilar jurnalisme berdaulat."
                : "Poros Madura is a national digital news portal committed to presenting trustworthy, actual, accurate, and sharp information, upholding the pillars of sovereign journalism."
              }
            </p>
            {/* Quality Badges */}
            <div className="flex gap-4 mt-2">
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <ShieldCheck size={16} className="text-[#D71920]" />
                <span>Dewan Pers Terverifikasi</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <Award size={16} className="text-[#D71920]" />
                <span>Google News Ready</span>
              </div>
            </div>
          </div>

          {/* Column 2: Categories Guide */}
          <div>
            <h4 className="text-sm font-bold tracking-wider uppercase text-[#D71920] mb-5">
              {lang === "ID" ? "Kategori Utama" : "Top Categories"}
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
              <a href="#" className="hover:text-white transition-colors">Politik</a>
              <a href="#" className="hover:text-white transition-colors">Nasional</a>
              <a href="#" className="hover:text-white transition-colors">Ekonomi</a>
              <a href="#" className="hover:text-white transition-colors">Teknologi</a>
              <a href="#" className="hover:text-white transition-colors">Olahraga</a>
              <a href="#" className="hover:text-white transition-colors">Lifestyle</a>
              <a href="#" className="hover:text-white transition-colors">Kesehatan</a>
              <a href="#" className="hover:text-white transition-colors">Opini</a>
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

          {/* Social icons & SEO Links */}
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-3">
              <a href="#" className="hover:text-white transition-colors"><Facebook size={16} /></a>
              <a href="#" className="hover:text-white transition-colors"><Instagram size={16} /></a>
              <a href="#" className="hover:text-white transition-colors"><Twitter size={16} /></a>
              <a href="#" className="hover:text-white transition-colors"><Youtube size={16} /></a>
            </div>
            
            <span className="text-white/20">|</span>

            <div className="flex gap-4">
              <a href="#" className="hover:text-white transition-colors flex items-center gap-1">
                <Rss size={12} />
                <span>RSS</span>
              </a>
              <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Sitemap XML</a>
              <a href="#" className="hover:text-white transition-colors">Pedoman Redaksi</a>
              <a href="#" className="hover:text-white transition-colors">Siber Rule</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

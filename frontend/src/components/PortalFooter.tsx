import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Send, Phone, Mail, MapPin, Globe, Facebook, Instagram, Twitter, Youtube, Award, ShieldCheck, Rss } from "lucide-react";
import logoPutihUrl from "@/Logo_Type_trans_Putih.png";
import suramaduUrl from "@/suramadu.png";

interface PortalFooterProps {
  lang: "ID" | "EN";
}

export default function PortalFooter({ lang }: PortalFooterProps) {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dbCategories, setDbCategories] = useState<any[]>([]);

  React.useEffect(() => {
    let active = true;
    const loadCategories = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "" : "http://localhost:3001")}/api/categories`);
        const json = await res.json();
        if (json && json.success && active) {
          setDbCategories(json.data);
        }
      } catch (err) {
        console.error("Gagal memuat kategori footer:", err);
      }
    };
    loadCategories();
    return () => {
      active = false;
    };
  }, []);

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 mb-12">
          
          {/* Column 1: LOGO & BRAND */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <img src={logoPutihUrl} alt="Poros Madura" className="h-10 sm:h-12 w-auto object-contain self-start" />
            <p className="text-gray-400 text-xs leading-relaxed">
              Portal berita independen yang menyajikan informasi aktual dan terpercaya.
            </p>
            <div className="flex items-center gap-3.5 mt-2">
              <a href="#" className="text-gray-400 hover:text-white transition-colors" title="Facebook"><Facebook size={16} /></a>
              <a href="#" className="text-gray-400 hover:text-[#E1306C] transition-colors" title="Instagram"><Instagram size={16} /></a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors" title="TikTok">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" className="shrink-0">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.02-2.89-.35-4.15-1.11-.13-.07-.24-.17-.37-.25V14.5c0 2.11-.53 4.31-2.02 5.79-1.57 1.57-3.95 2.16-6.13 1.74-2.48-.48-4.66-2.58-5.11-5.09-.64-3.56 1.82-7.14 5.37-7.61.85-.11 1.71-.05 2.54.17V13.6c-.6-.24-1.29-.31-1.92-.12-1.07.31-1.85 1.37-1.86 2.49.02 1.34 1.25 2.51 2.59 2.37 1.21-.13 2.12-1.17 2.13-2.39l.02-15.93z" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-[#FF0000] transition-colors" title="YouTube"><Youtube size={16} /></a>
            </div>
          </div>

          {/* Part 2: CATEGORIES & LINKS */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:flex lg:flex-row lg:justify-start lg:gap-14 gap-8">
            
            {/* Column 2: DAERAH */}
            <div>
              <h4 className="text-sm font-bold tracking-wider uppercase text-[#D71920] mb-3">
                {lang === "ID" ? "Daerah" : "Regions"}
              </h4>
              <div className="flex flex-col gap-2 text-xs text-gray-400">
                {dbCategories.length > 0 ? (
                  dbCategories
                    .filter(c => ["bangkalan", "sampang", "pamekasan", "sumenep"].includes(c.slug?.toLowerCase()))
                    .sort((a, b) => {
                      const order = ["bangkalan", "sampang", "pamekasan", "sumenep"];
                      return order.indexOf(a.slug?.toLowerCase()) - order.indexOf(b.slug?.toLowerCase());
                    })
                    .map(c => (
                      <Link key={c.id} to={`/${c.slug}`} className="hover:text-white transition-colors">
                        {c.name}
                      </Link>
                    ))
                ) : (
                  <>
                    <Link to="/bangkalan" className="hover:text-white transition-colors">Bangkalan</Link>
                    <Link to="/sampang" className="hover:text-white transition-colors">Sampang</Link>
                    <Link to="/pamekasan" className="hover:text-white transition-colors">Pamekasan</Link>
                    <Link to="/sumenep" className="hover:text-white transition-colors">Sumenep</Link>
                  </>
                )}
              </div>
            </div>

            {/* Column 3: NASIONAL */}
            <div>
              <h4 className="text-sm font-bold tracking-wider uppercase text-[#D71920] mb-3">
                Nasional
              </h4>
              <div className="flex flex-col gap-2 text-xs text-gray-400">
                {dbCategories.length > 0 ? (
                  dbCategories
                    .filter(c => ["politik", "pemerintahan", "hukum", "kriminal", "ekonomi", "pendidikan", "kesehatan"].includes(c.slug?.toLowerCase()))
                    .sort((a, b) => {
                      const order = ["politik", "pemerintahan", "hukum", "kriminal", "ekonomi", "pendidikan", "kesehatan"];
                      return order.indexOf(a.slug?.toLowerCase()) - order.indexOf(b.slug?.toLowerCase());
                    })
                    .map(c => (
                      <Link key={c.id} to={`/${c.slug}`} className="hover:text-white transition-colors">
                        {c.name}
                      </Link>
                    ))
                ) : (
                  <>
                    <Link to="/politik" className="hover:text-white transition-colors">Politik</Link>
                    <Link to="/pemerintahan" className="hover:text-white transition-colors">Pemerintahan</Link>
                    <Link to="/hukum" className="hover:text-white transition-colors">Hukum</Link>
                    <Link to="/kriminal" className="hover:text-white transition-colors">Kriminal</Link>
                    <Link to="/ekonomi" className="hover:text-white transition-colors">Ekonomi</Link>
                    <Link to="/pendidikan" className="hover:text-white transition-colors">Pendidikan</Link>
                    <Link to="/kesehatan" className="hover:text-white transition-colors">Kesehatan</Link>
                  </>
                )}
              </div>
            </div>

            {/* Column 4: LAINNYA */}
            <div className="font-sans">
              <h4 className="text-sm font-bold tracking-wider uppercase text-[#D71920] mb-3">
                {lang === "ID" ? "Lainnya" : "Others"}
              </h4>
              <div className="flex flex-col gap-2 text-xs text-gray-400">
                {dbCategories.length > 0 ? (
                  dbCategories
                    .filter(c => ["olahraga", "teknologi", "otomotif", "lifestyle", "budaya", "wisata", "kuliner", "hiburan", "opini"].includes(c.slug?.toLowerCase()))
                    .sort((a, b) => {
                      const order = ["olahraga", "teknologi", "otomotif", "lifestyle", "budaya", "wisata", "kuliner", "hiburan", "opini"];
                      return order.indexOf(a.slug?.toLowerCase()) - order.indexOf(b.slug?.toLowerCase());
                    })
                    .map(c => (
                      <Link key={c.id} to={`/${c.slug}`} className="hover:text-white transition-colors">
                        {c.name}
                      </Link>
                    ))
                ) : (
                  <>
                    <Link to="/olahraga" className="hover:text-white transition-colors">Olahraga</Link>
                    <Link to="/teknologi" className="hover:text-white transition-colors">Teknologi</Link>
                    <Link to="/otomotif" className="hover:text-white transition-colors">Otomotif</Link>
                    <Link to="/lifestyle" className="hover:text-white transition-colors">Lifestyle</Link>
                    <Link to="/budaya" className="hover:text-white transition-colors">Budaya</Link>
                    <Link to="/wisata" className="hover:text-white transition-colors">Wisata</Link>
                    <Link to="/kuliner" className="hover:text-white transition-colors">Kuliner</Link>
                    <Link to="/hiburan" className="hover:text-white transition-colors">Hiburan</Link>
                    <Link to="/opini" className="hover:text-white transition-colors">Opini</Link>
                  </>
                )}
              </div>
            </div>

            {/* Column 5: INFORMASI */}
            <div>
              <h4 className="text-sm font-bold tracking-wider uppercase text-[#D71920] mb-3">
                {lang === "ID" ? "Informasi" : "Information"}
              </h4>
              <div className="flex flex-col gap-2 text-xs text-gray-400">
                {[
                  { name: "Tentang Kami", path: "/pages/about" },
                  { name: "Redaksi", path: "/pages/editorial-board" },
                  { name: "Pedoman Media Siber", path: "/pages/cyber-media-guidelines" },
                  { name: "Kode Etik", path: "/pages/kode-etik" },
                  { name: "Disclaimer", path: "/pages/disclaimer" },
                  { name: "Privasi", path: "/pages/privacy-policy" },
                  { name: "Hubungi Kami", path: "/pages/dispute-contact" },
                  { name: "RSS", path: "/pages/rss" },
                  { name: "Sitemap", path: "/sitemap.xml", isExternal: true }
                ].map(item => {
                  if (item.isExternal) {
                    return (
                      <a key={item.name} href={item.path} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                        {item.name}
                      </a>
                    );
                  }
                  return (
                    <Link key={item.name} to={item.path} className="hover:text-white transition-colors">
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Column 6: LAYANAN */}
            <div>
              <h4 className="text-sm font-bold tracking-wider uppercase text-[#D71920] mb-3">
                {lang === "ID" ? "Layanan" : "Services"}
              </h4>
              <div className="flex flex-col gap-2 text-xs text-gray-400">
                {[
                  { name: "Pasang Iklan", path: "/pages/pasang-iklan" },
                  { name: "Media Partner", path: "/pages/media-partner" },
                  { name: "Press Release", path: "/pages/press-release" },
                  { name: "Kerja Sama", path: "/pages/kerja-sama" },
                  { name: "Hak Jawab", path: "/pages/hak-jawab" },
                  { name: "Koreksi Berita", path: "/pages/koreksi-berita" }
                ].map(item => (
                  <Link key={item.name} to={item.path} className="hover:text-white transition-colors">
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 pt-8 mt-8 flex items-center justify-center text-xs text-gray-400 text-center">
          <span>&copy; {new Date().getFullYear()} Poros Madura — Berita Tepat, Fakta Kuat.</span>
        </div>
      </div>
    </footer>
  );
}

import { Link } from "react-router-dom";
import React, { useState } from "react";
import { Article } from "../../../types";
import { getArticleUrl, formatDate, slugify } from "../../../lib/utils";
import AdManagerSlot from "../../shared/AdManagerSlot";
import AnimatedMarketRate from "../../shared/AnimatedMarketRate";
import { 
  Landmark, Cpu, Trophy, Coins, Globe, Activity, Video, Newspaper, Sparkles, BookOpen,
  TrendingUp, Hash, Calendar, Eye, Share2, ChevronRight, ChevronLeft, CheckCircle2, Mail, ShieldAlert, Clock
} from "lucide-react";

export interface PortalCategoryProps {
  lang: "ID" | "EN";
  selectedCategory: string;
  selectedSubCategory?: string | null;
  filteredArticles: Article[];
  marketRates: Record<string, any>;
  onSelectArticle: (article: Article) => void;
  selectedTag: string | null;
  setSelectedTag: React.Dispatch<React.SetStateAction<string | null>>;
}

export default function PortalCategory({
  lang,
  selectedCategory,
  selectedSubCategory,
  filteredArticles,
  marketRates,
  onSelectArticle,
  selectedTag,
  setSelectedTag
}: PortalCategoryProps) {
  const [categoryPage, setCategoryPage] = useState(1);
  const [subEmail, setSubEmail] = useState("");
  const [subSuccess, setSubSuccess] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  // --- START CATEGORY VIEW LAYOUT (DISTINCT FROM PORTAL HOME) ---
  if (selectedCategory) {
    // Icons helper
    const getCategoryIcon = (category: string) => {
      switch (category.toLowerCase()) {
        case "politik": return <Landmark className="text-indigo-600 animate-pulse" size={24} />;
        case "teknologi": return <Cpu className="text-sky-600 animate-pulse" size={24} />;
        case "olahraga": return <Trophy className="text-amber-600 animate-pulse" size={24} />;
        case "ekonomi": return <Coins className="text-emerald-600 animate-pulse" size={24} />;
        case "nasional": return <Globe className="text-red-600 animate-pulse" size={24} />;
        case "kesehatan": return <Activity className="text-rose-600 animate-pulse" size={24} />;
        case "hiburan": return <Video className="text-purple-600 animate-pulse" size={24} />;
        case "opini": case "editorial": case "kolom": return <Newspaper className="text-teal-600 animate-pulse" size={24} />;
        case "rekomendasi": return <Sparkles className="text-amber-500 animate-pulse" size={24} />;
        default: return <BookOpen className="text-slate-600 animate-pulse" size={24} />;
      }
    };

    // Theme helper
    const getCategoryTheme = (category: string) => {
      switch (category.toLowerCase()) {
        case "politik": return { text: "text-indigo-700", bg: "bg-indigo-50/70", border: "border-indigo-100", accent: "bg-indigo-600", accentText: "text-indigo-600" };
        case "teknologi": return { text: "text-sky-700", bg: "bg-sky-50/70", border: "border-sky-100", accent: "bg-sky-600", accentText: "text-sky-600" };
        case "olahraga": return { text: "text-amber-700", bg: "bg-amber-50/70", border: "border-amber-100", accent: "bg-amber-600", accentText: "text-amber-600" };
        case "ekonomi": return { text: "text-emerald-700", bg: "bg-emerald-50/70", border: "border-emerald-100", accent: "bg-emerald-600", accentText: "text-emerald-600" };
        case "nasional": return { text: "text-red-700", bg: "bg-red-50/70", border: "border-red-100", accent: "bg-red-600", accentText: "text-red-600" };
        case "kesehatan": return { text: "text-rose-700", bg: "bg-rose-50/70", border: "border-rose-100", accent: "bg-rose-600", accentText: "text-rose-600" };
        case "hiburan": return { text: "text-purple-700", bg: "bg-purple-50/70", border: "border-purple-100", accent: "bg-purple-600", accentText: "text-purple-600" };
        case "rekomendasi": return { text: "text-amber-700", bg: "bg-amber-50/70", border: "border-amber-100", accent: "bg-amber-500", accentText: "text-amber-500" };
        default: return { text: "text-[#0D2B5C]", bg: "bg-slate-50/70", border: "border-slate-100", accent: "bg-[#0D2B5C]", accentText: "text-[#0D2B5C]" };
      }
    };

    const sortedArticles = [...filteredArticles].sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());
    const spotlightArticle = sortedArticles[0];
    const gridArticles = sortedArticles.slice(1);
    
    const ITEMS_PER_PAGE_KATEGORI = 10;
    const sourceArticles = selectedTag ? filteredArticles : gridArticles;
    const totalCategoryPages = Math.ceil(sourceArticles.length / ITEMS_PER_PAGE_KATEGORI);
    const paginatedArticles = sourceArticles.slice((categoryPage - 1) * ITEMS_PER_PAGE_KATEGORI, categoryPage * ITEMS_PER_PAGE_KATEGORI);
    
    const catTheme = getCategoryTheme(selectedSubCategory || selectedCategory);
    const categoryViews = filteredArticles.reduce((sum, a) => sum + (a.views || 0), 0);
    
    const catTagsSet = new Set<string>();
    filteredArticles.forEach(a => {
      if (a.tags) a.tags.forEach(t => catTagsSet.add(t.toLowerCase()));
    });
    const categoryTags = Array.from(catTagsSet).slice(0, 10);
    const popularInCategory = [...filteredArticles].sort((a, b) => b.views - a.views).slice(0, 4);

    const getCategoryDescription = (cat: string) => {
      switch (cat.toLowerCase()) {
        case "rekomendasi": return lang === "ID" ? "Daftar artikel pilihan terbaik dan terpopuler yang direkomendasikan langsung oleh redaksi Poros Madura untuk Anda." : "A list of the best and most popular articles recommended directly for you by the Poros Madura editorial desk.";
        case "politik": return lang === "ID" ? "Analisis tajam dinamika kekuasaan, regulasi, parlemen, dan kebijakan publik nasional." : "Sharp analysis of power dynamics, regulation, parliament, and national public policy.";
        case "nasional": return lang === "ID" ? "Kumpulan peristiwa penting, pembangunan infrastruktur, dan agenda kenegaraan Republik Indonesia." : "Collection of key events, infrastructure development, and state agendas of the Republic of Indonesia.";
        case "teknologi": return lang === "ID" ? "Menjelajahi revolusi digital, kecerdasan buatan (AI), keamanan siber, dan ekosistem startup terdepan." : "Exploring digital revolution, artificial intelligence (AI), cybersecurity, and cutting-edge startup ecosystems.";
        case "olahraga": return lang === "ID" ? "Kabar terkini arena olahraga, prestasi atlet nasional di kancah dunia, dan turnamen kompetitif." : "Latest news from the sports arena, achievements of national athletes on the world stage, and competitive tournaments.";
        case "ekonomi": return lang === "ID" ? "Pergerakan pasar saham, nilai tukar mata uang, analisis makro-mikro, dan ulasan finansial taktis." : "Stock market movements, exchange rates, macro-micro analysis, and tactical financial reviews.";
        case "opini": case "editorial": case "kolom": return lang === "ID" ? "Sudut pandang kritis, esai opini mendalam, dan analisis tajam dari para akademisi serta pakar industri." : "Critical perspectives, deep opinion essays, and sharp analysis from academics and industry experts.";
        default: return lang === "ID" ? "Sajian berita berbobot, akurat, dan berlandaskan fakta yang dikurasi langsung oleh meja redaksi Poros Madura." : "Fact-based, accurate, and high-quality news reports curated directly by the Poros Madura editorial desk.";
      }
    };

    // Sidebar Category-Specific Widgets
    const renderEkonomiWidget = () => (
      <div className="bg-white rounded-xl border border-emerald-100 p-5 shadow-xs">
        <div className="flex items-center justify-between pb-2 mb-4 border-b border-emerald-50">
          <div className="flex items-center gap-2">
            <Coins className="text-emerald-600 animate-pulse" size={16} />
            <h4 className="text-xs font-black uppercase tracking-wider text-emerald-800">
              {lang === "ID" ? "DASBOR FINANSIAL REAL-TIME" : "REAL-TIME FINANCIAL DASHBOARD"}
            </h4>
          </div>
          <span className="flex items-center gap-1 bg-emerald-50 text-[9px] text-emerald-600 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
            Live
          </span>
        </div>
        
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-50/30 border border-emerald-100">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">IHSG</span>
              <span className="text-[9px] text-slate-400">{lang === "ID" ? "Indeks Gabungan" : "Composite Index"}</span>
            </div>
            <AnimatedMarketRate 
              price={marketRates.ihsg?.price ?? null} 
              change={marketRates.ihsg?.change ?? null} 
              status={marketRates.ihsg?.status ?? "stable"} 
            />
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-50/30 border border-emerald-100">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">USD / IDR</span>
              <span className="text-[9px] text-slate-400">{lang === "ID" ? "Kurs Rupiah" : "Rupiah Rate"}</span>
            </div>
            <AnimatedMarketRate 
              price={marketRates.usd?.price ?? null} 
              change={marketRates.usd?.change ?? null} 
              status={marketRates.usd?.status ?? "stable"} 
              prefix="Rp "
              isInteger={true}
            />
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-50/30 border border-emerald-100">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Emas Antam</span>
              <span className="text-[9px] text-slate-400">LM (per gram)</span>
            </div>
            <AnimatedMarketRate 
              price={marketRates.gold?.price ?? null} 
              buybackPrice={marketRates.gold?.buybackPrice ?? null}
              change={marketRates.gold?.change ?? null} 
              status={marketRates.gold?.status ?? "stable"} 
              prefix="Rp "
              isInteger={true}
            />
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-50/30 border border-emerald-100">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">IDR / SGD</span>
              <span className="text-[9px] text-slate-400">Dolar Singapura</span>
            </div>
            <AnimatedMarketRate 
              price={11245} 
              change={0} 
              status="stable" 
            />
          </div>
        </div>
        <p className="text-[9px] text-gray-400 leading-relaxed italic mt-3 text-center">
          {lang === "ID" ? "*Data diupdate otomatis setiap 15 menit." : "*Data updated automatically every 15 minutes."}
        </p>
      </div>
    );

    const renderOlahragaWidget = () => (
      <div className="bg-white rounded-xl border border-amber-100 p-5 shadow-xs">
        <div className="flex items-center justify-between pb-2 mb-4 border-b border-amber-50">
          <div className="flex items-center gap-2">
            <Trophy className="text-amber-600" size={16} />
            <h4 className="text-xs font-black uppercase tracking-wider text-amber-800">
              {lang === "ID" ? "PAPAN SKOR & KLASEMEN LIGA" : "SCOREBOARD & STANDINGS"}
            </h4>
          </div>
          <span className="bg-amber-100 text-amber-800 text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
            LIVE
          </span>
        </div>

        <div className="flex flex-col gap-3 font-sans">
          <div className="bg-amber-50/30 border border-amber-100 rounded-lg p-2.5">
            <div className="flex justify-between items-center text-[9px] text-amber-800 font-bold uppercase tracking-wider mb-1.5">
              <span>Kualifikasi Piala Dunia</span>
              <span className="text-red-600 animate-pulse font-bold">FT</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-800">Indonesia</span>
              </div>
              <span className="font-black font-mono text-slate-900 bg-amber-100/60 px-2 py-0.5 rounded text-xs">3 - 1</span>
              <div className="flex items-center gap-1.5 text-right justify-end">
                <span className="font-bold text-slate-800">Arab Saudi</span>
              </div>
            </div>
          </div>

          <div className="bg-amber-50/30 border border-amber-100 rounded-lg p-2.5">
            <div className="flex justify-between items-center text-[9px] text-amber-800 font-bold uppercase tracking-wider mb-1.5">
              <span>Liga 1 BRI</span>
              <span className="text-gray-500">FT</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-800">Persib</span>
              </div>
              <span className="font-black font-mono text-slate-900 bg-amber-100/60 px-2 py-0.5 rounded text-xs">2 - 0</span>
              <div className="flex items-center gap-1.5 text-right justify-end">
                <span className="font-bold text-slate-800">Persija</span>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-3 mt-1">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-2">Klasemen Sementara</span>
            <div className="flex flex-col gap-1.5 text-xs text-slate-600">
              <div className="flex justify-between items-center font-bold text-slate-800">
                <span>1. Indonesia</span>
                <span className="font-mono">10 Poin</span>
              </div>
              <div className="flex justify-between items-center">
                <span>2. Jepang</span>
                <span className="font-mono text-slate-500">9 Poin</span>
              </div>
              <div className="flex justify-between items-center">
                <span>3. Australia</span>
                <span className="font-mono text-slate-500">7 Poin</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );

    const renderTeknologiWidget = () => (
      <div className="bg-white rounded-xl border border-sky-100 p-5 shadow-xs">
        <div className="flex items-center justify-between pb-2 mb-4 border-b border-sky-50">
          <div className="flex items-center gap-2">
            <Cpu className="text-sky-600 animate-pulse" size={16} />
            <h4 className="text-xs font-black uppercase tracking-wider text-sky-800">
              {lang === "ID" ? "RADAR TEKNOLOGI & AI" : "AI & TECH RADAR"}
            </h4>
          </div>
          <span className="w-2 h-2 rounded-full bg-sky-500 animate-ping"></span>
        </div>

        <div className="flex flex-col gap-3 font-sans">
          <div className="bg-sky-50/20 border border-sky-100 rounded-lg p-3">
            <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
              <span>AI Public Safety Index</span>
              <span className="text-sky-700">78%</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="bg-sky-500 h-full rounded-full" style={{ width: "78%" }}></div>
            </div>
          </div>

          <div className="bg-sky-50/20 border border-sky-100 rounded-lg p-3">
            <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
              <span>Digital Literacy Rate</span>
              <span className="text-sky-700">65%</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="bg-indigo-500 h-full rounded-full" style={{ width: "65%" }}></div>
            </div>
          </div>

          <div className="bg-sky-50/30 border border-sky-100 rounded-lg p-2.5 text-xs text-sky-900 leading-relaxed">
            <div className="flex items-center gap-1.5 text-[10px] font-black text-sky-800 uppercase mb-1">
              <ShieldAlert size={12} />
              <span>Satu Tech Alert</span>
            </div>
            {lang === "ID" 
              ? "Server cloud nasional baru siap diluncurkan di Jakarta guna melindungi kedaulatan data."
              : "A new national cloud server is ready to launch in Jakarta to protect national data sovereignty."}
          </div>
        </div>
      </div>
    );

    const renderPolitikWidget = () => (
      <div className="bg-white rounded-xl border border-indigo-100 p-5 shadow-xs">
        <div className="flex items-center justify-between pb-2 mb-4 border-b border-indigo-50">
          <div className="flex items-center gap-2">
            <Landmark className="text-indigo-600" size={16} />
            <h4 className="text-xs font-black uppercase tracking-wider text-indigo-800">
              {lang === "ID" ? "PROGRES KEBIJAKAN & LEGISLASI" : "POLICY & LEGISLATION PROGRESS"}
            </h4>
          </div>
        </div>

        <div className="flex flex-col gap-3 font-sans">
          <div className="bg-indigo-50/20 border border-indigo-100 rounded-lg p-3">
            <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
              <span>RUU Perampasan Aset</span>
              <span className="text-indigo-700">75% (Pembahasan)</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="bg-indigo-600 h-full rounded-full" style={{ width: "75%" }}></div>
            </div>
          </div>

          <div className="bg-indigo-50/20 border border-indigo-100 rounded-lg p-3">
            <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
              <span>RUU Perlindungan Data Pribadi</span>
              <span className="text-green-600">100% (Disahkan)</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="bg-green-500 h-full rounded-full" style={{ width: "100%" }}></div>
            </div>
          </div>

          <div className="bg-indigo-50/20 border border-indigo-100 rounded-lg p-3">
            <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
              <span>RUU Keamanan Siber</span>
              <span className="text-amber-600">40% (Prolegnas)</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="bg-amber-500 h-full rounded-full" style={{ width: "40%" }}></div>
            </div>
          </div>
        </div>
      </div>
    );

    const renderGeneralNewsletterWidget = () => (
      <div className="bg-gradient-to-br from-[#0D2B5C] to-[#1E40AF] text-white rounded-xl p-5 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Mail className="text-[#D71920]" size={16} />
            <span className="text-[10px] font-black text-[#D71920] uppercase tracking-widest">
              {lang === "ID" ? "POROS PREMIUM" : "PREMIUM NEWSLETTER"}
            </span>
          </div>
          <h5 className="text-xs sm:text-sm font-bold leading-snug mb-3">
            {lang === "ID" 
              ? `Dapatkan rangkuman analisis terdalam mengenai ${selectedCategory} langsung di email Anda.` 
              : `Get the deepest analysis summaries for ${selectedCategory} delivered straight to your inbox.`}
          </h5>

          {subSuccess ? (
            <div className="bg-white/10 rounded-lg p-3 border border-white/20 text-[11px] flex items-center gap-1.5 text-yellow-300 font-bold">
              <CheckCircle2 size={14} />
              <span>{lang === "ID" ? "Berhasil berlangganan! Terima kasih." : "Subscription successful! Thank you."}</span>
            </div>
          ) : (
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (subEmail.trim()) {
                  setSubSuccess(true);
                  setSubEmail("");
                }
              }}
              className="flex flex-col gap-2"
            >
              <input 
                type="email" 
                required
                value={subEmail}
                onChange={(e) => setSubEmail(e.target.value)}
                placeholder={lang === "ID" ? "Masukkan email Anda..." : "Enter your email..."}
                className="px-3 py-2 text-xs text-gray-900 bg-white rounded-lg focus:outline-none placeholder-gray-400"
              />
              <button 
                type="submit"
                className="bg-[#D71920] text-white font-bold py-2 px-3 rounded-lg text-xs hover:scale-[1.01] transition-transform cursor-pointer text-center"
              >
                {lang === "ID" ? "Langganan Sekarang" : "Subscribe Now"}
              </button>
            </form>
          )}
        </div>
      </div>
    );

    const renderCategoryWidget = (category: string) => {
      return null;
    };

    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6" id="category-root">
        


        {/* Category Banner Ad Slot */}
        <div className="w-full mb-6">
          <AdManagerSlot slug="category-banner" page="kategori" category={selectedCategory} />
        </div>

        {/* Dynamic Category Hero Hub */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 sm:p-8 mb-8 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-start gap-4">
            <div className={`p-4.5 rounded-xl ${catTheme.bg} border ${catTheme.border} flex items-center justify-center shrink-0`}>
              {getCategoryIcon(selectedSubCategory || selectedCategory)}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className={`text-[10px] font-black uppercase tracking-widest ${catTheme.text}`}>
                  {lang === "ID" ? "KANAL POROS" : "POROS CHANNEL"}
                  {selectedSubCategory && <span className="ml-1 opacity-70">â€¢ {selectedCategory.toUpperCase()}</span>}
                </span>
                <span className="text-gray-300 text-xs">â€¢</span>
                <span className="text-[10px] text-gray-500 font-mono flex items-center gap-1">
                  <Activity size={10} />
                  {filteredArticles.length} {lang === "ID" ? "Artikel Aktif" : "Active Articles"}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight font-sans">
                {(selectedSubCategory || selectedCategory).toUpperCase()}
              </h1>
              <p className="text-gray-500 text-xs sm:text-sm mt-1.5 leading-relaxed max-w-2xl font-light">
                {getCategoryDescription(selectedSubCategory || selectedCategory)}
              </p>
            </div>
          </div>
          
          {/* Category Quick Analytics Banner */}
          <div className="hidden lg:flex items-center gap-6 border-l border-gray-100 pl-8 shrink-0">
            <div className="text-center">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1">{lang === "ID" ? "Total Pembaca" : "Total Readers"}</span>
              <span className="text-lg font-black text-[#0D2B5C] font-mono flex items-center gap-1 justify-center">
                <Eye size={16} className="text-gray-400" />
                {categoryViews.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Active Tag Filter Notice in Category View */}
        {selectedTag && (
          <div className="mb-8 bg-[#1E40AF]/5 border border-[#1E40AF]/20 rounded-xl p-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Hash className="text-[#1E40AF]" size={16} />
              <span className="text-sm font-bold text-gray-800">
                {lang === "ID" ? "Menampilkan berita tentang" : "Showing news for"}: <span className="text-[#1E40AF] font-black">"{selectedTag}"</span>
              </span>
            </div>
            <button 
              onClick={() => setSelectedTag(null)}
              className="text-xs font-bold text-red-600 hover:text-red-700 cursor-pointer bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-full transition-colors"
            >
              {lang === "ID" ? "Hapus Filter" : "Clear Filter"} âœ•
            </button>
          </div>
        )}

        {/* Grid and Sidebar Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT: Cards Grid list (Col-span 8) */}
          <div className="lg:col-span-8 flex flex-col gap-3">
            
            {/* Spotlight Article (SOROTAN UTAMA) - Elegant Vertical Layout inside left column */}
            {spotlightArticle && !selectedTag && (
              <div 
                onClick={() => onSelectArticle(spotlightArticle)}
                className="relative bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-xs hover:shadow-sm hover:border-gray-200/80 transition-all duration-300 mb-4 flex flex-col group cursor-pointer"
              >
                {/* Top: Large Widescreen Image with premium zoom */}
                <div className="relative overflow-hidden w-full aspect-[16/10] sm:aspect-[16/9]">
                  <img 
                    src={spotlightArticle.image} 
                    alt={spotlightArticle.title} 
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.src = "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80";
                    }}
                    className="absolute inset-0 w-full h-full object-cover transform scale-100 group-hover:scale-[1.02] transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent opacity-90" />
                  
                  {/* Floating Subcategory Badge */}
                  <div className="absolute top-4 left-4 z-10">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg backdrop-blur-md bg-white/95 text-slate-800 shadow-sm border border-white/20`}>
                      {spotlightArticle.subCategory || "SOROTAN UTAMA"}
                    </span>
                  </div>
                </div>
                
                {/* Bottom: Text Information with Left Accent Bar */}
                <div className="p-4 sm:p-5 flex flex-col justify-between w-full">
                  <div className="flex gap-3">
                    {/* Elegant Left Accent Bar */}
                    <div className={`w-[3px] rounded-full ${catTheme.accent} opacity-85 self-stretch shrink-0`} />
                    
                    <div className="flex-1 flex flex-col gap-1.5">
                      {/* Metadata */}
                      <div className="flex items-center gap-2 text-[10px] text-gray-400 font-mono">
                        <span className="flex items-center gap-1"><Calendar size={11} /> {formatDate(spotlightArticle.publishDate, lang)}</span>
                        <span>â€¢</span>
                        <span className="text-slate-500">Oleh: {spotlightArticle.author}</span>
                      </div>
                      
                      {/* Headline Title */}
                      <h2 className="text-sm sm:text-base md:text-lg font-bold text-gray-900 group-hover:text-[#1E40AF] transition-colors duration-200 leading-snug font-sans tracking-tight">
                        {spotlightArticle.title}
                      </h2>
                      
                      {/* Short Description */}
                      <p className="text-gray-500 text-xs sm:text-[13px] leading-relaxed line-clamp-2 font-light">
                        {spotlightArticle.content}
                      </p>
                    </div>
                  </div>
                  
                  {/* Interactive Footer & Metrics */}
                  <div className="flex items-center justify-between border-t border-gray-100 pt-3 mt-3.5">
                    <div className="flex items-center gap-3 text-[10px] font-mono text-gray-400">
                      <span className="flex items-center gap-1"><Eye size={12} /> {spotlightArticle.views}</span>
                      <span className="flex items-center gap-1"><Share2 size={12} /> {spotlightArticle.shares}</span>
                    </div>
                    
                    <button className={`inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold ${catTheme.text} group-hover:translate-x-1 transition-transform cursor-pointer`}>
                      <span>{lang === "ID" ? "Baca Selengkapnya" : "Read Full Story"}</span>
                      <ChevronRight size={12} className="transform group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            )}



            <div id="daftar-berita-kategori" className="flex items-center gap-2 border-b pb-2 mb-2">
              <Clock className="text-[#0D2B5C]" size={16} />
              <h4 className="text-xs font-black uppercase tracking-wider text-[#0D2B5C]">
                {lang === "ID" ? "DAFTAR ARTIKEL TERBARU" : "RECENT ARTICLES LIST"}
              </h4>
            </div>

            {/* If no other articles */}
            {gridArticles.length === 0 && (!spotlightArticle || selectedTag) && (
              <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center shadow-xs">
                <Newspaper className="mx-auto text-gray-300 mb-3" size={40} />
                <h4 className="text-sm font-bold text-gray-800 mb-1">
                  {lang === "ID" ? "Belum Ada Berita Lain" : "No Other Articles Found"}
                </h4>
                <p className="text-xs text-gray-500">
                  {lang === "ID" 
                    ? `Tidak ada berita lain yang ditemukan di kanal ${selectedCategory}.` 
                    : `No other articles are currently available in ${selectedCategory} channel.`}
                </p>
              </div>
            )}

            {/* List of other articles matching homepage style */}
            <div className="flex flex-col">
              {paginatedArticles.map((art, idx) => (
                <React.Fragment key={art.id}>
                  <div 
                    onClick={() => onSelectArticle(art)}
                    className="flex flex-row gap-4 py-3.5 border-b border-gray-100 last:border-0 hover:bg-gray-50/50 px-3 -mx-3 rounded-xl transition-all duration-200 cursor-pointer group"
                  >
                    <div className="relative overflow-hidden w-24 sm:w-32 h-20 sm:h-[84px] rounded-xl shrink-0 bg-gray-50/70 border border-gray-100/30 shadow-xs">
                      <img 
                        src={art.image} 
                        alt={art.title} 
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          e.currentTarget.src = "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80";
                        }}
                        className="w-full h-full object-cover transform group-hover:scale-[1.03] transition-transform duration-500 ease-out" 
                      />
                      <div className={`hidden sm:block absolute bottom-2 left-2 ${catTheme.bg} text-[9px] font-bold uppercase tracking-wider ${catTheme.text} px-2 py-0.5 rounded-md border ${catTheme.border} shadow-xs`}>
                        {art.subCategory || selectedCategory}
                      </div>
                    </div>
                    <div className="flex flex-col justify-between py-0.5 flex-1">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] text-gray-400 font-mono">
                            {formatDate(art.publishDate, lang)}
                          </span>
                        </div>
                        <h4 className="text-xs sm:text-[13px] font-bold text-gray-900 line-clamp-2 leading-snug group-hover:text-[#1E40AF] transition-colors mb-1">
                          {art.title}
                        </h4>
                        <p className="text-gray-500 text-[11px] sm:text-[12px] line-clamp-2 leading-relaxed font-light">
                          {art.content}
                        </p>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-gray-400 font-mono mt-2 pt-1 border-t border-gray-100/30">
                        <span>Oleh: <span className="font-medium text-slate-600">{art.author}</span></span>
                        <span className="flex items-center gap-1"><Eye size={12} /> {art.views}</span>
                      </div>
                    </div>
                  </div>


                  {/* Inject In-Feed Ads */}
                  {idx === 4 && (
                    <div className="w-full my-4 flex justify-center">
                      <AdManagerSlot slug="in-feed-1" page="kategori" category={selectedCategory} />
                    </div>
                  )}
                  {idx === 9 && (
                    <div className="w-full my-4 flex justify-center">
                      <AdManagerSlot slug="in-feed-2" page="kategori" category={selectedCategory} />
                    </div>
                  )}

                </React.Fragment>
              ))}
            </div>

            {/* Page Navigation Controls for Category */}
            {totalCategoryPages > 1 && (
              <div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-8 pt-4 border-t border-gray-100">
                {/* Previous Button */}
                <button
                  disabled={categoryPage === 1}
                  onClick={() => {
                    setCategoryPage(prev => Math.max(prev - 1, 1));
                    const el = document.getElementById("daftar-berita-kategori");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  className={`h-8.5 px-3 sm:px-4 rounded-lg border border-gray-200 bg-white text-xs font-bold text-gray-600 hover:${catTheme.text} hover:border-current transition-all cursor-pointer flex items-center gap-1 select-none disabled:opacity-40 disabled:pointer-events-none active:scale-98`}
                >
                  <ChevronLeft size={14} />
                  <span className="hidden sm:inline">{lang === "ID" ? "Sebelumnya" : "Previous"}</span>
                </button>

                {/* Page Numbers */}
                {(() => {
                  const pages = [];
                  const maxPageDisplay = 5;
                  let startPage = Math.max(1, categoryPage - Math.floor(maxPageDisplay / 2));
                  let endPage = Math.min(totalCategoryPages, startPage + maxPageDisplay - 1);

                  if (endPage - startPage + 1 < maxPageDisplay) {
                    startPage = Math.max(1, endPage - maxPageDisplay + 1);
                  }

                  // First page if not in range
                  if (startPage > 1) {
                    pages.push(
                      <button
                        key={1}
                        onClick={() => {
                          setCategoryPage(1);
                          const el = document.getElementById("daftar-berita-kategori");
                          if (el) el.scrollIntoView({ behavior: "smooth" });
                        }}
                        className={`w-8.5 h-8.5 rounded-lg border text-xs font-mono font-bold transition-all cursor-pointer flex items-center justify-center select-none active:scale-95 ${
                          categoryPage === 1
                            ? `${catTheme.accent} text-white border-transparent`
                            : `border-gray-200 bg-white text-gray-600 hover:border-current hover:${catTheme.text}`
                        }`}
                      >
                        1
                      </button>
                    );
                    if (startPage > 2) {
                      pages.push(
                        <span key="ellipsis-start" className="text-gray-400 text-xs px-1 font-mono">
                          ...
                        </span>
                      );
                    }
                  }

                  // Numeric pages
                  for (let p = startPage; p <= endPage; p++) {
                    pages.push(
                      <button
                        key={p}
                        onClick={() => {
                          setCategoryPage(p);
                          const el = document.getElementById("daftar-berita-kategori");
                          if (el) el.scrollIntoView({ behavior: "smooth" });
                        }}
                        className={`w-8.5 h-8.5 rounded-lg border text-xs font-mono font-bold transition-all cursor-pointer flex items-center justify-center select-none active:scale-95 ${
                          categoryPage === p
                            ? `${catTheme.accent} text-white border-transparent`
                            : `border-gray-200 bg-white text-gray-600 hover:border-current hover:${catTheme.text}`
                        }`}
                      >
                        {p}
                      </button>
                    );
                  }

                  // Last page if not in range
                  if (endPage < totalCategoryPages) {
                    if (endPage < totalCategoryPages - 1) {
                      pages.push(
                        <span key="ellipsis-end" className="text-gray-400 text-xs px-1 font-mono">
                          ...
                        </span>
                      );
                    }
                    pages.push(
                      <button
                        key={totalCategoryPages}
                        onClick={() => {
                          setCategoryPage(totalCategoryPages);
                          const el = document.getElementById("daftar-berita-kategori");
                          if (el) el.scrollIntoView({ behavior: "smooth" });
                        }}
                        className={`w-8.5 h-8.5 rounded-lg border text-xs font-mono font-bold transition-all cursor-pointer flex items-center justify-center select-none active:scale-95 ${
                          categoryPage === totalCategoryPages
                            ? `${catTheme.accent} text-white border-transparent`
                            : `border-gray-200 bg-white text-gray-600 hover:border-current hover:${catTheme.text}`
                        }`}
                      >
                        {totalCategoryPages}
                      </button>
                    );
                  }

                  return pages;
                })()}

                {/* Next Button */}
                <button
                  disabled={categoryPage === totalCategoryPages}
                  onClick={() => {
                    setCategoryPage(prev => Math.min(prev + 1, totalCategoryPages));
                    const el = document.getElementById("daftar-berita-kategori");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  className={`h-8.5 px-3 sm:px-4 rounded-lg border border-gray-200 bg-white text-xs font-bold text-gray-600 hover:${catTheme.text} hover:border-current transition-all cursor-pointer flex items-center gap-1 select-none disabled:opacity-40 disabled:pointer-events-none active:scale-98`}
                >
                  <span className="hidden sm:inline">{lang === "ID" ? "Selanjutnya" : "Next"}</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            )}


          </div>

          {/* RIGHT: Sidebar Area (Col-span 4) */}
          <div className="lg:col-span-4 flex flex-col gap-8">
            
            {/* Sidebar Top Ad Slot */}
            <AdManagerSlot slug="sidebar-top" page="kategori" category={selectedCategory} />

            {/* Category Custom Sidebar Widget */}
            {renderCategoryWidget(selectedCategory)}



            {/* Numbered Category Popular Articles List */}
            {popularInCategory.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-xs">
                <div className="flex items-center gap-2 pb-2 mb-4 border-b">
                  <TrendingUp className="text-[#0D2B5C]" size={15} />
                  <h4 className="text-xs font-black uppercase tracking-wider text-[#0D2B5C]">
                    {lang === "ID" ? `POPULER DI ${selectedCategory.toUpperCase()}` : `TRENDING IN ${selectedCategory.toUpperCase()}`}
                  </h4>
                </div>
                <div className="flex flex-col gap-4">
                  {popularInCategory.map((art, idx) => (
                    <div 
                      key={art.id} 
                      className="flex gap-3 items-start cursor-pointer group"
                      onClick={() => onSelectArticle(art)}
                    >
                      <span className={`text-2xl font-black transition-colors leading-none w-6 text-center ${idx === 0 ? catTheme.text : "text-gray-200 group-hover:text-gray-400"}`}>
                        {idx + 1}
                      </span>
                      <div>
                        <h5 className="text-xs font-bold text-gray-800 line-clamp-2 leading-tight group-hover:text-[#1E40AF] transition-colors font-sans">
                          {art.title}
                        </h5>
                        <div className="flex gap-2 text-[9px] text-gray-400 font-mono mt-1">
                          <span>{formatDate(art.publishDate, lang)}</span>
                          <span>â€¢</span>
                          <span className="flex items-center gap-0.5"><Eye size={10} /> {art.views}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}



            {/* Tag Cloud specific to this Category */}
            {categoryTags.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-xs">
                <h4 className="text-sm font-black text-gray-900 uppercase tracking-tight mb-4 flex items-center gap-1.5">
                  <Hash size={15} className={catTheme.text} />
                  <span>{lang === "ID" ? "TOPIK TERKAIT" : "RELATED TOPICS"}</span>
                </h4>
                <div className="flex flex-wrap gap-2">
                  {categoryTags.map((tag) => (
                    <button 
                      key={tag}
                      onClick={() => {
                        setSelectedTag(prev => prev === tag ? null : tag);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className={`text-[10px] font-bold px-3 py-1.5 rounded-full transition-all cursor-pointer ${selectedTag === tag ? "bg-[#0D2B5C] text-white" : "bg-gray-50 text-gray-600 hover:bg-gray-100"}`}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Channel contributors info panel */}
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 shadow-xs">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                {lang === "ID" ? "DEWAN REDAKSI DESK" : "DESK EDITORIAL BOARD"}
              </h4>
              <div className="flex flex-col gap-2.5 text-xs">
                <div className="flex justify-between items-center text-slate-700">
                  <span className="font-bold">Kepala Desk {selectedCategory}</span>
                  <span className="text-slate-500">Giri Wijaya</span>
                </div>
                <div className="flex justify-between items-center text-slate-700 border-t border-slate-200/50 pt-2.5">
                  <span className="font-bold">Jurnalis Kontributor</span>
                  <span className="text-slate-500 text-right">Budi Santoso, Siti Rahma</span>
                </div>
                <div className="flex justify-between items-center text-slate-700 border-t border-slate-200/50 pt-2.5">
                  <span className="font-bold">Korespondensi</span>
                  <span className="text-[#1E40AF] hover:underline cursor-pointer">redaksi@porosmadura.com</span>
                </div>
              </div>
            </div>



            {/* Sidebar Middle Ad Slot */}
            <AdManagerSlot slug="sidebar-middle" page="kategori" category={selectedCategory} />

            {/* Sidebar Bottom Ad Slot */}
            <AdManagerSlot slug="sidebar-bottom" page="kategori" category={selectedCategory} />

            {/* Sidebar Sticky Ad Slot */}
            <div className="lg:sticky lg:top-20">
              <AdManagerSlot slug="sidebar-sticky" page="kategori" category={selectedCategory} />
            </div>

          </div>

        </div>

        {/* In-Feed Ad Slots (Category) moved inside the list */}

        {/* Photo Lightbox modal */}
        {selectedPhoto && (
          <div 
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedPhoto(null)}
          >
            <div className="relative max-w-4xl max-h-full">
              <img src={selectedPhoto} className="max-w-full max-h-[85vh] object-contain rounded" alt="Lightbox" />
              <button 
                onClick={() => setSelectedPhoto(null)} 
                className="absolute top-4 right-4 text-white bg-black/60 rounded-full p-2 hover:bg-black cursor-pointer"
              >
                âœ•
              </button>
            </div>
          </div>
        )}

      </main>
    );
  }
  // --- END CATEGORY VIEW LAYOUT ---

  return null;
}

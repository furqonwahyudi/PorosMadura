import { Link } from "react-router-dom";
import React, { useState, useEffect, useMemo } from "react";
import { Article } from "../types";
import { getArticleUrl, formatDate, slugify } from "../lib/utils";
import { api } from "../lib/api";
import AdManagerSlot from "./shared/AdManagerSlot";
import { 
  TrendingUp, Award, Calendar, Share2, Eye, EyeOff, BookOpen, Clock, 
  ChevronLeft, ChevronRight, Video, Image, ChevronDown, BarChart2, CheckCircle2, CloudSun, TrendingDown,
  Cpu, Trophy, Landmark, Coins, Globe, Mail, ShieldAlert, Newspaper, Hash, Activity, Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import AnimatedMarketRate from "./shared/AnimatedMarketRate";
import PortalCategory from "./portal/category/PortalCategory";

interface PortalHomeProps {
  onSelectArticle: (article: Article) => void;
  lang: "ID" | "EN";
  selectedCategory: string | null;
  selectedSubCategory?: string | null;
  onCategorySelect?: (category: string | null, subCategory?: string | null) => void;
  searchQuery?: string;
  onSearchClear?: () => void;
}

export default function PortalHome({ 
  onSelectArticle, 
  lang, 
  selectedCategory, 
  selectedSubCategory,
  onCategorySelect,
  searchQuery = "",
  onSearchClear
}: PortalHomeProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);
  const [headlineDirection, setHeadlineDirection] = useState<"left" | "right">("right");
  const [isHeadlineHovered, setIsHeadlineHovered] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEndX(null);
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStartX || !touchEndX) return;
    const distance = touchStartX - touchEndX;
    const minSwipeDistance = 50;

    if (distance > minSwipeDistance) {
      // Swipe left -> Next slide
      setHeadlineDirection("right");
      setActiveSlide(prev => (prev + 1) % headlineArticles.length);
    } else if (distance < -minSwipeDistance) {
      // Swipe right -> Previous slide
      setHeadlineDirection("left");
      setActiveSlide(prev => prev === 0 ? headlineArticles.length - 1 : prev - 1);
    }
  };

  const [activeKesehatanSlide, setActiveKesehatanSlide] = useState(0);
  const [slideDirection, setSlideDirection] = useState<"left" | "right">("right");
  const [activeTab, setActiveTab] = useState<"populer" | "dibaca" | "dibagikan">("populer");
  const [pollVoted, setPollVoted] = useState(false);
  const [pollVotes, setPollVotes] = useState({ yes: 78, no: 22 });
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [visibleRecentCount, setVisibleRecentCount] = useState(20);
  const [recentPage, setRecentPage] = useState(1);
  const [categoryPage, setCategoryPage] = useState(1);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [subEmail, setSubEmail] = useState("");
  const [subSuccess, setSubSuccess] = useState(false);

  // Exchange rates and stats from unified backend MarketDataService
  const [marketRates, setMarketRates] = useState<{
    ihsg: { price: number | null; change: number | null; status: "up" | "down" | "stable" } | null;
    usd: { price: number | null; change: number | null; status: "up" | "down" | "stable" } | null;
    gold: { price: number | null; buybackPrice?: number | null; change: number | null; status: "up" | "down" | "stable" } | null;
  }>({
    ihsg: { price: 6094.793, change: 0.87, status: "up" },
    usd: { price: 17975, change: -0.47, status: "down" },
    gold: { price: 2648766, buybackPrice: 2357052, change: -0.8, status: "down" }
  });

  const [marketSettings, setMarketSettings] = useState<{
    enabled: boolean;
    ihsgEnabled: boolean;
    usdEnabled: boolean;
    goldEnabled: boolean;
    kriptoEnabled: boolean;
  }>({
    enabled: true,
    ihsgEnabled: true,
    usdEnabled: true,
    goldEnabled: true,
    kriptoEnabled: false
  });

  useEffect(() => {
    let active = true;
    let pollingInterval: NodeJS.Timeout | null = null;

    const fetchMarketData = async (isInitial = false) => {
      try {
        if (isInitial) {
          const [rates, settings] = await Promise.all([
            api.getMarketRates(),
            api.getMarketSettings()
          ]);
          if (active) {
            if (rates) setMarketRates(rates);
            if (settings) setMarketSettings(settings);
          }
        } else {
          const rates = await api.getMarketRates();
          if (active && rates) setMarketRates(rates);
        }
      } catch (err) {
        console.error("Gagal mengambil data market:", err);
      }
    };

    fetchMarketData(true);

    // Setup polling every 15 seconds to fetch fresh rates in background
    pollingInterval = setInterval(() => {
      fetchMarketData(false);
    }, 15000);

    return () => {
      active = false;
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    
    const fetchArticles = async () => {
      try {
        let result: Article[] = [];
        
        if (searchQuery) {
          const res = await api.search(searchQuery, 1, 100);
          result = res.articles;
        } else {
          const isRekomendasi = selectedCategory && selectedCategory.toLowerCase() === "rekomendasi";
          const catSlug = selectedCategory && !isRekomendasi ? slugify(selectedCategory) : undefined;
          const subCatSlug = selectedSubCategory ? slugify(selectedSubCategory) : undefined;
          
          const res = await api.getArticles({
            category: catSlug,
            subCategory: subCatSlug,
            limit: 100,
            isEditorChoice: isRekomendasi ? true : undefined
          });
          result = res.articles;
        }
        
        if (active) {
          setArticles(result);
          setLoading(false);
        }
      } catch (error) {
        console.error("Gagal memuat berita:", error);
        if (active) {
          setLoading(false);
        }
      }
    };
    
    fetchArticles();
    
    return () => {
      active = false;
    };
  }, [selectedCategory, selectedSubCategory, searchQuery]);

  const isCategory = (a: Article, catName: string) => {
    const cLower = catName.toLowerCase();
    return a.category?.toLowerCase() === cLower || a.subCategory?.toLowerCase() === cLower;
  };

  useEffect(() => {
    setRecentPage(1);
    setCategoryPage(1);
  }, [selectedCategory, selectedSubCategory, selectedTag]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [recentPage, categoryPage, selectedCategory, selectedSubCategory]);

  // Filter by selected tag if set and handle special "rekomendasi" category
  const filteredArticles = useMemo(() => {
    let list = articles;
    if (selectedCategory && selectedCategory.toLowerCase() === "rekomendasi") {
      list = list.filter(a => a.isEditorChoice === true);
    }
    if (selectedTag) {
      list = list.filter(a => 
        (a.title && a.title.toLowerCase().includes(selectedTag.toLowerCase())) ||
        (a.content && a.content.toLowerCase().includes(selectedTag.toLowerCase())) ||
        (a.tags && a.tags.some(t => t.toLowerCase().includes(selectedTag.toLowerCase()))) ||
        (a.metaKeywords && a.metaKeywords.some(t => t.toLowerCase().includes(selectedTag.toLowerCase())))
      );
    }
    return list;
  }, [articles, selectedCategory, selectedTag]);

  const ITEMS_PER_PAGE = 20;
  const totalPages = Math.ceil(filteredArticles.length / ITEMS_PER_PAGE);
  const currentPageArticles = useMemo(() => {
    return filteredArticles.slice((recentPage - 1) * ITEMS_PER_PAGE, recentPage * ITEMS_PER_PAGE);
  }, [filteredArticles, recentPage]);

  // Rotator effect for top headline slider - Select 5 newest articles chronically
  const headlineArticles = useMemo(() => {
    const sorted = [...filteredArticles].sort(
      (a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
    );
    return sorted.slice(0, 5);
  }, [filteredArticles]);

  useEffect(() => {
    const len = headlineArticles.length;
    if (len <= 1 || isHeadlineHovered) return;
    const interval = setInterval(() => {
      setHeadlineDirection("right");
      setActiveSlide(prev => (prev + 1) % len);
    }, 7000);
    return () => clearInterval(interval);
  }, [headlineArticles.length, isHeadlineHovered]);

  const kesehatanArticles = [...articles]
    .filter(a => isCategory(a, "Kesehatan"))
    .sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime())
    .slice(0, 15);
  const kesehatanChunks = (() => {
    const chunks: Article[][] = [];
    for (let i = 0; i < kesehatanArticles.length; i += 3) {
      chunks.push(kesehatanArticles.slice(i, i + 3));
    }
    return chunks;
  })();

  useEffect(() => {
    const len = kesehatanChunks.length;
    if (len <= 1) return;
    const interval = setInterval(() => {
      setSlideDirection("right");
      setActiveKesehatanSlide(prev => (prev + 1) % len);
    }, 7000);
    return () => clearInterval(interval);
  }, [kesehatanChunks.length, activeKesehatanSlide]);

  const handlePrevKesehatan = () => {
    if (kesehatanChunks.length <= 1) return;
    setSlideDirection("left");
    setActiveKesehatanSlide(prev => (prev - 1 + kesehatanChunks.length) % kesehatanChunks.length);
  };

  const handleNextKesehatan = () => {
    if (kesehatanChunks.length <= 1) return;
    setSlideDirection("right");
    setActiveKesehatanSlide(prev => (prev + 1) % kesehatanChunks.length);
  };

  const handleVote = (option: "yes" | "no") => {
    if (pollVoted) return;
    setPollVotes(prev => ({
      ...prev,
      [option]: prev[option] + 1
    }));
    setPollVoted(true);
  };

  if (loading && articles.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 flex flex-col justify-center items-center gap-4">
        <div className="w-12 h-12 border-4 border-[#0D2B5C] border-t-transparent rounded-full animate-spin"></div>
        <span className="text-sm font-semibold text-[#0D2B5C] font-sans tracking-wide">
          {lang === "ID" ? "Memuat Berita Terbaik..." : "Loading premium news portal..."}
        </span>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <h3 className="text-lg font-bold text-gray-800 mb-2">
          {lang === "ID" ? "Belum Ada Berita di Kategori Ini" : "No Articles Available in This Category"}
        </h3>
        <p className="text-sm text-gray-500">
          {lang === "ID" ? "Gunakan CMS Admin untuk menambahkan berita berkualitas pertama Anda." : "Use the CMS Admin to write and publish your first article."}
        </p>
      </div>
    );
  }

  // --- START CATEGORY VIEW LAYOUT ---
  if (selectedCategory) {
    return (
      <PortalCategory 
        lang={lang} 
        selectedCategory={selectedCategory} 
        selectedSubCategory={selectedSubCategory} 
        filteredArticles={filteredArticles} 
        marketRates={marketRates} 
        onSelectArticle={onSelectArticle} 
        selectedTag={selectedTag} 
        setSelectedTag={setSelectedTag} 
      />
    );
  }
  // --- END CATEGORY VIEW LAYOUT ---

  // Filter specific feeds
  const breakingNewsList = filteredArticles.filter(a => a.isBreaking);
  const editorChoiceList = (() => {
    const choices = filteredArticles.filter(a => a.isEditorChoice);
    if (choices.length >= 8) {
      return choices.slice(0, 8);
    }
    const others = filteredArticles.filter(a => !a.isEditorChoice);
    return [...choices, ...others].slice(0, 8);
  })();
  const trendingList = [...articles].sort((a, b) => b.views - a.views).slice(0, 5);
  const mostReadList = [...articles].sort((a, b) => b.reads - a.reads).slice(0, 4);
  const mostSharedList = [...articles].sort((a, b) => b.shares - a.shares).slice(0, 4);

  // Grouping by standard layout categories

  const getCategoryArticles = (cat: string) => {
    const list = filteredArticles.filter(a => isCategory(a, cat));
    if (list.length >= 3) return list.slice(0, 3);
    const extra = filteredArticles.filter(a => !isCategory(a, cat)).slice(0, 3 - list.length);
    return [...list, ...extra].map((a, idx) => {
      if (!isCategory(a, cat)) {
        let image = a.image;
        if (cat === "Otomotif") {
          const autoImages = [
            "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=400&q=80",
            "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=400&q=80",
            "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=400&q=80"
          ];
          image = autoImages[idx % autoImages.length];
        } else if (cat === "Hiburan" || cat === "Lainnya") {
          const entertainmentImages = [
            "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&q=80",
            "https://images.unsplash.com/photo-1460881680858-30d872d5b530?auto=format&fit=crop&w=400&q=80",
            "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=400&q=80"
          ];
          image = entertainmentImages[idx % entertainmentImages.length];
        }
        return { ...a, category: cat, image };
      }
      return a;
    });
  };

  const politicsArticles = filteredArticles.filter(a => isCategory(a, "Politik")).slice(0, 3);
  const nationalArticles = filteredArticles.filter(a => isCategory(a, "Nasional")).slice(0, 3);
  const techArticles = getCategoryArticles("Teknologi");
  const otomotifArticles = getCategoryArticles("Otomotif");
  const hiburanArticles = getCategoryArticles("Hiburan");
  const economyArticles = filteredArticles.filter(a => isCategory(a, "Ekonomi")).slice(0, 3);
  const sportArticles = filteredArticles.filter(a => isCategory(a, "Olahraga")).slice(0, 3);
  const opinionArticles = filteredArticles.filter(a => isCategory(a, "Opini") || isCategory(a, "Kolom") || isCategory(a, "Editorial")).slice(0, 4);
  
  // Videos section
  const videoArticles = filteredArticles.filter(a => a.videoUrl).slice(0, 3);

  // Photo gallery static resources representing "Foto Category" (24)
  const photoGallery = [
    { title: "Gemuruh Pesta Kembang Api Borobudur", desc: "Perayaan festival lampion di Candi Borobudur menyedot atensi wisatawan global.", url: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=600&q=80" },
    { title: "Panen Raya Padi Organik Cianjur", desc: "Masyarakat tani adat Cianjur sukses menguji coba sistem irigasi hemat air presisi.", url: "https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&w=600&q=80" },
    { title: "Uji Emisi Kendaraan Listrik Jakarta", desc: "Dinas perhubungan menggratiskan pos uji emisi baterai di terminal-terminal bus.", url: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=600&q=80" }
  ];

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Category Banner (only on category page) */}
      {selectedCategory && (
        <div className="w-full mb-6">
          <AdManagerSlot slug="category-banner" page="kategori" category={selectedCategory} />
        </div>
      )}

      {/* Dynamic Homepage Banner Atas */}
      {!selectedCategory && !selectedTag && !searchQuery && (
        <div className="w-full mb-6">
          <AdManagerSlot slug="homepage-banner-atas" page="homepage" />
        </div>
      )}

      {/* 2. Top Portal Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
        
        {/* LEFT COLUMN: Headlines & Bento Grids */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          
          {/* Active Tag Filter Notice */}
          {selectedTag && (
            <div className="bg-[#1E40AF]/5 border border-[#1E40AF]/20 rounded-xl p-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-[#1E40AF] font-bold text-sm">#</span>
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

          {selectedTag && filteredArticles.length === 0 && (
            <div className="bg-white border border-gray-100 rounded-xl p-8 text-center">
              <h4 className="text-sm font-bold text-gray-800 mb-1">
                {lang === "ID" ? "Tidak Ada Berita" : "No Articles Found"}
              </h4>
              <p className="text-xs text-gray-500 mb-4">
                {lang === "ID" 
                  ? `Tidak ada berita yang ditemukan dengan tag "${selectedTag}".` 
                  : `No articles found containing the tag "${selectedTag}".`}
              </p>
              <button 
                onClick={() => setSelectedTag(null)}
                className="px-4 py-1.5 bg-[#0D2B5C] text-white text-xs font-bold rounded-lg hover:bg-[#1E40AF] transition-colors cursor-pointer"
              >
                {lang === "ID" ? "Lihat Semua Berita" : "View All Articles"}
              </button>
            </div>
          )}

          {/* Active Search Query Notice */}
          {searchQuery && (
            <div className="bg-[#D71920]/5 border border-[#D71920]/20 rounded-xl p-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-[#D71920] font-bold text-sm">ðŸ”</span>
                <span className="text-sm font-bold text-gray-800">
                  {lang === "ID" ? "Hasil Pencarian" : "Search Results"}: <span className="text-[#0D2B5C] font-black">"{searchQuery}"</span>
                </span>
              </div>
              <button 
                onClick={onSearchClear}
                className="text-xs font-bold text-red-600 hover:text-red-700 cursor-pointer bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-full transition-colors"
              >
                {lang === "ID" ? "Hapus Pencarian" : "Clear Search"} âœ•
              </button>
            </div>
          )}

          {searchQuery && filteredArticles.length === 0 && (
            <div className="bg-white border border-gray-100 rounded-xl p-8 text-center">
              <h4 className="text-sm font-bold text-gray-800 mb-1">
                {lang === "ID" ? "Tidak Ada Berita" : "No Articles Found"}
              </h4>
              <p className="text-xs text-gray-500 mb-4">
                {lang === "ID" 
                  ? `Tidak ada berita yang ditemukan untuk kata kunci "${searchQuery}".` 
                  : `No articles found for search query "${searchQuery}".`}
              </p>
              <button 
                onClick={onSearchClear}
                className="px-4 py-1.5 bg-[#0D2B5C] text-white text-xs font-bold rounded-lg hover:bg-[#1E40AF] transition-colors cursor-pointer"
              >
                {lang === "ID" ? "Lihat Semua Berita" : "View All Articles"}
              </button>
            </div>
          )}

          {/* Section: Headline Slider/Carousel */}
          {headlineArticles.length > 0 && (
            <div 
              onMouseEnter={() => setIsHeadlineHovered(true)}
              onMouseLeave={() => setIsHeadlineHovered(false)}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className="relative overflow-hidden rounded-2xl bg-[#111] group shadow-lg h-[340px] sm:h-[450px]"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={`headline-${activeSlide}`}
                  custom={headlineDirection}
                  variants={{
                    enter: (dir: "left" | "right") => ({
                      x: dir === "right" ? 50 : -50,
                      opacity: 0
                    }),
                    center: {
                      x: 0,
                      opacity: 1
                    },
                    exit: (dir: "left" | "right") => ({
                      x: dir === "right" ? -50 : 50,
                      opacity: 0
                    })
                  }}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="absolute inset-0 w-full h-full"
                >
                  <motion.img 
                    key={`img-${activeSlide}`}
                    src={headlineArticles[activeSlide].image}
                    alt={headlineArticles[activeSlide].title}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.src = "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80";
                    }}
                    initial={{ scale: 1 }}
                    animate={{ scale: 1.06 }}
                    transition={{ duration: 7.5, ease: "linear" }}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                  
                  {/* Bottom text info (with elevated padding-bottom so it doesn't overlap the persistently visible dots) */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 pb-14 sm:pb-16 flex flex-col gap-2.5 z-10">
                    <div className="flex items-center gap-3">
                      <span className="bg-[#D71920] text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full">
                        {headlineArticles[activeSlide].category}
                      </span>
                      <span className="text-[11px] text-gray-300 font-mono flex items-center gap-1">
                        <Calendar size={12} />
                        {formatDate(headlineArticles[activeSlide].publishDate, lang)}
                      </span>
                    </div>
                    <Link to={getArticleUrl(headlineArticles[activeSlide])} className="text-lg sm:text-2xl font-bold text-white hover:text-[#D71920] transition-colors cursor-pointer line-clamp-2 font-sans tracking-tight">
                      {headlineArticles[activeSlide].title}
                    </Link>
                    <p className="text-gray-300 text-xs sm:text-sm line-clamp-2 leading-relaxed opacity-90 max-w-2xl font-light">
                      {headlineArticles[activeSlide].content}
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Dots Indicator - Outside AnimatePresence so it remains persistent and never unmounts during transitions */}
              <div className="absolute bottom-6 sm:bottom-8 left-6 sm:left-8 flex gap-2 z-30">
                {headlineArticles.map((_, idx) => (
                  <span 
                    key={idx} 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (idx > activeSlide) {
                        setHeadlineDirection("right");
                      } else if (idx < activeSlide) {
                        setHeadlineDirection("left");
                      }
                      setActiveSlide(idx);
                    }}
                    className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                      idx === activeSlide ? "w-6 bg-[#D71920]" : "w-1.5 bg-white/40 hover:bg-white/60"
                    }`}
                  />
                ))}
              </div>

              {/* Slide controls */}
              <div className="absolute top-1/2 -translate-y-1/2 left-4 right-4 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity z-20">
                <button 
                  onClick={() => {
                    setHeadlineDirection("left");
                    setActiveSlide(prev => prev === 0 ? headlineArticles.length - 1 : prev - 1);
                  }}
                  className="p-1.5 rounded-full bg-black/60 text-white hover:bg-black/90 cursor-pointer transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                <button 
                  onClick={() => {
                    setHeadlineDirection("right");
                    setActiveSlide(prev => (prev + 1) % headlineArticles.length);
                  }}
                  className="p-1.5 rounded-full bg-black/60 text-white hover:bg-black/90 cursor-pointer transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
              </div>

              {/* Keyframes for the Progress Bar Timer */}
              <style dangerouslySetInnerHTML={{__html: `
                @keyframes headlineProgress {
                  from { width: 0%; }
                  to { width: 100%; }
                }
              `}} />

              {/* Progress Bar (Visual Timer) */}
              <div 
                key={`progress-${activeSlide}-${isHeadlineHovered}`}
                className="absolute bottom-0 left-0 h-[3px] bg-[#D71920] z-30"
                style={{
                  animation: 'headlineProgress 7000ms linear forwards',
                  animationPlayState: isHeadlineHovered ? 'paused' : 'running'
                }}
              />
            </div>
          )}

          {/* Dynamic Hero Banner Ad Slot */}
          <div className="w-full my-6">
            <AdManagerSlot slug="hero-banner" page="homepage" />
          </div>

          {/* Section: Rekomendasi Untuk Anda (Recommended for You) */}
          {editorChoiceList.length > 0 && (
            <div>
              <div className="flex justify-between items-center border-b border-gray-100 pb-3 mb-5">
                <h3 className="text-[#0a3a8e] font-extrabold text-lg md:text-xl tracking-tight">
                  {lang === "ID" ? "Rekomendasi untuk Anda" : "Recommended for You"}
                </h3>
                <button 
                  onClick={() => {
                    if (onCategorySelect) {
                      onCategorySelect("rekomendasi");
                    }
                  }}
                  className="text-xs md:text-sm font-semibold text-gray-800 hover:text-[#0a3a8e] flex items-center gap-1 transition-colors group cursor-pointer"
                >
                  <span>{lang === "ID" ? "Selengkapnya" : "See More"}</span>
                  <ChevronRight size={15} className="text-gray-600 group-hover:text-[#0a3a8e] transition-colors" />
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-4 gap-y-6">
                {editorChoiceList.map((art, idx) => {
                  return (
                    <div 
                      key={art.id} 
                      className={`flex flex-col cursor-pointer group ${idx >= 4 ? "hidden sm:flex" : "flex"}`}
                      onClick={() => onSelectArticle(art)}
                    >
                      <div className="relative overflow-hidden aspect-video rounded-lg bg-gray-50 mb-2">
                        <img 
                          src={art.image} 
                          alt={art.title} 
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            e.currentTarget.src = "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80";
                          }}
                          className="w-full h-full object-cover rounded-lg group-hover:scale-102 transition-transform duration-300"
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] sm:text-[10px] text-[#f15a24] font-semibold tracking-wide block mb-1 uppercase">
                          {art.subCategory || art.category}
                        </span>
                        <h4 className="text-[11px] sm:text-xs font-bold text-gray-900 leading-snug line-clamp-3 group-hover:text-[#0a3a8e] transition-colors">
                          {art.title}
                        </h4>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Dynamic Homepage Banner Tengah */}
          {!selectedCategory && !selectedTag && !searchQuery && (
            <div className="w-full my-6">
              <AdManagerSlot slug="homepage-banner-tengah" page="homepage" />
            </div>
          )}

          {/* Section: Aliran Berita Terbaru (Recent News Feed in Vertical List) */}
          <div id="aliran-berita-terbaru" className="border-t border-gray-100 pt-5">
            <div className="flex items-center gap-2 border-b pb-2 mb-5">
              <Clock className="text-[#0D2B5C]" size={18} />
              <h4 className="text-sm font-black uppercase tracking-wider text-[#0D2B5C]">
                {lang === "ID" ? "Berita Terbaru" : "Recent News Feed"}
              </h4>
            </div>

            <div className="flex flex-col gap-1">
              {/* First 4 articles */}
              {currentPageArticles.slice(0, 4).map(art => (
                <Link key={art.id} to={getArticleUrl(art)} className="flex flex-row gap-3.5 py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50/50 px-2 rounded-lg transition-colors cursor-pointer group">
                  <div className="relative overflow-hidden w-24 sm:w-36 h-20 sm:h-24 rounded-md shrink-0 bg-gray-50">
                    <img 
                      src={art.image} 
                      alt={art.title} 
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.src = "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80";
                      }}
                      className="w-full h-full object-cover transform group-hover:scale-102 transition-transform duration-300" 
                    />
                  </div>
                  <div className="flex flex-col justify-between py-0.5 flex-1">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] text-[#1E40AF] font-bold uppercase tracking-wider">
                          {art.subCategory || art.category}
                        </span>
                        <span className="text-gray-300 text-[10px]">•</span>
                        <span className="text-[10px] text-gray-400 font-mono">
                          {formatDate(art.publishDate, lang)}
                        </span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-gray-900 line-clamp-2 leading-snug group-hover:text-[#1E40AF] transition-colors mb-1">
                        {art.title}
                      </h4>
                      <p className="text-gray-500 text-[11px] sm:text-xs line-clamp-2 leading-relaxed">
                        {art.content}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 text-[10px] text-gray-400 font-mono mt-1.5">
                      <span className="font-medium text-gray-500">Oleh: {art.author}</span>
                    </div>
                  </div>
                </Link>
              ))}



              {/* Dynamic In Feed #1 Ad Slot */}
              {currentPageArticles.length >= 4 && (
                <div className="w-full my-3">
                  <AdManagerSlot slug="in-feed-1" page={selectedCategory ? "kategori" : "homepage"} category={selectedCategory} />
                  <AdManagerSlot slug="mobile-in-feed-banner" page={selectedCategory ? "kategori" : "homepage"} category={selectedCategory} />
                </div>
              )}

              {/* Special Politik Block after 4 articles */}
              {currentPageArticles.length >= 4 && filteredArticles.filter(a => isCategory(a, "Politik")).length > 0 && (
                <div className="border border-gray-100 bg-slate-50/60 rounded-xl p-3 sm:p-4 my-3">
                  <div className="border-b border-gray-200 pb-1.5 mb-3 flex justify-between items-center">
                    <h4 className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-[#0a3a8e] border-l-3 border-[#0a3a8e] pl-2 flex items-center gap-1.5">
                      {lang === "ID" ? "POLITIK" : "POLITICS"}
                    </h4>
                    {onCategorySelect && (
                      <button 
                        onClick={() => {
                          onCategorySelect("Berita", "Politik");
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="text-[10px] sm:text-xs font-semibold text-gray-600 hover:text-[#0a3a8e] flex items-center gap-0.5 transition-colors group cursor-pointer"
                      >
                        <span>{lang === "ID" ? "Selengkapnya" : "See More"}</span>
                        <ChevronRight size={13} className="text-gray-400 group-hover:text-[#0a3a8e] transition-colors" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-3">
                    {(() => {
                      const list = filteredArticles.filter(a => isCategory(a, "Politik"));
                      const targetCount = 9;
                      const results = [...list];
                      while (results.length < targetCount && list.length > 0) {
                        results.push(...list.map(a => ({ ...a, id: `${a.id}-dup-${results.length}` })));
                      }
                      return results.slice(0, targetCount);
                    })().map((art, idx) => (
                      <Link key={`special-politik-${art.id}`} to={getArticleUrl(art)} className={`cursor-pointer group gap-2 items-start p-1 hover:bg-white rounded-lg transition-colors ${idx>= 5 ? "hidden md:flex" : "flex"}`}>
                        <div className="relative overflow-hidden w-12 h-12 sm:w-14 sm:h-14 rounded-lg shrink-0 bg-gray-100">
                          <img 
                            src={art.image} 
                            alt={art.title} 
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              e.currentTarget.src = "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80";
                            }}
                            className="w-full h-full object-cover transform group-hover:scale-102 transition-transform duration-300" 
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="text-[11px] sm:text-[12px] font-bold text-gray-900 line-clamp-2 leading-tight group-hover:text-[#0a3a8e] transition-colors">
                            {art.title}
                          </h5>
                          <span className="text-[9px] sm:text-[10px] text-gray-400 font-mono block mt-1">
                            {formatDate(art.publishDate, lang)}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Remaining articles: slice 4 to 8 */}
              {currentPageArticles.length > 4 && currentPageArticles.slice(4, 8).map(art => (
                <Link key={art.id} to={getArticleUrl(art)} className="flex flex-row gap-3.5 py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50/50 px-2 rounded-lg transition-colors cursor-pointer group">
                  <div className="relative overflow-hidden w-24 sm:w-36 h-20 sm:h-24 rounded-md shrink-0 bg-gray-50">
                    <img 
                      src={art.image} 
                      alt={art.title} 
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.src = "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80";
                      }}
                      className="w-full h-full object-cover transform group-hover:scale-102 transition-transform duration-300" 
                    />
                  </div>
                  <div className="flex flex-col justify-between py-0.5 flex-1">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] text-[#1E40AF] font-bold uppercase tracking-wider">
                          {art.subCategory || art.category}
                        </span>
                        <span className="text-gray-300 text-[10px]">•</span>
                        <span className="text-[10px] text-gray-400 font-mono">
                          {formatDate(art.publishDate, lang)}
                        </span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-gray-900 line-clamp-2 leading-snug group-hover:text-[#1E40AF] transition-colors mb-1">
                        {art.title}
                      </h4>
                      <p className="text-gray-500 text-[11px] sm:text-xs line-clamp-2 leading-relaxed">
                        {art.content}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 text-[10px] text-gray-400 font-mono mt-1.5">
                      <span className="font-medium text-gray-500">Oleh: {art.author}</span>
                    </div>
                  </div>
                </Link>
              ))}



              {/* Dynamic In Feed #2 Ad Slot */}
              {currentPageArticles.length >= 8 && (
                <div className="w-full my-3">
                  <AdManagerSlot slug="in-feed-2" page={selectedCategory ? "kategori" : "homepage"} category={selectedCategory} />
                </div>
              )}

              {/* Special Kesehatan Block after 8 articles */}
              {currentPageArticles.length >= 8 && kesehatanChunks.length > 0 && (
                <div className="border border-gray-100 bg-rose-50/30 rounded-xl p-3 sm:p-4 my-3">
                  <div className="border-b border-gray-200 pb-1.5 mb-3 flex justify-between items-center">
                    <h4 className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-rose-800 border-l-3 border-rose-600 pl-2 flex items-center gap-1.5">
                      <Activity size={14} className="text-rose-600" />
                      {lang === "ID" ? "KESEHATAN" : "HEALTH"}
                    </h4>
                    {onCategorySelect && (
                      <button 
                        onClick={() => {
                          onCategorySelect("Kesehatan");
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="text-[10px] sm:text-xs font-semibold text-gray-600 hover:text-rose-700 flex items-center gap-0.5 transition-colors group cursor-pointer"
                      >
                        <span>{lang === "ID" ? "Selengkapnya" : "See More"}</span>
                        <ChevronRight size={13} className="text-gray-400 group-hover:text-rose-600 transition-colors" />
                      </button>
                    )}
                  </div>
                  {/* Grid Carousel with 3 Columns on desktop and 1 Column on mobile with arrow navigation & motion animation */}
                  <div className="relative px-6 sm:px-8">
                    {/* Left Arrow */}
                    {kesehatanChunks.length > 1 && (
                      <button 
                        onClick={handlePrevKesehatan}
                        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-xs text-gray-600 hover:text-rose-700 hover:border-rose-300 transition-all cursor-pointer active:scale-95"
                        aria-label="Previous slide"
                      >
                        <ChevronLeft size={16} />
                      </button>
                    )}

                    <div className="overflow-hidden relative min-h-[170px] sm:min-h-[190px]">
                      <AnimatePresence mode="wait" initial={false}>
                        <motion.div
                          key={`kesehatan-slide-${activeKesehatanSlide}`}
                          custom={slideDirection}
                          variants={{
                            enter: (dir: "left" | "right") => ({
                              x: dir === "right" ? 30 : -30,
                              opacity: 0
                            }),
                            center: {
                              x: 0,
                              opacity: 1
                            },
                            exit: (dir: "left" | "right") => ({
                              x: dir === "right" ? -30 : 30,
                              opacity: 0
                            })
                          }}
                          initial="enter"
                          animate="center"
                          exit="exit"
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
                        >
                          {(kesehatanChunks[activeKesehatanSlide] || kesehatanChunks[0] || []).map(art => (
                            <Link key={`special-kesehatan-${art.id}`} to={getArticleUrl(art)} className="cursor-pointer group flex flex-row sm:flex-col gap-3.5 sm:gap-2 p-2 hover:bg-white rounded-lg transition-all duration-300 bg-white/40 border border-transparent hover:border-gray-100 shadow-2xs">
                              <div className="relative overflow-hidden w-24 sm:w-full h-20 sm:h-28 rounded-md shrink-0 bg-gray-100">
                                <img 
                                  src={art.image} 
                                  alt={art.title} 
                                  referrerPolicy="no-referrer"
                                  onError={(e) => {
                                    e.currentTarget.src = "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=800&q=80";
                                  }}
                                  className="w-full h-full object-cover transform group-hover:scale-102 transition-transform duration-300" 
                                />
                              </div>
                              <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                                <h5 className="text-xs sm:text-xs font-bold text-gray-900 line-clamp-2 leading-snug group-hover:text-rose-700 transition-colors">
                                  {art.title}
                                </h5>
                                <span className="text-[9px] text-gray-400 font-mono block mt-1 sm:mt-1.5">
                                  {formatDate(art.publishDate, lang)}
                                </span>
                              </div>
                            </Link>
                          ))}
                        </motion.div>
                      </AnimatePresence>
                    </div>

                    {/* Right Arrow */}
                    {kesehatanChunks.length > 1 && (
                      <button 
                        onClick={handleNextKesehatan}
                        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-xs text-gray-600 hover:text-rose-700 hover:border-rose-300 transition-all cursor-pointer active:scale-95"
                        aria-label="Next slide"
                      >
                        <ChevronRight size={16} />
                      </button>
                    )}
                  </div>

                  {/* Dot Indicators */}
                  {kesehatanChunks.length > 1 && (
                    <div className="flex justify-center gap-1.5 mt-3">
                      {kesehatanChunks.map((_, idx) => {
                        const currentActive = activeKesehatanSlide >= kesehatanChunks.length ? 0 : activeKesehatanSlide;
                        return (
                          <button
                            key={`kesehatan-dot-${idx}`}
                            onClick={() => {
                              setSlideDirection(idx > currentActive ? "right" : "left");
                              setActiveKesehatanSlide(idx);
                            }}
                            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                              currentActive === idx 
                                ? "bg-rose-600 w-3" 
                                : "bg-gray-300 hover:bg-gray-400"
                            }`}
                            aria-label={`Go to slide ${idx + 1}`}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Remaining articles starting from index 8 */}
              {currentPageArticles.length > 8 && currentPageArticles.slice(8).map((art, idx) => (
                <React.Fragment key={art.id}>
                  <Link to={getArticleUrl(art)} className="flex flex-row gap-3.5 py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50/50 px-2 rounded-lg transition-colors cursor-pointer group">
                    <div className="relative overflow-hidden w-24 sm:w-36 h-20 sm:h-24 rounded-md shrink-0 bg-gray-50">
                      <img 
                        src={art.image} 
                        alt={art.title} 
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          e.currentTarget.src = "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80";
                        }}
                        className="w-full h-full object-cover transform group-hover:scale-102 transition-transform duration-300" 
                      />
                    </div>
                    <div className="flex flex-col justify-between py-0.5 flex-1">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] text-[#1E40AF] font-bold uppercase tracking-wider">
                            {art.subCategory || art.category}
                          </span>
                          <span className="text-gray-300 text-[10px]">•</span>
                          <span className="text-[10px] text-gray-400 font-mono">
                            {formatDate(art.publishDate, lang)}
                          </span>
                        </div>
                        <h4 className="text-xs sm:text-sm font-bold text-gray-900 line-clamp-2 leading-snug group-hover:text-[#1E40AF] transition-colors mb-1">
                          {art.title}
                        </h4>
                        <p className="text-gray-500 text-[11px] sm:text-xs line-clamp-2 leading-relaxed">
                          {art.content}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 text-[10px] text-gray-400 font-mono mt-1.5">
                        <span className="font-medium text-gray-500">Oleh: {art.author}</span>
                      </div>
                    </div>
                  </Link>

                  {idx === 3 && (
                    <div className="w-full my-3">
                      <AdManagerSlot slug="in-feed-3" page={selectedCategory ? "kategori" : "homepage"} category={selectedCategory} />
                    </div>
                  )}
                  {idx === 7 && (
                    <div className="w-full my-3">
                      <AdManagerSlot slug="in-feed-4" page={selectedCategory ? "kategori" : "homepage"} category={selectedCategory} />
                    </div>
                  )}

                </React.Fragment>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-8 flex flex-col items-center gap-4 border-t border-gray-100 pt-6">
                {/* Stats info */}
                <span className="text-[11px] font-mono text-gray-400">
                  {lang === "ID" 
                    ? `Menampilkan ${((recentPage - 1) * ITEMS_PER_PAGE) + 1} - ${Math.min(recentPage * ITEMS_PER_PAGE, filteredArticles.length)} dari ${filteredArticles.length} berita`
                    : `Showing ${((recentPage - 1) * ITEMS_PER_PAGE) + 1} - ${Math.min(recentPage * ITEMS_PER_PAGE, filteredArticles.length)} of ${filteredArticles.length} stories`}
                </span>

                {/* Page Navigation Controls */}
                <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                  {/* Previous Button */}
                  <button
                    disabled={recentPage === 1}
                    onClick={() => {
                      setRecentPage(prev => Math.max(prev - 1, 1));
                    }}
                    className="h-8.5 px-3 sm:px-4 rounded-lg border border-gray-200 bg-white text-xs font-bold text-gray-600 hover:text-[#0D2B5C] hover:border-[#0D2B5C] transition-all cursor-pointer flex items-center gap-1 select-none disabled:opacity-40 disabled:pointer-events-none active:scale-98"
                  >
                    <ChevronLeft size={14} />
                    <span className="hidden sm:inline">{lang === "ID" ? "Sebelumnya" : "Previous"}</span>
                  </button>

                  {/* Page Numbers */}
                                    {(() => {
                    const pages = [];
                    const maxPageDisplay = 5;
                    let startPage = Math.max(1, recentPage - Math.floor(maxPageDisplay / 2));
                    let endPage = Math.min(totalPages, startPage + maxPageDisplay - 1);

                    if (endPage - startPage + 1 < maxPageDisplay) {
                      startPage = Math.max(1, endPage - maxPageDisplay + 1);
                    }

                    // First page if not in range
                    if (startPage > 1) {
                      pages.push(
                        <button
                          key={1}
                          onClick={() => {
                            setRecentPage(1);
                          }}
                          className={`w-8.5 h-8.5 rounded-lg border text-xs font-mono font-bold transition-all cursor-pointer flex items-center justify-center select-none active:scale-95 ${
                            recentPage === 1
                              ? "bg-[#0D2B5C] text-white border-[#0D2B5C]"
                              : "border-gray-200 bg-white text-gray-600 hover:border-[#0D2B5C] hover:text-[#0D2B5C]"
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
                            setRecentPage(p);
                          }}
                          className={`w-8.5 h-8.5 rounded-lg border text-xs font-mono font-bold transition-all cursor-pointer flex items-center justify-center select-none active:scale-95 ${
                            recentPage === p
                              ? "bg-[#0D2B5C] text-white border-[#0D2B5C]"
                              : "border-gray-200 bg-white text-gray-600 hover:border-[#0D2B5C] hover:text-[#0D2B5C]"
                          }`}
                        >
                          {p}
                        </button>
                      );
                    }

                    // Last page if not in range
                    if (endPage < totalPages) {
                      if (endPage < totalPages - 1) {
                        pages.push(
                          <span key="ellipsis-end" className="text-gray-400 text-xs px-1 font-mono">
                            ...
                          </span>
                        );
                      }
                      pages.push(
                        <button
                          key={totalPages}
                          onClick={() => {
                            setRecentPage(totalPages);
                          }}
                          className={`w-8.5 h-8.5 rounded-lg border text-xs font-mono font-bold transition-all cursor-pointer flex items-center justify-center select-none active:scale-95 ${
                            recentPage === totalPages
                              ? "bg-[#0D2B5C] text-white border-[#0D2B5C]"
                              : "border-gray-200 bg-white text-gray-600 hover:border-[#0D2B5C] hover:text-[#0D2B5C]"
                          }`}
                        >
                          {totalPages}
                        </button>
                      );
                    }

                    return pages;
                  })()}

                  {/* Next Button */}
                  <button
                    disabled={recentPage === totalPages}
                    onClick={() => {
                      setRecentPage(prev => Math.min(prev + 1, totalPages));
                    }}
                    className="h-8.5 px-3 sm:px-4 rounded-lg border border-gray-200 bg-white text-xs font-bold text-gray-600 hover:text-[#0D2B5C] hover:border-[#0D2B5C] transition-all cursor-pointer flex items-center gap-1 select-none disabled:opacity-40 disabled:pointer-events-none active:scale-98"
                  >
                    <span className="hidden sm:inline">{lang === "ID" ? "Selanjutnya" : "Next"}</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 3. MIDDLE ZONE: Categorized Grid blocks with ads */}
          <div className="w-full border-t border-b border-gray-100 py-8 my-4 grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Otomotif Block */}
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center border-b pb-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-[#0D2B5C] border-l-3 border-[#0D2B5C] pl-2">
                  OTOMOTIF
                </h4>
                {onCategorySelect && (
                  <button 
                    onClick={() => {
                      onCategorySelect("Otomotif");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="text-[#0D2B5C] hover:text-[#D71920] transition-colors p-1 cursor-pointer flex items-center group"
                    title={lang === "ID" ? "Lihat Semua Otomotif" : "See All Automotive"}
                  >
                    <ChevronRight size={16} className="transform group-hover:translate-x-0.5 transition-transform" />
                  </button>
                )}
              </div>
              <div className="flex flex-col gap-4">
                {otomotifArticles.map(art => (
                  <Link key={art.id} to={getArticleUrl(art)} className="cursor-pointer group flex gap-3">
                    <img 
                      src={art.image} 
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.src = "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=400&q=80";
                      }}
                      className="w-16 h-16 object-cover rounded-lg shrink-0" 
                    />
                    <div>
                      <h5 className="text-xs font-bold text-gray-800 line-clamp-2 leading-tight group-hover:text-[#1E40AF]">
                        {art.title}
                      </h5>
                      <span className="text-[10px] text-gray-400 block mt-1">{formatDate(art.publishDate, lang)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Hiburan Block */}
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center border-b pb-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-[#0D2B5C] border-l-3 border-[#1E40AF] pl-2">
                  HIBURAN
                </h4>
                {onCategorySelect && (
                  <button 
                    onClick={() => {
                      onCategorySelect("Hiburan");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="text-[#0D2B5C] hover:text-[#D71920] transition-colors p-1 cursor-pointer flex items-center group"
                    title={lang === "ID" ? "Lihat Semua Hiburan" : "See All Entertainment"}
                  >
                    <ChevronRight size={16} className="transform group-hover:translate-x-0.5 transition-transform" />
                  </button>
                )}
              </div>
              <div className="flex flex-col gap-4">
                {hiburanArticles.map(art => (
                  <Link key={art.id} to={getArticleUrl(art)} className="cursor-pointer group flex gap-3">
                    <img 
                      src={art.image} 
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.src = "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&q=80";
                      }}
                      className="w-16 h-16 object-cover rounded-lg shrink-0" 
                    />
                    <div>
                      <h5 className="text-xs font-bold text-gray-800 line-clamp-2 leading-tight group-hover:text-[#1E40AF]">
                        {art.title}
                      </h5>
                      <span className="text-[10px] text-gray-400 block mt-1">{formatDate(art.publishDate, lang)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Teknologi Block */}
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center border-b pb-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-[#0D2B5C] border-l-3 border-[#D71920] pl-2">
                  TEKNOLOGI
                </h4>
                {onCategorySelect && (
                  <button 
                    onClick={() => {
                      onCategorySelect("Teknologi");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="text-[#0D2B5C] hover:text-[#D71920] transition-colors p-1 cursor-pointer flex items-center group"
                    title={lang === "ID" ? "Lihat Semua Teknologi" : "See All Technology"}
                  >
                    <ChevronRight size={16} className="transform group-hover:translate-x-0.5 transition-transform" />
                  </button>
                )}
              </div>
              <div className="flex flex-col gap-4">
                {techArticles.map(art => (
                  <Link key={art.id} to={getArticleUrl(art)} className="cursor-pointer group flex gap-3">
                    <img 
                      src={art.image} 
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.src = "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80";
                      }}
                      className="w-16 h-16 object-cover rounded-lg shrink-0" 
                    />
                    <div>
                      <h5 className="text-xs font-bold text-gray-800 line-clamp-2 leading-tight group-hover:text-[#1E40AF]">
                        {art.title}
                      </h5>
                      <span className="text-[10px] text-gray-400 block mt-1">{formatDate(art.publishDate, lang)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

          </div>



        </div>

        {/* RIGHT COLUMN: Trending, Widgets, Live Rates & Poll */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          
          {/* Dynamic Sidebar Top Ad Slot */}
          <AdManagerSlot slug="sidebar-top" page={selectedCategory ? "kategori" : "homepage"} category={selectedCategory} />

          {/* Widgets: Financial Stock Market Rates */}
          {marketSettings.enabled && (
            <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-xs">
              <div className="flex items-center justify-between pb-2 mb-4 border-b">
                <div className="flex items-center gap-2">
                  <BarChart2 className="text-[#1E40AF]" size={16} />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#0D2B5C]">
                    {lang === "ID" ? "IHSG & PASAR" : "MARKET INDEXES"}
                  </h4>
                </div>
                <span className="flex items-center gap-1 bg-red-50 text-[9px] text-red-600 font-bold px-2 py-0.5 rounded-full animate-pulse uppercase tracking-wider">
                  <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                  {lang === "ID" ? "Live" : "Live"}
                </span>
              </div>
              
              <div className="flex flex-col gap-3">
                {/* IHSG */}
                {marketSettings.ihsgEnabled && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50/60 border border-slate-100 hover:border-[#1E40AF]/20 transition-all duration-200">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">IHSG</span>
                      <span className="text-[10px] text-slate-400 mt-0.5">{lang === "ID" ? "Indeks Gabungan" : "Composite Index"}</span>
                    </div>
                    <AnimatedMarketRate 
                      price={marketRates.ihsg?.price ?? null} 
                      change={marketRates.ihsg?.change ?? null} 
                      status={marketRates.ihsg?.status ?? "stable"} 
                    />
                  </div>
                )}

                {/* USD/IDR */}
                {marketSettings.usdEnabled && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50/60 border border-slate-100 hover:border-red-100 transition-all duration-200">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">USD / IDR</span>
                      <span className="text-[10px] text-slate-400 mt-0.5">{lang === "ID" ? "Rupiah Indonesia" : "Indonesian Rupiah"}</span>
                    </div>
                    <AnimatedMarketRate 
                      price={marketRates.usd?.price ?? null} 
                      change={marketRates.usd?.change ?? null} 
                      status={marketRates.usd?.status ?? "stable"} 
                      prefix="Rp "
                      isInteger={true}
                    />
                  </div>
                )}

                {/* Emas LM */}
                {marketSettings.goldEnabled && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50/60 border border-slate-100 hover:border-[#D71920]/20 transition-all duration-200">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Emas LM</span>
                      <span className="text-[10px] text-slate-400 mt-0.5">{lang === "ID" ? "Antam (per gram)" : "Fine Gold (per gram)"}</span>
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
                )}

                {/* Kripto (BTC) */}
                {marketSettings.kriptoEnabled && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50/60 border border-slate-100 hover:border-amber-100 transition-all duration-200">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">BTC / IDR</span>
                      <span className="text-[10px] text-slate-400 mt-0.5">{lang === "ID" ? "Bitcoin Rupiah" : "Bitcoin Price"}</span>
                    </div>
                    <AnimatedMarketRate 
                      price={marketRates.crypto?.price ?? null} 
                      change={marketRates.crypto?.change ?? null} 
                      status={marketRates.crypto?.status ?? "stable"} 
                      prefix="Rp "
                      isInteger={true}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Dynamic Sidebar Middle Ad Slot */}
          <AdManagerSlot slug="sidebar-middle" page={selectedCategory ? "kategori" : "homepage"} category={selectedCategory} />

          {/* Section: Trending News (Top 5) */}
          {trendingList.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-xs">
              <div className="flex items-center gap-2 pb-2 mb-4 border-b">
                <TrendingUp className="text-[#0D2B5C]" size={16} />
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#0D2B5C]">
                  {lang === "ID" ? "Berita Terpopuler" : "Most Popular"}
                </h4>
              </div>
              <div className="flex flex-col gap-4">
                {trendingList.map((art, idx) => (
                  <Link key={art.id} to={getArticleUrl(art)} className="flex gap-3 items-start cursor-pointer group">
                    <span className="text-2xl font-black text-gray-200 group-hover:text-[#1E40AF] transition-colors leading-none w-6 text-center">
                      {idx + 1}
                    </span>
                    <div>
                      <h5 className="text-xs font-bold text-gray-800 line-clamp-2 leading-tight group-hover:text-[#1E40AF] transition-colors">
                        {art.title}
                      </h5>
                      <span className="text-[9px] text-[#1E40AF] font-bold uppercase tracking-wider block mt-1">
                        {art.subCategory || art.category}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}



          {/* Kategori Olahraga Panel (Replaces Infografis Panel) */}
          <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b mb-5">
              <div className="flex items-center gap-2">
                <Trophy className="text-[#0D2B5C]" size={18} />
                <h4 className="text-sm font-bold uppercase tracking-wider text-[#0D2B5C]">
                  {lang === "ID" ? "OLAHRAGA" : "SPORTS"}
                </h4>
              </div>
              {onCategorySelect && (
                <button 
                  onClick={() => {
                    onCategorySelect("Olahraga");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="text-xs font-bold text-[#0D2B5C] hover:text-[#D71920] transition-colors flex items-center gap-0.5 cursor-pointer"
                >
                  <span>{lang === "ID" ? "Selengkapnya" : "See More"}</span>
                  <ChevronRight size={13} />
                </button>
              )}
            </div>
            
            <div className="flex flex-col gap-4">
              {(() => {
                const sportList = articles.filter(a => isCategory(a, "Olahraga"));
                if (sportList.length === 0) {
                  return (
                    <div className="text-center py-6 text-xs text-gray-400">
                      {lang === "ID" ? "Tidak ada artikel olahraga tersedia." : "No sports articles available."}
                    </div>
                  );
                }
                return sportList.slice(0, 6).map((art) => (
                  <Link key={`side-sport-${art.id}`} to={getArticleUrl(art)} className="flex gap-3 items-start cursor-pointer group hover:bg-slate-50/50 p-1.5 rounded-lg transition-all duration-200">
                    <div className="w-20 h-14 rounded-lg overflow-hidden shrink-0 bg-gray-100 border border-gray-100">
                      <img 
                        src={art.image} 
                        alt={art.title} 
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          e.currentTarget.src = "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=150&q=80";
                        }}
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="text-xs font-bold text-gray-800 line-clamp-2 leading-snug group-hover:text-[#1E40AF] transition-colors">
                        {art.title}
                      </h5>
                      <span className="text-[9px] text-gray-400 font-mono block mt-1.5">
                        {formatDate(art.publishDate, lang)}
                      </span>
                    </div>
                  </Link>
                ));
              })()}
            </div>
          </div>

          {/* Section: Tag Terpopuler */}
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-xs">
            <h4 className="text-base sm:text-lg font-black text-[#1E40AF] tracking-tight mb-5">
              {lang === "ID" ? "Tag Terpopuler" : "Popular Tags"}
            </h4>
            <div className="flex flex-col gap-4.5 pl-0.5">
              {[
                "piala dunia 2026",
                "juara bola 2026",
                "amerika serikat",
                "motogp belanda",
                "restoran legendaris"
              ].map((tag) => (
                <div 
                  key={tag}
                  onClick={() => {
                    setSelectedTag(prev => prev === tag ? null : tag);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="flex items-baseline cursor-pointer group select-none"
                >
                  <span className={`font-bold mr-2 text-sm transition-colors duration-200 ${selectedTag === tag ? "text-[#1E40AF]" : "text-gray-400 group-hover:text-gray-600"}`}>
                    #
                  </span>
                  <span className={`text-sm font-bold tracking-tight lowercase transition-colors duration-200 ${selectedTag === tag ? "text-[#1E40AF]" : "text-gray-900 group-hover:text-[#1E40AF]"}`}>
                    {tag}
                  </span>
                </div>
              ))}
            </div>
          </div>



          {/* Opini & Editorial Column (20, 21, 25) */}
          <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 pb-2 border-b mb-5">
                <Award className="text-[#0D2B5C]" size={18} />
                <h4 className="text-sm font-bold uppercase tracking-wider text-[#0D2B5C]">
                  {lang === "ID" ? "OPINI" : "OPINION"}
                </h4>
              </div>

              <div className="flex flex-col gap-5">
                {opinionArticles.map((art, idx) => {
                  const isImageLeft = idx % 2 === 0;
                  return (
                    <Link key={art.id} to={getArticleUrl(art)} className="cursor-pointer hover:bg-gray-50/70 p-2 rounded-lg transition-all flex items-center gap-4">
                      {isImageLeft ? (
                        <>
                          <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-gray-100 border border-gray-100/80 shadow-xs">
                            <img 
                              src={art.image} 
                              alt={art.title} 
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                e.currentTarget.src = "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=150&q=80";
                              }}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="text-xs font-bold text-gray-900 leading-snug line-clamp-3 hover:text-[#1E40AF] transition-colors">
                              {art.title}
                            </h5>
                            <span className="text-[10px] text-[#D71920] font-semibold block mt-1.5">
                              {art.author || "Redaksi"}
                            </span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex-1 min-w-0">
                            <h5 className="text-xs font-bold text-gray-900 leading-snug line-clamp-3 hover:text-[#1E40AF] transition-colors">
                              {art.title}
                            </h5>
                            <span className="text-[10px] text-[#D71920] font-semibold block mt-1.5">
                              {art.author || "Redaksi"}
                            </span>
                          </div>
                          <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-gray-100 border border-gray-100/80 shadow-xs">
                            <img 
                              src={art.image} 
                              alt={art.title} 
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                e.currentTarget.src = "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=150&q=80";
                              }}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        </>
                      )}
                    </Link>
                  );
                })}
              </div>

              {onCategorySelect && (
                <div className="mt-5 pt-3 border-t border-gray-100 flex justify-end">
                  <button 
                    onClick={() => {
                      onCategorySelect("Opini");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="text-xs font-bold text-[#0D2B5C] hover:text-[#D71920] transition-colors flex items-center gap-1 cursor-pointer group"
                  >
                    <span>{lang === "ID" ? "Lihat Semua" : "View All"}</span>
                    <ChevronRight size={14} className="transform group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              )}
            </div>
          </div>



          {/* Lifestyle Panel (added after Side Ads 3) */}
          <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b mb-5">
              <div className="flex items-center gap-2">
                <Sparkles className="text-[#0D2B5C]" size={18} />
                <h4 className="text-sm font-bold uppercase tracking-wider text-[#0D2B5C]">
                  {lang === "ID" ? "LIFESTYLE" : "LIFESTYLE"}
                </h4>
              </div>
              {onCategorySelect && (
                <button 
                  onClick={() => {
                    onCategorySelect("Lifestyle");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="text-xs font-bold text-[#0D2B5C] hover:text-[#D71920] transition-colors flex items-center gap-0.5 cursor-pointer"
                >
                  <span>{lang === "ID" ? "Selengkapnya" : "See More"}</span>
                  <ChevronRight size={13} />
                </button>
              )}
            </div>

            {(() => {
              // Get articles for lifestyle. Fall back to Otomotif, Hiburan, Teknologi to ensure we have variety
              const originalLifestyle = articles.filter(a => isCategory(a, "Lifestyle"));
              const fallbackCategories = ["Otomotif", "Hiburan", "Teknologi", "Ekonomi", "Kesehatan"];
              let list = [...originalLifestyle];
              
              if (list.length < 5) {
                const addedIds = new Set(list.map(a => a.id));
                for (const catName of fallbackCategories) {
                  const extra = articles.filter(a => isCategory(a, catName) && !addedIds.has(a.id));
                  for (const art of extra) {
                    if (list.length >= 5) break;
                    list.push(art);
                    addedIds.add(art.id);
                  }
                  if (list.length >= 5) break;
                }
              }

              // Double fallback if somehow we still don't have enough articles
              if (list.length < 5) {
                const addedIds = new Set(list.map(a => a.id));
                for (const art of articles) {
                  if (list.length >= 5) break;
                  if (!addedIds.has(art.id)) {
                    list.push(art);
                    addedIds.add(art.id);
                  }
                }
              }

              const displayList = list.slice(0, 5);

              if (displayList.length === 0) {
                return (
                  <div className="text-center py-6 text-xs text-gray-400">
                    {lang === "ID" ? "Tidak ada artikel lifestyle tersedia." : "No lifestyle articles available."}
                  </div>
                );
              }

              const firstArt = displayList[0];
              const remainingArts = displayList.slice(1);

              const mockTimesID = [
                "6 menit yang lalu",
                "13 menit yang lalu",
                "28 menit yang lalu",
                "36 menit yang lalu",
                "50 menit yang lalu"
              ];

              const mockTimesEN = [
                "6 minutes ago",
                "13 minutes ago",
                "28 minutes ago",
                "36 minutes ago",
                "50 minutes ago"
              ];

              const getRelativeTime = (idx: number) => {
                return lang === "ID" ? mockTimesID[idx] : mockTimesEN[idx];
              };

              const fallbackImages = [
                "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=800&q=80"
              ];

              return (
                <div className="flex flex-col gap-4">
                  {/* First Art (Large Hero with overlay) */}
                  <Link to={getArticleUrl(firstArt)} className="relative w-full h-48 rounded-lg overflow-hidden cursor-pointer group shadow-xs border border-gray-100">
                    <img 
                      src={firstArt.image || fallbackImages[0]} 
                      alt={firstArt.title} 
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.src = fallbackImages[0];
                      }}
                      className="w-full h-full object-cover transform group-hover:scale-102 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent flex flex-col justify-end p-4">
                      <span className="text-[10px] font-black uppercase tracking-wider text-red-400 mb-1">
                        {firstArt.subCategory || firstArt.category || "Lifestyle"}
                      </span>
                      <h5 className="text-xs sm:text-sm font-bold text-white line-clamp-2 leading-snug group-hover:text-red-400 transition-colors">
                        {firstArt.title}
                      </h5>
                      <span className="text-[10px] text-gray-300 mt-2 font-mono">
                        {getRelativeTime(0)}
                      </span>
                    </div>
                  </Link>

                  {/* Remaining 4 Arts (List format matching request) */}
                  <div className="flex flex-col gap-4 mt-1">
                    {remainingArts.map((art, idx) => (
                      <Link key={`side-lifestyle-${art.id}`} to={getArticleUrl(art)} className="cursor-pointer group flex flex-col gap-1 border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#D71920]">
                          {art.subCategory || art.category || "Lifestyle"}
                        </span>
                        <h5 className="text-xs sm:text-sm font-bold text-gray-900 leading-snug line-clamp-2 group-hover:text-[#1E40AF] transition-colors">
                          {art.title}
                        </h5>
                        <span className="text-[10px] text-gray-400 font-mono mt-1">
                          {getRelativeTime(idx + 1)}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Interactive Poll Widget */}
          <div className="bg-gradient-to-br from-[#0D2B5C] to-[#1E40AF] text-white rounded-xl p-5 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl" />
            <span className="text-[10px] font-bold text-[#D71920] bg-white/10 px-2.5 py-1 rounded-full uppercase tracking-wider mb-3.5 inline-block">
              POLLING MASYARAKAT
            </span>
            <h5 className="text-xs sm:text-sm font-bold leading-snug mb-4">
              Apakah Anda setuju dengan pemanfaatan AI (Kecerdasan Buatan) untuk menyederhanakan layanan publik di tingkat kelurahan?
            </h5>

            {pollVoted ? (
              <div className="flex flex-col gap-3">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span>Setuju (Sangat Relevan)</span>
                    <span>{pollVotes.yes}%</span>
                  </div>
                  <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-[#D71920]" style={{ width: `${pollVotes.yes}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span>Tidak Setuju / Perlu Kajian</span>
                    <span>{pollVotes.no}%</span>
                  </div>
                  <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-red-400" style={{ width: `${pollVotes.no}%` }} />
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-gray-300 mt-2">
                  <CheckCircle2 size={12} className="text-[#D71920]" />
                  <span>Suara Anda telah direkam. Terima kasih!</span>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <button 
                  onClick={() => handleVote("yes")}
                  className="flex-1 bg-[#D71920] text-white font-bold py-2 rounded-lg text-xs hover:scale-[1.02] transition-transform cursor-pointer"
                >
                  Setuju
                </button>
                <button 
                  onClick={() => handleVote("no")}
                  className="flex-1 bg-white/15 text-white border border-white/20 font-bold py-2 rounded-lg text-xs hover:bg-white/25 cursor-pointer"
                >
                  Tidak Setuju
                </button>
              </div>
            )}
          </div>

          {/* Dynamic Sidebar Bottom Ad Slot */}
          <AdManagerSlot slug="sidebar-bottom" page={selectedCategory ? "kategori" : "homepage"} category={selectedCategory} />

          {/* Dynamic Sidebar Sticky Ad Slot */}
          <div className="lg:sticky lg:top-20">
            <AdManagerSlot slug="sidebar-sticky" page={selectedCategory ? "kategori" : "homepage"} category={selectedCategory} />
          </div>

        </div>

      </div>

      {/* Dynamic Homepage Banner Bawah */}
      {!selectedCategory && !selectedTag && !searchQuery && (
        <div className="w-full mt-6">
          <AdManagerSlot slug="homepage-banner-bawah" page="homepage" />
        </div>
      )}



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



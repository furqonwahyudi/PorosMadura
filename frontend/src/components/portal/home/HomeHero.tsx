import React, { useState, useEffect } from "react";
import { Article } from "../../../types";
import { formatDate } from "../../../lib/utils";
import AdManagerSlot from "../../shared/AdManagerSlot";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface HomeHeroProps {
  lang: "ID" | "EN";
  selectedTag: string | null;
  setSelectedTag: (tag: string | null) => void;
  searchQuery?: string;
  onSearchClear?: () => void;
  filteredArticles: Article[];
  headlineArticles: Article[];
  editorChoiceList: Article[];
  onSelectArticle: (article: Article) => void;
  onCategorySelect?: (category: string | null, subCategory?: string | null) => void;
}

export default function HomeHero({
  lang,
  selectedTag,
  setSelectedTag,
  searchQuery,
  onSearchClear,
  filteredArticles,
  headlineArticles,
  editorChoiceList,
  onSelectArticle,
  onCategorySelect
}: HomeHeroProps) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [headlineDirection, setHeadlineDirection] = useState<"left" | "right">("right");

  useEffect(() => {
    const len = headlineArticles.length;
    if (len <= 1) return;
    const interval = setInterval(() => {
      setHeadlineDirection("right");
      setActiveSlide(prev => (prev + 1) % len);
    }, 7000);
    return () => clearInterval(interval);
  }, [headlineArticles.length]);

  return (
    <>
      {/* Active Tag Filter Notice */}
      {selectedTag && (
        <div className="bg-[#1E40AF]/5 border border-[#1E40AF]/20 rounded-xl p-4 flex justify-between items-center mb-8">
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
            {lang === "ID" ? "Hapus Filter" : "Clear Filter"} ✕
          </button>
        </div>
      )}

      {selectedTag && filteredArticles.length === 0 && (
        <div className="bg-white border border-gray-100 rounded-xl p-8 text-center mb-8">
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
        <div className="bg-[#D71920]/5 border border-[#D71920]/20 rounded-xl p-4 flex justify-between items-center mb-8">
          <div className="flex items-center gap-2">
            <span className="text-[#D71920] font-bold text-sm">🔍</span>
            <span className="text-sm font-bold text-gray-800">
              {lang === "ID" ? "Hasil Pencarian" : "Search Results"}: <span className="text-[#0D2B5C] font-black">"{searchQuery}"</span>
            </span>
          </div>
          <button 
            onClick={onSearchClear}
            className="text-xs font-bold text-red-600 hover:text-red-700 cursor-pointer bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-full transition-colors"
          >
            {lang === "ID" ? "Hapus Pencarian" : "Clear Search"} ✕
          </button>
        </div>
      )}

      {searchQuery && filteredArticles.length === 0 && (
        <div className="bg-white border border-gray-100 rounded-xl p-8 text-center mb-8">
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
        <div className="relative overflow-hidden rounded-2xl bg-[#111] group shadow-lg h-[340px] sm:h-[450px]">
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
              <img 
                src={headlineArticles[activeSlide]?.image}
                alt={headlineArticles[activeSlide]?.title}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.src = "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80";
                }}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              
              {/* Bottom text info */}
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 pb-14 sm:pb-16 flex flex-col gap-2.5 z-10">
                <div className="flex items-center gap-3">
                  <span className="bg-[#D71920] text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full">
                    {headlineArticles[activeSlide]?.category}
                  </span>
                  <span className="text-[11px] text-gray-300 font-mono flex items-center gap-1">
                    <Calendar size={12} />
                    {headlineArticles[activeSlide] ? formatDate(headlineArticles[activeSlide].publishDate, lang) : ""}
                  </span>
                </div>
                <h2 
                  onClick={() => headlineArticles[activeSlide] && onSelectArticle(headlineArticles[activeSlide])}
                  className="text-lg sm:text-2xl font-bold text-white hover:text-[#D71920] transition-colors cursor-pointer line-clamp-2 font-sans tracking-tight"
                >
                  {headlineArticles[activeSlide]?.title}
                </h2>
                <p className="text-gray-300 text-xs sm:text-sm line-clamp-2 leading-relaxed opacity-90 max-w-2xl font-light">
                  {headlineArticles[activeSlide]?.content}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Dots Indicator */}
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
        </div>
      )}

      {/* Dynamic Hero Banner Ad Slot */}
      <div className="w-full my-6">
        <AdManagerSlot slug="hero-banner" page="homepage" />
      </div>

      {/* Section: Rekomendasi Untuk Anda */}
      {editorChoiceList.length > 0 && (
        <div className="mb-8">
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
    </>
  );
}

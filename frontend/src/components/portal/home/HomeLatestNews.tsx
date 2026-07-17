import React, { useState } from "react";
import { Article } from "../../../types";
import { formatDate } from "../../../lib/utils";
import AdManagerSlot from "../../shared/AdManagerSlot";
import { Clock, ChevronRight, ChevronLeft, Activity } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface HomeLatestNewsProps {
  lang: "ID" | "EN";
  selectedCategory: string | null;
  filteredArticles: Article[];
  currentPageArticles: Article[];
  recentPage: number;
  setRecentPage: React.Dispatch<React.SetStateAction<number>>;
  totalPages: number;
  ITEMS_PER_PAGE: number;
  onSelectArticle: (article: Article) => void;
  onCategorySelect?: (category: string | null, subCategory?: string | null) => void;
}

const isCategory = (art: Article, cat: string) =>
  art.category.toLowerCase() === cat.toLowerCase() ||
  (art.subCategory && art.subCategory.toLowerCase() === cat.toLowerCase());

export default function HomeLatestNews({
  lang,
  selectedCategory,
  filteredArticles,
  currentPageArticles,
  recentPage,
  setRecentPage,
  totalPages,
  ITEMS_PER_PAGE,
  onSelectArticle,
  onCategorySelect
}: HomeLatestNewsProps) {
  const [activeKesehatanSlide, setActiveKesehatanSlide] = useState(0);
  const [slideDirection, setSlideDirection] = useState<"left" | "right">("right");

  const kesehatanArticles = filteredArticles.filter(a => isCategory(a, "Kesehatan")).slice(0, 9);
  const kesehatanChunks: Article[][] = [];
  for (let i = 0; i < kesehatanArticles.length; i += 3) {
    kesehatanChunks.push(kesehatanArticles.slice(i, i + 3));
  }

  const handleNextKesehatan = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSlideDirection("right");
    setActiveKesehatanSlide(prev => (prev + 1) % kesehatanChunks.length);
  };

  const handlePrevKesehatan = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSlideDirection("left");
    setActiveKesehatanSlide(prev => (prev === 0 ? kesehatanChunks.length - 1 : prev - 1));
  };

  return (
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
          <div 
            key={art.id} 
            onClick={() => onSelectArticle(art)}
            className="flex flex-row gap-3.5 py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50/50 px-2 rounded-lg transition-colors cursor-pointer group"
          >
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
          </div>
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
                <div 
                  key={`special-politik-${art.id}`} 
                  onClick={() => onSelectArticle(art)} 
                  className={`cursor-pointer group gap-2 items-start p-1 hover:bg-white rounded-lg transition-colors ${idx >= 5 ? "hidden md:flex" : "flex"}`}
                >
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
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Remaining articles: slice 4 to 8 */}
        {currentPageArticles.length > 4 && currentPageArticles.slice(4, 8).map(art => (
          <div 
            key={art.id} 
            onClick={() => onSelectArticle(art)}
            className="flex flex-row gap-3.5 py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50/50 px-2 rounded-lg transition-colors cursor-pointer group"
          >
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
          </div>
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
            {/* Grid Carousel */}
            <div className="relative px-6 sm:px-8">
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
                      <div 
                        key={`special-kesehatan-${art.id}`} 
                        onClick={() => onSelectArticle(art)} 
                        className="cursor-pointer group flex flex-row sm:flex-col gap-3.5 sm:gap-2 p-2 hover:bg-white rounded-lg transition-all duration-300 bg-white/40 border border-transparent hover:border-gray-100 shadow-2xs"
                      >
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
                      </div>
                    ))}
                  </motion.div>
                </AnimatePresence>
              </div>

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
                      onClick={(e) => {
                        e.stopPropagation();
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
            <div 
              onClick={() => onSelectArticle(art)}
              className="flex flex-row gap-3.5 py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50/50 px-2 rounded-lg transition-colors cursor-pointer group"
            >
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
            </div>

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

              if (startPage > 1) {
                pages.push(
                  <button
                    key={1}
                    onClick={() => setRecentPage(1)}
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

              for (let p = startPage; p <= endPage; p++) {
                pages.push(
                  <button
                    key={p}
                    onClick={() => setRecentPage(p)}
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
                    onClick={() => setRecentPage(totalPages)}
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
  );
}

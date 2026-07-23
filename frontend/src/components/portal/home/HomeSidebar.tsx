import React, { useState, useEffect } from "react";
import { Article } from "../../../types";
import { formatDate } from "../../../lib/utils";
import AdManagerSlot from "../../shared/AdManagerSlot";
import { 
  BarChart2, TrendingUp, Trophy, Award, Sparkles, CheckCircle2, ChevronRight 
} from "lucide-react";
import AnimatedMarketRate from "../../shared/AnimatedMarketRate";

interface HomeSidebarProps {
  lang: "ID" | "EN";
  selectedCategory: string | null;
  marketSettings: {
    enabled: boolean;
    ihsgEnabled: boolean;
    usdEnabled: boolean;
    goldEnabled: boolean;
    kriptoEnabled: boolean;
  };
  marketRates: Record<string, any>;
  trendingList: Article[];
  opinionArticles: Article[];
  articles: Article[];
  selectedTag: string | null;
  setSelectedTag: React.Dispatch<React.SetStateAction<string | null>>;
  onSelectArticle: (article: Article) => void;
  onCategorySelect?: (category: string | null, subCategory?: string | null) => void;
}

const isCategory = (art: Article, cat: string) =>
  art.category.toLowerCase() === cat.toLowerCase() ||
  (art.subCategory && art.subCategory.toLowerCase() === cat.toLowerCase());

export default function HomeSidebar({
  lang,
  selectedCategory,
  marketSettings,
  marketRates,
  trendingList,
  opinionArticles,
  articles,
  selectedTag,
  setSelectedTag,
  onSelectArticle,
  onCategorySelect
}: HomeSidebarProps) {

  const [pollVoted, setPollVoted] = useState(false);
  const [pollVotes, setPollVotes] = useState({ yes: 78, no: 22 });

  const handleVote = (vote: "yes" | "no") => {
    if (pollVoted) return;
    setPollVotes(prev => {
      const total = prev.yes + prev.no + 1;
      const newYes = vote === "yes" ? prev.yes + 1 : prev.yes;
      const newNo = vote === "no" ? prev.no + 1 : prev.no;
      return {
        yes: Math.round((newYes / total) * 100),
        no: Math.round((newNo / total) * 100)
      };
    });
    setPollVoted(true);
  };

  return (
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
              <div 
                key={art.id} 
                className="flex gap-3 items-start cursor-pointer group"
                onClick={() => onSelectArticle(art)}
              >
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
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Kategori Olahraga Panel */}
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
              <div 
                key={`side-sport-${art.id}`} 
                onClick={() => onSelectArticle(art)}
                className="flex gap-3 items-start cursor-pointer group hover:bg-slate-50/50 p-1.5 rounded-lg transition-all duration-200"
              >
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
              </div>
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

      {/* Opini & Editorial Column */}
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
                <div 
                  key={art.id} 
                  onClick={() => onSelectArticle(art)}
                  className="cursor-pointer hover:bg-gray-50/70 p-2 rounded-lg transition-all flex items-center gap-4"
                >
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
                </div>
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

      {/* Lifestyle Panel */}
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
              <div 
                onClick={() => onSelectArticle(firstArt)}
                className="relative w-full h-48 rounded-lg overflow-hidden cursor-pointer group shadow-xs border border-gray-100"
              >
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
              </div>

              <div className="flex flex-col gap-4 mt-1">
                {remainingArts.map((art, idx) => (
                  <div 
                    key={`side-lifestyle-${art.id}`}
                    onClick={() => onSelectArticle(art)}
                    className="cursor-pointer group flex flex-col gap-1 border-b border-gray-100 pb-3 last:border-0 last:pb-0"
                  >
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#D71920]">
                      {art.subCategory || art.category || "Lifestyle"}
                    </span>
                    <h5 className="text-xs sm:text-sm font-bold text-gray-900 leading-snug line-clamp-2 group-hover:text-[#1E40AF] transition-colors">
                      {art.title}
                    </h5>
                    <span className="text-[10px] text-gray-400 font-mono mt-1">
                      {getRelativeTime(idx + 1)}
                    </span>
                  </div>
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
  );
}


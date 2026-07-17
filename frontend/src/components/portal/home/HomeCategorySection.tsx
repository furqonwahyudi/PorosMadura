import React from "react";
import { Article } from "../../../types";
import { formatDate } from "../../../lib/utils";
import { ChevronRight } from "lucide-react";

interface HomeCategorySectionProps {
  lang: "ID" | "EN";
  otomotifArticles: Article[];
  hiburanArticles: Article[];
  techArticles: Article[];
  onSelectArticle: (article: Article) => void;
  onCategorySelect?: (category: string | null, subCategory?: string | null) => void;
}

export default function HomeCategorySection({
  lang,
  otomotifArticles,
  hiburanArticles,
  techArticles,
  onSelectArticle,
  onCategorySelect
}: HomeCategorySectionProps) {
  return (
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
            <div key={art.id} onClick={() => onSelectArticle(art)} className="cursor-pointer group flex gap-3">
              <img 
                src={art.image} 
                alt={art.title}
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
            </div>
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
            <div key={art.id} onClick={() => onSelectArticle(art)} className="cursor-pointer group flex gap-3">
              <img 
                src={art.image} 
                alt={art.title}
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
            </div>
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
            <div key={art.id} onClick={() => onSelectArticle(art)} className="cursor-pointer group flex gap-3">
              <img 
                src={art.image} 
                alt={art.title}
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
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

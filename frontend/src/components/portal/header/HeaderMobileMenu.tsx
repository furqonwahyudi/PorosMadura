import React, { useState } from "react";
import { Search, ChevronDown, X } from "lucide-react";
import { motion } from "motion/react";

interface HeaderMobileMenuProps {
  lang: "ID" | "EN";
  currentTime: string;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handleSearchSubmit: (e: React.FormEvent) => void;
  menuItems: any[];
  selectedCategory: string | null;
  selectedSubCategory?: string | null;
  onCategorySelect: (category: string | null, subCategory?: string | null) => void;
  setMobileMenuOpen: (isOpen: boolean) => void;
}

export default function HeaderMobileMenu({
  lang,
  currentTime,
  searchQuery,
  setSearchQuery,
  handleSearchSubmit,
  menuItems,
  selectedCategory,
  selectedSubCategory,
  onCategorySelect,
  setMobileMenuOpen
}: HeaderMobileMenuProps) {
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({});

  const isItemActive = (item: any) => {
    if (item.category && item.category === selectedCategory) return true;
    if (item.subItems) {
      return item.subItems.some(
        (sub: any) => sub.category === selectedCategory && sub.subCategory === selectedSubCategory
      );
    }
    return false;
  };

  return (
    <div className="md:hidden border-t border-gray-100 bg-white p-4 shadow-lg absolute left-0 right-0 z-50 max-h-[80vh] overflow-y-auto">
      {/* Mobile Search */}
      <form onSubmit={handleSearchSubmit} className="relative mb-4">
        <input
          type="text"
          placeholder={lang === "ID" ? "Cari berita..." : "Search news..."}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-10 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D2B5C]/20"
        />
        <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-2.5 text-gray-400 hover:text-[#0D2B5C] rounded-full p-0.5 cursor-pointer"
          >
            <X size={16} />
          </button>
        )}
      </form>

      {/* Quick Info */}
      <div className="text-[11px] text-gray-400 font-mono mb-4 flex items-center gap-1">
        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping"></div>
        <span>LIVE: {currentTime}</span>
      </div>

      {/* Mobile Categories (Collapsible / Grouped List) */}
      <div className="mt-4 border-t border-gray-100 pt-4">
        <h3 className="text-xs font-bold text-[#0D2B5C] uppercase tracking-wider mb-3 px-2">
          KATEGORI MENU
        </h3>
        <div className="flex flex-col gap-2">
          {menuItems.map((item, idx) => {
            const displayName = lang === "ID" ? item.name.ID : item.name.EN;
            const active = isItemActive(item);

            if (item.subItems) {
              const menuKey = item.name.ID;
              const isExpanded = openSubmenus[menuKey] ?? active;
              return (
                <div key={idx} className="flex flex-col bg-gray-50/60 p-2 rounded-xl">
                  <button
                    onClick={() => {
                      setOpenSubmenus((prev) => ({
                        ...prev,
                        [menuKey]: !isExpanded,
                      }));
                      if (item.category) {
                        onCategorySelect(item.category);
                      }
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-extrabold uppercase tracking-wide text-[#0D2B5C] hover:text-[#D71920] transition-colors cursor-pointer text-left`}
                  >
                    <span className={active ? "text-[#D71920]" : ""}>{displayName}</span>
                    <ChevronDown
                      size={16}
                      className={`text-gray-400 transition-transform duration-200 ${
                        isExpanded ? "rotate-180 text-[#D71920]" : ""
                      }`}
                    />
                  </button>

                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="pl-3.5 flex flex-col gap-1 mt-1.5 border-l-2 border-[#0D2B5C]/10 ml-2.5 overflow-hidden"
                    >
                      {item.subItems.map((sub: any, sIdx: number) => {
                        const subActive =
                          selectedCategory === sub.category &&
                          selectedSubCategory === sub.subCategory;
                        return (
                          <button
                            key={sIdx}
                            onClick={() => {
                              onCategorySelect(sub.category, sub.subCategory);
                              setMobileMenuOpen(false);
                            }}
                            className={`text-left px-2.5 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 cursor-pointer ${
                              subActive
                                ? "bg-[#0D2B5C] text-white font-bold shadow-xs"
                                : "text-gray-600 hover:bg-white hover:text-[#0D2B5C]"
                            }`}
                          >
                            {sub.name}
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </div>
              );
            }

            return (
              <button
                key={idx}
                onClick={() => {
                  onCategorySelect(item.category);
                  setMobileMenuOpen(false);
                }}
                className={`text-left px-3 py-2 text-xs font-extrabold uppercase tracking-wide rounded-lg transition-all duration-200 cursor-pointer ${
                  active
                    ? "bg-[#0D2B5C] text-white shadow-xs"
                    : "text-gray-600 hover:bg-gray-50 hover:text-[#0D2B5C]"
                }`}
              >
                {displayName}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

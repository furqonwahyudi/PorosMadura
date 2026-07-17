import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion } from "motion/react";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

interface HeaderNavigationProps {
  isSticky: boolean;
  lang: "ID" | "EN";
  menuItems: any[];
  mobileFlatCategories: any[];
  selectedCategory: string | null;
  selectedSubCategory?: string | null;
  onCategorySelect: (category: string | null, subCategory?: string | null) => void;
}

export default function HeaderNavigation({
  isSticky,
  lang,
  menuItems,
  mobileFlatCategories,
  selectedCategory,
  selectedSubCategory,
  onCategorySelect,
}: HeaderNavigationProps) {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const handleBlur = (e: React.FocusEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setActiveDropdown(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, menuKey: string) => {
    if (e.key === "Escape") {
      setActiveDropdown(null);
      (document.activeElement as HTMLElement)?.blur();
    }
  };

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
    <motion.nav
      animate={{
        y: isSticky ? [-15, 0] : 0,
        boxShadow: isSticky
          ? "0 10px 25px -5px rgba(13, 43, 92, 0.1), 0 8px 10px -6px rgba(13, 43, 92, 0.1)"
          : "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
      }}
      transition={{
        y: { duration: 0.3, ease: "easeOut" },
        boxShadow: { duration: 0.2 },
      }}
      className={`hidden md:block border-b border-gray-100 sticky top-0 z-45 transition-all duration-300 ${
        isSticky
          ? "bg-white/90 backdrop-blur-xl py-1.5 border-[#0D2B5C]/15"
          : "border-t bg-white/95 backdrop-blur-md py-0"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Desktop Dropdown-based menu */}
        <div className="hidden md:flex items-center justify-between py-2 flex-wrap gap-y-1.5">
          <div className="flex items-center gap-1 flex-wrap">
            {isSticky && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, x: -10 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.8, x: -10 }}
                transition={{ duration: 0.2 }}
                className="flex items-center pr-3 mr-2 border-r border-gray-100 shrink-0"
              >
                <img
                  src="/ICON.png"
                  alt="Logo Icon"
                  className="h-10 w-10 shrink-0 rounded-full object-contain cursor-pointer transition-transform hover:scale-110 duration-200 shadow-sm border border-gray-100"
                  onClick={() => onCategorySelect(null)}
                />
              </motion.div>
            )}
            <nav aria-label="Navigasi Utama">
              <ul className="flex items-center gap-1 flex-wrap">
                {menuItems.map((item, idx) => {
                  const active = isItemActive(item);
                  const displayName = lang === "ID" ? item.name.ID : item.name.EN;
                  const menuKey = item.name.ID;
                  const href = item.category ? `/${slugify(item.category)}` : "/";

                  if (item.subItems) {
                    const isDropdownOpen = activeDropdown === menuKey;
                    return (
                      <li
                        key={idx}
                        className="relative shrink-0"
                        onMouseEnter={() => setActiveDropdown(menuKey)}
                        onMouseLeave={() => setActiveDropdown(null)}
                        onBlur={handleBlur}
                      >
                        <a
                          href={href}
                          onClick={(e) => {
                            e.preventDefault();
                            if (item.category) {
                              onCategorySelect(item.category);
                            } else {
                              setActiveDropdown(isDropdownOpen ? null : menuKey);
                            }
                          }}
                          onFocus={() => setActiveDropdown(menuKey)}
                          onKeyDown={(e) => handleKeyDown(e, menuKey)}
                          aria-expanded={isDropdownOpen ? "true" : "false"}
                          aria-haspopup="true"
                          aria-controls={`dropdown-${idx}`}
                          className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center gap-1 ${
                            active
                              ? "bg-[#0D2B5C] text-white shadow-sm"
                              : "text-gray-600 hover:bg-gray-100 hover:text-[#0D2B5C]"
                          }`}
                        >
                          <span>{displayName}</span>
                          <ChevronDown
                            size={12}
                            className={`transition-transform duration-200 shrink-0 ${
                              isDropdownOpen ? "rotate-180" : ""
                            } ${active ? "text-white" : "text-gray-400"}`}
                          />
                        </a>
                        {/* Dropdown Menu */}
                        <div
                          id={`dropdown-${idx}`}
                          role="menu"
                          className={`absolute left-0 top-full w-48 pt-1 z-50 transform transition-all duration-150 ease-out ${
                            isDropdownOpen
                              ? "opacity-100 translate-y-0 visible pointer-events-auto"
                              : "opacity-0 -translate-y-[6px] invisible pointer-events-none"
                          }`}
                        >
                          <div className="bg-white border border-gray-100 rounded-xl shadow-xl py-1 divide-y divide-gray-50/50">
                            {item.subItems.map((sub: any, sIdx: number) => {
                              const subActive = selectedCategory === sub.category;
                              const subHref = `/${slugify(sub.category)}`;
                              return (
                                <a
                                  key={sIdx}
                                  role="menuitem"
                                  href={subHref}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    onCategorySelect(sub.category);
                                  }}
                                  onFocus={() => setActiveDropdown(menuKey)}
                                  onKeyDown={(e) => handleKeyDown(e, menuKey)}
                                  className={`w-full text-left px-4 py-2 text-xs font-semibold transition-colors cursor-pointer block ${
                                    subActive
                                      ? "bg-[#0D2B5C]/10 text-[#0D2B5C] font-bold"
                                      : "text-gray-600 hover:bg-gray-50 hover:text-[#0D2B5C]"
                                  }`}
                                >
                                  {sub.name}
                                </a>
                              );
                            })}
                          </div>
                        </div>
                      </li>
                    );
                  }

                  return (
                    <li key={idx} className="shrink-0">
                      <a
                        href={href}
                        onClick={(e) => {
                          e.preventDefault();
                          onCategorySelect(item.category);
                        }}
                        onFocus={() => setActiveDropdown(null)}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 shrink-0 cursor-pointer block ${
                          active
                            ? "bg-[#0D2B5C] text-white shadow-sm"
                            : "text-gray-600 hover:bg-gray-100 hover:text-[#0D2B5C]"
                        }`}
                      >
                        {displayName}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>
        </div>

        {/* Mobile Horizontal scrollbar of flat categories */}
        <div className="flex md:hidden gap-1 overflow-x-auto no-scrollbar py-2 -mx-4 px-4 w-full items-center">
          {isSticky && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="pr-2.5 mr-1.5 border-r border-gray-100 shrink-0 flex items-center"
            >
              <img
                src="/ICON.png"
                alt="Logo Icon"
                className="h-8 w-8 shrink-0 rounded-full object-contain cursor-pointer shadow-xs border border-gray-100"
                onClick={() => onCategorySelect(null)}
              />
            </motion.div>
          )}
          {mobileFlatCategories.map((item, idx) => {
            const active =
              selectedCategory === item.category && selectedSubCategory === item.subCategory;
            const displayName = lang === "ID" ? item.name.ID : item.name.EN;
            return (
              <button
                key={idx}
                id={`cat-mobile-${idx}`}
                onClick={() => onCategorySelect(item.category, item.subCategory)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 shrink-0 cursor-pointer ${
                  active
                    ? "bg-[#0D2B5C] text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-100 hover:text-[#0D2B5C]"
                }`}
              >
                {displayName}
              </button>
            );
          })}
        </div>
      </div>
    </motion.nav>
  );
}

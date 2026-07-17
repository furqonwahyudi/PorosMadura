import React, { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import PortalHeader from "../components/PortalHeader";
import PortalFooter from "../components/PortalFooter";
import FloatingAdLayout from "../components/shared/FloatingAdLayout";
import AdManagerSlot from "../components/shared/AdManagerSlot";
import { Article } from "../types";
import { slugify, getArticleUrl } from "../lib/utils";

export default function PortalLayout() {
  const [lang, setLang] = useState<"ID" | "EN">("ID");
  const navigate = useNavigate();
  const location = useLocation();

  // Determine current page context based on URL
  const path = location.pathname;
  let currentPage = "homepage";
  let selectedCategory: string | null = null;
  let selectedSubCategory: string | null = null;

  const segments = path.split("/").filter(Boolean);
  if (segments.length > 0) {
    if (segments[0] === "search") {
      currentPage = "search";
    } else {
      currentPage = segments.length > 1 ? "artikel" : "kategori"; // Simplified heuristic
      selectedCategory = segments[0]; // Simplified
      if (segments.length > 1) {
        selectedSubCategory = segments[1];
      }
    }
  }

  const handleCategorySelect = (category: string | null) => {
    if (!category) {
      navigate("/");
    } else if (category === "rekomendasi") {
      navigate("/rekomendasi");
    } else {
      navigate(`/${slugify(category)}`);
    }
  };

  const handleSearch = (query: string) => {
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    } else {
      navigate("/");
    }
  };

  const handleSelectArticle = (article: Article) => {
    navigate(getArticleUrl(article));
  };

  return (
    <div id="portal-root" className="flex flex-col min-h-screen">
      {/* Global Top Billboard (above everything, full-width) - Sticky behind content */}
      <div className="sticky top-0 z-0">
        <AdManagerSlot slug="top-billboard" page={currentPage} category={selectedCategory} />
      </div>

      {/* Popup / Interstitial overlay */}
      <AdManagerSlot slug="popup-interstitial" page={currentPage} category={selectedCategory} />

      {/* Mobile sticky bottom anchor */}
      <AdManagerSlot slug="mobile-anchor-banner" page={currentPage} category={selectedCategory} />

      <div className="flex-grow relative z-10">
        <FloatingAdLayout page={currentPage} category={selectedCategory}>
          <div className="flex flex-col min-h-screen bg-[#FAFAFB]">
            {/* Navigation Header */}
            <PortalHeader
              onCategorySelect={handleCategorySelect}
              selectedCategory={selectedCategory}
              selectedSubCategory={selectedSubCategory}
              onSearch={handleSearch}
              onSelectArticle={handleSelectArticle}
              lang={lang}
              setLang={setLang}
              currentPage={currentPage}
            />

            {/* Main Content Area */}
            <div className="flex-grow bg-[#FAFAFB]">
              <Outlet context={{ lang, onSelectArticle: handleSelectArticle, onCategorySelect: handleCategorySelect }} />
            </div>

            {/* Footer */}
            <PortalFooter lang={lang} />
          </div>
        </FloatingAdLayout>
      </div>
    </div>
  );
}

import React from "react";
import { useOutletContext } from "react-router-dom";
import PortalHome from "../../components/PortalHome";

interface PortalContext {
  lang: "ID" | "EN";
  onSelectArticle: (article: any) => void;
  onCategorySelect: (category: string | null, subCategory?: string | null) => void;
}

export default function HomePage() {
  const { lang, onSelectArticle, onCategorySelect } = useOutletContext<PortalContext>();

  return (
    <PortalHome
      lang={lang}
      onSelectArticle={onSelectArticle}
      onCategorySelect={onCategorySelect}
      selectedCategory={null}
    />
  );
}

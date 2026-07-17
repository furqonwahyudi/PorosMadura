import React from "react";
import { useSearchParams, useOutletContext } from "react-router-dom";
import PortalHome from "../../components/PortalHome";

interface PortalContext {
  lang: "ID" | "EN";
  onSelectArticle: (article: any) => void;
  onCategorySelect: (category: string | null, subCategory?: string | null) => void;
}

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const { lang, onSelectArticle, onCategorySelect } = useOutletContext<PortalContext>();

  const handleSearchClear = () => {
    setSearchParams({});
  };

  return (
    <PortalHome
      lang={lang}
      onSelectArticle={onSelectArticle}
      onCategorySelect={onCategorySelect}
      selectedCategory={null}
      searchQuery={query}
      onSearchClear={handleSearchClear}
    />
  );
}

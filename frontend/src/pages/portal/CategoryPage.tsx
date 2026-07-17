import React from "react";
import { useParams, useOutletContext, useLocation, Navigate } from "react-router-dom";
import PortalHome from "../../components/PortalHome";

interface PortalContext {
  lang: "ID" | "EN";
  onSelectArticle: (article: any) => void;
  onCategorySelect: (category: string | null, subCategory?: string | null) => void;
}

// Simple reverse slugify for dummy data matching (not perfect but works for prototype)
function unslugify(slug: string): string {
  if (!slug) return "";
  const parts = slug.split("-");
  return parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");
}

export default function CategoryPage() {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const { lang, onSelectArticle, onCategorySelect } = useOutletContext<PortalContext>();

  // Redirect wrapper categories to their first subcategory
  if (categorySlug === "daerah") {
    return <Navigate to="/bangkalan" replace />;
  }
  if (categorySlug === "nasional") {
    return <Navigate to="/politik" replace />;
  }
  if (categorySlug === "lainnya") {
    return <Navigate to="/lifestyle" replace />;
  }

  // In a real app, you'd fetch data based on the slug. 
  // Here we just pass the unslugified name back to PortalHome.
  const category = unslugify(categorySlug || "");

  return (
    <PortalHome
      lang={lang}
      onSelectArticle={onSelectArticle}
      onCategorySelect={onCategorySelect}
      selectedCategory={category}
      selectedSubCategory={null}
    />
  );
}

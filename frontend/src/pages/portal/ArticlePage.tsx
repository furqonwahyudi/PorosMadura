import React, { useEffect, useState } from "react";
import { useParams, useOutletContext, useNavigate } from "react-router-dom";
import ArticleView from "../../components/ArticleView";
import { api } from "../../lib/api";

interface PortalContext {
  lang: "ID" | "EN";
  onSelectArticle: (article: any) => void;
}

export default function ArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const { lang, onSelectArticle } = useOutletContext<PortalContext>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<any>(null);

  useEffect(() => {
    if (!slug) return;
    
    let active = true;
    const fetchArticle = async () => {
      try {
        const data = await api.getArticleBySlug(slug);
        if (active) {
          setArticle(data);
          // Increment views in background
          api.incrementView(slug);
        }
      } catch (err) {
        console.error("Gagal memuat artikel:", err);
        if (active) {
          navigate("/");
        }
      }
    };

    fetchArticle();

    return () => {
      active = false;
    };
  }, [slug, navigate]);

  if (!article) return null;

  return (
    <ArticleView
      article={article}
      onBack={() => navigate(-1)}
      lang={lang}
      onSelectArticle={onSelectArticle}
    />
  );
}

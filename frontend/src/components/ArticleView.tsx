import { Link } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { Article, Comment } from "../types";
import { api } from "../lib/api";
import AdManagerSlot from "./shared/AdManagerSlot";
import { getArticleUrl, formatDate, slugify } from "../lib/utils";
import { 
  Calendar, Clock, User, Share2, Eye, Award, Sparkles, Send, 
  ThumbsUp, MessageSquare, ArrowLeft, Check, Copy, Bookmark, BookmarkCheck 
} from "lucide-react";

interface ArticleViewProps {
  article: Article;
  onBack: () => void;
  lang: "ID" | "EN";
  onSelectArticle: (article: Article) => void;
}

export default function ArticleView({ article, onBack, lang, onSelectArticle }: ArticleViewProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newCommentAuthor, setNewCommentAuthor] = useState("");
  const [newCommentContent, setNewCommentContent] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyAuthor, setReplyAuthor] = useState("");
  const [replyContent, setReplyContent] = useState("");
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [copied, setCopied] = useState(false);

  // Load comments & related news
  useEffect(() => {
    let active = true;
    
    const loadData = async () => {
      try {
        // Fetch related articles
        const catSlug = slugify(article.category);
        const resArticles = await api.getArticles({ category: catSlug, limit: 10 });
        const related = resArticles.articles
          .filter((a: Article) => a.id !== article.id)
          .slice(0, 3);
        
        // Fetch comments
        const commentsData = await api.getComments(article.slug);
        const formattedComments = commentsData.map((c: any) => ({
          id: c.id,
          author: c.author,
          content: c.content,
          timestamp: c.createdAt,
          likes: c.likes || 0,
          dislikes: c.dislikes || 0,
          replies: c.replies?.map((r: any) => ({
            id: r.id,
            author: r.author,
            content: r.content,
            timestamp: r.createdAt,
            likes: r.likes || 0,
            dislikes: r.dislikes || 0,
          })) || [],
        }));

        if (active) {
          setRelatedArticles(related);
          setComments(formattedComments);
        }
      } catch (err) {
        console.error("Gagal memuat komentar/berita terkait:", err);
      }
    };

    loadData();
    window.scrollTo(0, 0);

    return () => {
      active = false;
    };
  }, [article]);

  const handleShareClick = (platform: string) => {
    const shareUrl = window.location.href;
    const shareText = `Baca berita menarik ini di Poros Madura: "${article.title}" - ${shareUrl}`;

    if (platform === "wa") {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, "_blank");
    } else if (platform === "fb") {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, "_blank");
    } else if (platform === "tg") {
      window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(article.title)}`, "_blank");
    } else if (platform === "x") {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, "_blank");
    } else if (platform === "copy") {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentAuthor.trim() || !newCommentContent.trim()) return;

    try {
      await api.postComment(article.slug, {
        author: newCommentAuthor.trim(),
        content: newCommentContent.trim(),
      });
      
      alert(lang === "ID" 
        ? "Komentar Anda berhasil dikirim dan akan muncul setelah disetujui moderator." 
        : "Your comment has been submitted and will appear after moderator approval."
      );
      
      setNewCommentAuthor("");
      setNewCommentContent("");
    } catch (err) {
      console.error("Gagal mengirim komentar:", err);
      alert(lang === "ID" ? "Gagal mengirim komentar. Silakan coba lagi." : "Failed to post comment. Please try again.");
    }
  };

  const handlePostReply = async (e: React.FormEvent, parentId: string) => {
    e.preventDefault();
    if (!replyAuthor.trim() || !replyContent.trim()) return;

    try {
      await api.postComment(article.slug, {
        author: replyAuthor.trim(),
        content: replyContent.trim(),
        parentId,
      });

      alert(lang === "ID" 
        ? "Balasan Anda berhasil dikirim dan akan muncul setelah disetujui moderator." 
        : "Your reply has been submitted and will appear after moderator approval."
      );

      setReplyAuthor("");
      setReplyContent("");
      setReplyingTo(null);
    } catch (err) {
      console.error("Gagal mengirim balasan:", err);
      alert(lang === "ID" ? "Gagal mengirim balasan. Silakan coba lagi." : "Failed to post reply. Please try again.");
    }
  };

  const handleLikeComment = async (commentId: string) => {
    setComments(comments.map(c => {
      if (c.id === commentId) {
        return { ...c, likes: c.likes + 1 };
      }
      return c;
    }));
  };

  // Estimate reading time based on Indonesian reading speed (~200 WPM)
  const getReadingTime = () => {
    const words = article.content.split(/\s+/).length;
    const minutes = Math.ceil(words / 200);
    return minutes;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      


      {/* Breadcrumb & Go Back */}
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-bold text-[#0D2B5C] hover:text-[#1E40AF] transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>{lang === "ID" ? "KEMBALI KE BERANDA" : "BACK TO PORTAL"}</span>
        </button>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsBookmarked(!isBookmarked)}
            className="p-1.5 rounded-full border border-gray-200 text-gray-500 hover:text-[#0D2B5C] transition-colors cursor-pointer"
          >
            {isBookmarked ? <BookmarkCheck size={16} className="text-[#D71920]" /> : <Bookmark size={16} />}
          </button>
        </div>
      </div>

      {/* Main Core View Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Article Editorial Column */}
        <div className="lg:col-span-8 bg-white border border-gray-100 rounded-2xl p-6 sm:p-8 shadow-xs">
          
          {/* Headline Meta Info */}
          <div className="flex flex-wrap items-center gap-3.5 mb-4">
            <span className="bg-[#0D2B5C] text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-sm">
              {article.subCategory || article.category}
            </span>
            <span className="text-[11px] text-gray-400 font-mono flex items-center gap-1">
              <Calendar size={12} />
              {formatDate(article.publishDate, lang)}
            </span>
            <span className="text-[11px] text-gray-400 font-mono flex items-center gap-1">
              <Clock size={12} />
              {getReadingTime()} Menit Baca
            </span>
          </div>

          {/* Title and Excerpts */}
          <h1 className="text-xl sm:text-3xl font-bold text-gray-900 tracking-tight leading-snug mb-5">
            {article.title}
          </h1>

          {/* Editorial Attributions */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-b border-gray-100 py-3.5 mb-6 text-xs text-gray-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <User size={14} className="text-gray-400" />
                <span>Reporter: <strong className="text-gray-700">{article.reporter || "Andini Putri"}</strong></span>
              </span>
              <span className="text-gray-200">|</span>
              <span>Editor: <strong className="text-gray-700">{article.editor || "Giri Wijaya"}</strong></span>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-gray-400 text-[11px]">
              <Eye size={14} />
              <span>{article.views || 0} Kali Dilihat</span>
            </div>
          </div>

          {/* Large cover image */}
          <div className="rounded-xl overflow-hidden mb-6 aspect-video">
            <img 
              src={article.image} 
              alt={article.title} 
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.src = "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80";
              }}
              className="w-full h-full object-cover" 
            />
          </div>

          {/* Custom Gemini AI Summary Box (Special Requirement) */}
          {article.metaDescription && (
            <div className="mb-6 p-5 rounded-xl bg-gradient-to-r from-[#0D2B5C]/5 via-purple-500/5 to-white border-l-4 border-[#0D2B5C] relative overflow-hidden">
              <div className="absolute top-2 right-2 text-[#0D2B5C] opacity-10">
                <Sparkles size={42} />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={14} className="text-[#0D2B5C]" />
                <span className="text-xs font-black tracking-wider text-[#0D2B5C] uppercase">Ringkasan Eksekutif AI Gemini</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-700 leading-relaxed italic">
                "{article.metaDescription}"
              </p>
            </div>
          )}

          {/* Body content */}
          <article className="prose max-w-none text-gray-800 text-sm sm:text-base leading-relaxed space-y-4 mb-8">
            {article.content.includes("<p>") || article.content.includes("</div>") || article.content.includes("<br>") ? (
              // Jika konten mengandung HTML, lakukan splitting berdasarkan penutup tag paragraf/div agar layout tetap rapi
              article.content.split(/<\/p>|<\/div>/).map(p => p.trim()).filter(Boolean).map((p, idx) => {
                // Rekonstruksi tag penutup yang sesuai secara aman
                let paragraphHtml = p;
                if (p.startsWith("<p")) {
                  paragraphHtml = p + "</p>";
                } else if (p.startsWith("<div")) {
                  paragraphHtml = p + "</div>";
                }
                return (
                  <React.Fragment key={idx}>
                    <div dangerouslySetInnerHTML={{ __html: paragraphHtml }} className="mb-4" />
                    {idx === 2 && (
                      <AdManagerSlot slug="in-article-1" page="artikel" category={article.category} />
                    )}
                    {idx === 5 && (
                      <AdManagerSlot slug="in-article-2" page="artikel" category={article.category} />
                    )}
                    {idx === 9 && (
                      <AdManagerSlot slug="in-article-3" page="artikel" category={article.category} />
                    )}
                    {idx === 14 && (
                      <AdManagerSlot slug="in-article-4" page="artikel" category={article.category} />
                    )}
                  </React.Fragment>
                );
              })
            ) : (
              // Fallback untuk plain text
              article.content.split("\n").filter(p => p.trim() !== "").map((paragraph, idx) => (
                <React.Fragment key={idx}>
                  <p className="mb-4 whitespace-pre-wrap">{paragraph}</p>
                  {idx === 2 && (
                    <AdManagerSlot slug="in-article-1" page="artikel" category={article.category} />
                  )}
                  {idx === 5 && (
                    <AdManagerSlot slug="in-article-2" page="artikel" category={article.category} />
                  )}
                  {idx === 9 && (
                    <AdManagerSlot slug="in-article-3" page="artikel" category={article.category} />
                  )}
                  {idx === 14 && (
                    <AdManagerSlot slug="in-article-4" page="artikel" category={article.category} />
                  )}
                </React.Fragment>
              ))
            )}
          </article>



          {/* Tags cloud */}
          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8 pb-6 border-b border-gray-100">
              <span className="text-xs font-bold text-gray-400 self-center uppercase mr-1">TAGS:</span>
              {article.tags.map(t => (
                <span key={t} className="bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full cursor-pointer transition-colors">
                  #{t}
                </span>
              ))}
            </div>
          )}

          {/* Social Share Engine */}
          <div className="flex flex-wrap items-center gap-3 bg-gray-50 p-4 rounded-xl mb-12">
            <span className="text-xs font-bold text-gray-500 mr-2 flex items-center gap-1">
              <Share2 size={14} />
              <span>BAGIKAN ASPIRASI:</span>
            </span>
            <button 
              onClick={() => handleShareClick("wa")}
              className="bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
            >
              WhatsApp
            </button>
            <button 
              onClick={() => handleShareClick("fb")}
              className="bg-[#1877F2] hover:bg-[#1565cd] text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
            >
              Facebook
            </button>
            <button 
              onClick={() => handleShareClick("tg")}
              className="bg-[#0088cc] hover:bg-[#0074ad] text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
            >
              Telegram
            </button>
            <button 
              onClick={() => handleShareClick("x")}
              className="bg-[#111] hover:bg-black text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
            >
              Twitter/X
            </button>
            <button 
              onClick={() => handleShareClick("copy")}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
            >
              {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
              <span>{copied ? "Copied" : "Copy Link"}</span>
            </button>
          </div>

          {/* COMMENT SECTION (Comment + Nested Reply Support) */}
          <div className="border-t border-gray-100 pt-8">
            <div className="flex items-center gap-2 mb-6">
              <MessageSquare className="text-[#0D2B5C]" size={18} />
              <h3 className="text-sm font-black tracking-wider uppercase text-gray-800">
                Komentar Publik ({comments.length})
              </h3>
            </div>

            {/* Write Comment Form */}
            <form onSubmit={handlePostComment} className="bg-gray-50 p-5 rounded-xl mb-8 border border-gray-100">
              <h4 className="text-xs font-bold text-gray-700 uppercase mb-3">Tinggalkan Komentar</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <input 
                  type="text" 
                  required
                  placeholder="Nama Lengkap Anda"
                  value={newCommentAuthor}
                  onChange={(e) => setNewCommentAuthor(e.target.value)}
                  className="px-3.5 py-2 border rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#0D2B5C] w-full"
                />
              </div>
              <textarea 
                required
                rows={3}
                placeholder="Tulis aspirasi atau opini Anda mengenai berita ini secara bijak..."
                value={newCommentContent}
                onChange={(e) => setNewCommentContent(e.target.value)}
                className="px-3.5 py-2.5 border rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#0D2B5C] w-full mb-3"
              />
              <button 
                type="submit"
                className="bg-[#0D2B5C] hover:bg-[#1E40AF] text-white font-bold text-xs px-4 py-2 rounded-lg cursor-pointer flex items-center gap-1 transition-colors"
              >
                <span>Kirim Komentar</span>
                <Send size={12} />
              </button>
            </form>

            {/* Comments Stream */}
            <div className="flex flex-col gap-6">
              {comments.length === 0 ? (
                <div className="text-center py-6 text-xs text-gray-400 italic">
                  Belum ada komentar. Jadilah yang pertama memberikan aspirasi!
                </div>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="border-b border-gray-50 pb-5 last:border-0">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-gray-800">{comment.author}</span>
                      <span className="text-[10px] text-gray-400 font-mono">{formatDate(comment.timestamp, lang)}</span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed mb-3">
                      {comment.content}
                    </p>
                    
                    {/* Comment Controls */}
                    <div className="flex items-center gap-4 text-[10px] font-mono text-gray-400">
                      <button 
                        onClick={() => handleLikeComment(comment.id)}
                        className="hover:text-green-600 transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <ThumbsUp size={11} />
                        <span>Suka ({comment.likes || 0})</span>
                      </button>
                      <button 
                        onClick={() => setReplyingTo(comment.id)}
                        className="hover:text-[#0D2B5C] transition-colors cursor-pointer"
                      >
                        Balas
                      </button>
                    </div>

                    {/* Replies list */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="ml-6 mt-4 pl-4 border-l-2 border-gray-100 flex flex-col gap-4">
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="bg-gray-50/55 p-3 rounded-lg">
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-xs font-bold text-gray-700">{reply.author}</span>
                              <span className="text-[9px] text-gray-400 font-mono">{formatDate(reply.timestamp, lang)}</span>
                            </div>
                            <p className="text-xs text-gray-600 leading-relaxed">
                              {reply.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Inline Reply Form */}
                    {replyingTo === comment.id && (
                      <form onSubmit={(e) => handlePostReply(e, comment.id)} className="ml-6 mt-4 p-4 border rounded-lg bg-gray-50/40">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-[10px] font-bold text-[#0D2B5C]">BALAS KOMENTAR {comment.author.toUpperCase()}</span>
                          <button onClick={() => setReplyingTo(null)} className="text-[10px] text-red-500 hover:underline">Cancel</button>
                        </div>
                        <input 
                          type="text" 
                          required
                          placeholder="Nama Anda"
                          value={replyAuthor}
                          onChange={(e) => setReplyAuthor(e.target.value)}
                          className="px-3 py-1.5 border rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#0D2B5C] w-full mb-2"
                        />
                        <textarea 
                          required
                          rows={2}
                          placeholder="Tulis jawaban balasan..."
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          className="px-3 py-2 border rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#0D2B5C] w-full mb-2"
                        />
                        <button 
                          type="submit"
                          className="bg-[#1E40AF] text-white font-bold text-[10px] px-3 py-1.5 rounded-lg cursor-pointer transition-colors"
                        >
                          Submit Balasan
                        </button>
                      </form>
                    )}

                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Right Side: Related Articles, Sticky Sidebar, Ads */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          
          {/* Sidebar Top Ad Slot */}
          <AdManagerSlot slug="sidebar-top" page="artikel" category={article.category} />

          {/* Dynamic Video Banner Ad Slot */}
          <AdManagerSlot slug="video-banner" page="artikel" category={article.category} />

          {/* Dynamic Related News Banner Ad Slot */}
          <AdManagerSlot slug="related-news-banner" page="artikel" category={article.category} />

          {/* Related Articles list */}
          {relatedArticles.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-xs">
              <div className="flex items-center gap-1.5 pb-2 border-b mb-4">
                <Award size={15} className="text-[#0D2B5C]" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#0D2B5C]">
                  Berita Terkait
                </h4>
              </div>
              <div className="flex flex-col gap-4">
                {relatedArticles.map(art => (
                  <Link key={art.id} to={getArticleUrl(art)} className="flex gap-3 cursor-pointer group">
                    <img 
                      src={art.image} 
                      alt="" 
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.src = "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80";
                      }}
                      className="w-16 h-16 object-cover rounded-lg shrink-0" 
                    />
                    <div>
                      <h5 className="text-xs font-bold text-gray-800 line-clamp-2 leading-tight group-hover:text-[#1E40AF] transition-colors">
                        {art.title}
                      </h5>
                      <span className="text-[9px] text-[#1E40AF] font-bold uppercase tracking-wider block mt-1">{art.subCategory || art.category}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}



          {/* Sidebar Middle Ad Slot */}
          <AdManagerSlot slug="sidebar-middle" page="artikel" category={article.category} />

          {/* Sidebar Bottom Ad Slot */}
          <AdManagerSlot slug="sidebar-bottom" page="artikel" category={article.category} />

          {/* Sidebar Sticky Ad Slot */}
          <div className="sticky top-24">
            <AdManagerSlot slug="sidebar-sticky" page="artikel" category={article.category} />
          </div>

        </div>

      </div>

      {/* Footer Billboard and Banner */}
      <div className="w-full mt-12 flex flex-col gap-6">
        <AdManagerSlot slug="footer-billboard" page="artikel" category={article.category} />
        <AdManagerSlot slug="footer-banner" page="artikel" category={article.category} />
      </div>

    </div>
  );
}

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { adminApi } from "../../../lib/adminApi";
import { useDialog } from "../../../context/DialogContext";
import {
  Zap,
  Search,
  Trash2,
  Edit2,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

interface Article {
  id: string;
  title: string;
  slug: string;
  image?: string;
  createdAt: string;
  publishedAt?: string;
  views: number;
  isBreaking: boolean;
  status: string;
  category: { id: string; name: string };
  author: { name: string };
}

export default function BreakingNewsPage() {
  const queryClient = useQueryClient();
  const { showConfirm, showToast } = useDialog();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const limit = 15;

  // Fetch articles with isBreaking = true
  const { data: articleData, isLoading } = useQuery<{
    data: Article[];
    pagination: { total: number; totalPages: number; page: number };
  }>({
    queryKey: ["admin", "breaking", "list", search, page],
    queryFn: async () => {
      let url = `/api/articles?isBreaking=true&status=all&page=${page}&limit=${limit}`;
      if (search) url += `&q=${encodeURIComponent(search)}`;
      const res = await adminApi.get<any>(url);
      return res;
    },
  });

  // Remove breaking label
  const removeMutation = useMutation({
    mutationFn: (id: string) =>
      adminApi.put(`/api/articles/${id}`, { isBreaking: false }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      showToast("Label Breaking News berhasil dihapus!", "success");
    },
    onError: (err: any) => {
      showToast(err.message || "Gagal menghapus label Breaking News.", "error");
    }
  });

  const total = articleData?.pagination?.total || 0;
  const totalPages = articleData?.pagination?.totalPages || 1;
  const articles = articleData?.data || [];

  const toggleSort = () => {
    setSortOrder(prev => prev === "desc" ? "asc" : "desc");
  };

  // Dummy data for when API fails
  const dummyArticles: Article[] = [
    { id: "1", title: "BREAKING: Gempa Bumi 5.8 SR Guncang Wilayah Madura Timur", slug: "gempa-madura-timur", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100&h=70&fit=crop", createdAt: "2026-07-19T08:30:00Z", publishedAt: "2026-07-19T08:30:00Z", views: 12450, isBreaking: true, status: "PUBLISHED", category: { id: "1", name: "Daerah" }, author: { name: "Super Admin" } },
    { id: "2", title: "BREAKING: Jembatan Suramadu Ditutup Sementara untuk Perbaikan Darurat", slug: "suramadu-ditutup", image: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=100&h=70&fit=crop", createdAt: "2026-07-19T07:15:00Z", publishedAt: "2026-07-19T07:15:00Z", views: 8720, isBreaking: true, status: "PUBLISHED", category: { id: "2", name: "Bangkalan" }, author: { name: "Ahmad Syafi'i" } },
  ];

  const rawArticles = articles.length > 0 ? articles : dummyArticles;
  const displayArticles = [...rawArticles].sort((a, b) => {
    const dateA = new Date(a.publishedAt || a.createdAt).getTime();
    const dateB = new Date(b.publishedAt || b.createdAt).getTime();
    return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
  });
  const displayTotal = total || dummyArticles.length;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }} className="animate-fade-in">
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", margin: 0, letterSpacing: -0.5, display: "flex", alignItems: "center", gap: 8 }}>
            <Zap size={20} style={{ color: "var(--red)" }} />
            Breaking News
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "4px 0 0" }}>
            {displayTotal} artikel berlabel Breaking News
          </p>
        </div>
      </div>

      {/* Info Banner */}
      <div style={{
        background: "var(--red-subtle)", border: "1px solid var(--red)",
        borderRadius: 10, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10,
        borderLeftWidth: 3,
      }}>
        <Zap size={15} style={{ color: "var(--red)", flexShrink: 0 }} />
        <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0, lineHeight: 1.5 }}>
          Artikel yang tampil di halaman ini adalah artikel yang telah diberi label <strong style={{ color: "var(--red)" }}>Breaking</strong> melalui checkbox <em>"Label Khusus"</em> saat membuat atau mengedit artikel.
        </p>
      </div>

      {/* Search & Table Container */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden" }}>
        {/* Search Bar */}
        <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)", display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
            <Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)" }} />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Cari artikel breaking news..."
              style={{
                width: "100%", padding: "7px 10px 7px 30px",
                background: "var(--bg-subtle)", border: "1px solid var(--border)",
                borderRadius: 8, fontSize: 13, color: "var(--text-primary)",
                outline: "none", transition: "border-color 0.1s",
              }}
              onFocus={e => e.target.style.borderColor = "var(--brand)"}
              onBlur={e => e.target.style.borderColor = "var(--border)"}
            />
          </div>
          <span style={{ fontSize: 12, color: "var(--text-tertiary)", whiteSpace: "nowrap" }}>
            {displayTotal} artikel
          </span>
        </div>

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                <th style={{ padding: "10px 16px", fontSize: 10, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "left" }}>Artikel</th>
                <th style={{ padding: "10px 16px", fontSize: 10, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "left" }}>Author</th>
                <th style={{ padding: "10px 16px", fontSize: 10, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "left" }}>Kategori</th>
                <th
                  onClick={toggleSort}
                  style={{
                    padding: "10px 16px", fontSize: 10, fontWeight: 600,
                    color: "var(--text-tertiary)", textTransform: "uppercase",
                    letterSpacing: "0.05em", textAlign: "left",
                    cursor: "pointer", userSelect: "none",
                    whiteSpace: "nowrap",
                  }}
                  title={sortOrder === "desc" ? "Urutkan: Terlama dulu" : "Urutkan: Terbaru dulu"}
                >
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                    Dipublikasi
                    {sortOrder === "desc"
                      ? <ChevronDown size={11} style={{ opacity: 0.7 }} />
                      : <ChevronUp size={11} style={{ opacity: 0.7 }} />}
                  </span>
                </th>
                <th style={{ padding: "10px 16px", fontSize: 10, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "right" }}>Views</th>
                <th style={{ padding: "10px 16px", fontSize: 10, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "center" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} style={{ padding: 40, textAlign: "center", color: "var(--text-tertiary)", fontSize: 13 }}>Memuat data...</td></tr>
              ) : displayArticles.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: 40, textAlign: "center", color: "var(--text-tertiary)", fontSize: 13, fontStyle: "italic" }}>Belum ada artikel dengan label Breaking.</td></tr>
              ) : (
                displayArticles.map((article, idx) => (
                  <tr
                    key={article.id}
                    style={{
                      borderBottom: idx < displayArticles.length - 1 ? "1px solid var(--border-subtle)" : "none",
                      transition: "background 0.1s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "var(--bg-subtle)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    {/* Title + Thumbnail */}
                    <td style={{ padding: "12px 16px", maxWidth: 420 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        {article.image && (
                          <img
                            src={article.image}
                            alt=""
                            style={{ width: 48, height: 34, objectFit: "cover", borderRadius: 6, flexShrink: 0, border: "1px solid var(--border)" }}
                          />
                        )}
                        <div style={{ minWidth: 0 }}>
                          <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 320 }}>
                            {article.title}
                          </p>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
                            <span style={{
                              fontSize: 9, fontWeight: 600, padding: "1px 6px", borderRadius: 4,
                              background: "var(--red-subtle)", color: "var(--red)", border: "1px solid var(--red)",
                              display: "inline-flex", alignItems: "center", gap: 3,
                            }}>
                              <Zap size={8} /> Breaking
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Author */}
                    <td style={{ padding: "12px 16px", fontSize: 12, color: "var(--text-secondary)" }}>
                      {article.author?.name || "—"}
                    </td>

                    {/* Category */}
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{
                        fontSize: 11, fontWeight: 500, padding: "3px 8px", borderRadius: 6,
                        background: "var(--bg-muted)", color: "var(--text-secondary)", border: "1px solid var(--border)",
                      }}>
                        {article.category?.name || "Umum"}
                      </span>
                    </td>

                    {/* Published Date */}
                    <td style={{ padding: "12px 16px", fontSize: 12, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>
                      {formatDate(article.publishedAt || article.createdAt)}
                    </td>

                    {/* Views */}
                    <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 700, color: "var(--text-primary)", textAlign: "right", fontFamily: "'JetBrains Mono', monospace" }}>
                      {article.views.toLocaleString()}
                    </td>

                    {/* Actions */}
                    <td style={{ padding: "12px 16px", textAlign: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                        <Link
                          to={`/admin/posts/edit/${article.id}`}
                          style={{
                            padding: 6, borderRadius: 6, color: "var(--text-tertiary)",
                            display: "inline-flex", transition: "all 0.1s",
                          }}
                          onMouseEnter={e => { e.currentTarget.style.color = "var(--brand)"; e.currentTarget.style.background = "var(--brand-subtle)"; }}
                          onMouseLeave={e => { e.currentTarget.style.color = "var(--text-tertiary)"; e.currentTarget.style.background = "transparent"; }}
                          title="Edit artikel"
                        >
                          <Edit2 size={14} />
                        </Link>
                        <button
                          onClick={() => {
                            showConfirm(
                              `Apakah Anda yakin ingin menghapus label Breaking News dari artikel "${article.title}"?`,
                              () => removeMutation.mutate(article.id),
                              "Hapus Breaking News",
                              { type: "danger", confirmText: "Hapus", cancelText: "Batal" }
                            );
                          }}
                          style={{
                            padding: 6, borderRadius: 6, color: "var(--text-tertiary)",
                            background: "none", border: "none", cursor: "pointer",
                            display: "inline-flex", transition: "all 0.1s",
                          }}
                          onMouseEnter={e => { e.currentTarget.style.color = "var(--red)"; e.currentTarget.style.background = "var(--red-subtle)"; }}
                          onMouseLeave={e => { e.currentTarget.style.color = "var(--text-tertiary)"; e.currentTarget.style.background = "transparent"; }}
                          title="Hapus label Breaking"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{
            padding: "12px 16px", borderTop: "1px solid var(--border)",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
              Halaman {page} dari {totalPages}
            </span>
            <div style={{ display: "flex", gap: 4 }}>
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                style={{
                  padding: "5px 10px", borderRadius: 6, border: "1px solid var(--border)",
                  background: "var(--bg-subtle)", cursor: page <= 1 ? "not-allowed" : "pointer",
                  opacity: page <= 1 ? 0.4 : 1, display: "inline-flex", alignItems: "center",
                  color: "var(--text-secondary)", fontSize: 12,
                }}
              >
                <ChevronLeft size={14} />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                style={{
                  padding: "5px 10px", borderRadius: 6, border: "1px solid var(--border)",
                  background: "var(--bg-subtle)", cursor: page >= totalPages ? "not-allowed" : "pointer",
                  opacity: page >= totalPages ? 0.4 : 1, display: "inline-flex", alignItems: "center",
                  color: "var(--text-secondary)", fontSize: 12,
                }}
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

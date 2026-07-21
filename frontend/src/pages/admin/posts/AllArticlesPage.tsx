import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { adminApi } from "../../../lib/adminApi";
import { useDialog } from "../../../context/DialogContext";
import {
  Search, Plus, Download, Trash2, Edit2, ChevronDown,
  ChevronLeft, ChevronRight, Check, Eye, MoreHorizontal, SortAsc, SortDesc
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Article {
  id: string;
  title: string;
  slug: string;
  image?: string;
  status: "DRAFT" | "PUBLISHED" | "SCHEDULED" | "ARCHIVED";
  createdAt: string;
  publishedAt?: string;
  scheduledAt?: string;
  views: number;
  category: { id: string; name: string; slug?: string };
  author: { name: string };
  editor?: { name: string };
  tags?: { tag: { name: string } }[];
}

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  PUBLISHED: { bg: "var(--green-subtle)", color: "var(--green)", label: "Published" },
  DRAFT: { bg: "var(--bg-muted)", color: "var(--text-secondary)", label: "Draft" },
  SCHEDULED: { bg: "var(--blue-subtle)", color: "var(--blue)", label: "Scheduled" },
  ARCHIVED: { bg: "var(--red-subtle)", color: "var(--red)", label: "Archived" },
};

export default function AllArticlesPage({ defaultStatus = "all" }: { defaultStatus?: string }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { showConfirm, showToast } = useDialog();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [statusFilter, setStatusFilter] = useState(defaultStatus);
  const [page, setPage] = useState(1);
  const [checkedIds, setCheckedIds] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState("");
  const [limit, setLimit] = useState(15);

  // Query for categories
  const { data: categoriesRaw } = useQuery<any>({
    queryKey: ["admin", "categories"],
    queryFn: async () => {
      const res = await adminApi.get<any>("/api/categories");
      return Array.isArray(res) ? res : res.data || [];
    }
  });

  const categoriesList: Category[] = Array.isArray(categoriesRaw)
    ? categoriesRaw
    : categoriesRaw?.data || [];

  // Query for articles
  const { data: articleData, isLoading: articlesLoading } = useQuery<{
    data: Article[];
    pagination: { total: number; totalPages: number; page: number };
  }>({
    queryKey: ["admin", "posts", search, selectedCategory, statusFilter, page, limit],
    queryFn: async () => {
      let url = `/api/articles?page=${page}&limit=${limit}`;
      if (statusFilter !== "all") url += `&status=${statusFilter}`;
      if (search) url += `&q=${encodeURIComponent(search)}`;
      if (selectedCategory && selectedCategory !== "all") url += `&category=${selectedCategory}`;

      const res = await adminApi.get<any>(url);
      return res;
    }
  });

  // Mutations
  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.delete(`/api/articles/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "posts"] });
      setCheckedIds([]);
      showToast("Artikel berhasil dihapus!", "success");
    }
  });

  const handleBulkAction = async () => {
    if (checkedIds.length === 0 || !bulkAction) return;

    showConfirm(
      `Apakah Anda yakin ingin menerapkan aksi massal ini pada ${checkedIds.length} artikel?`,
      async () => {
        try {
          for (const id of checkedIds) {
            if (bulkAction === "delete") {
              await adminApi.delete(`/api/articles/${id}`);
            } else if (bulkAction === "draft") {
              await adminApi.put(`/api/articles/${id}`, { status: "DRAFT" });
            } else if (bulkAction === "archive") {
              await adminApi.patch(`/api/articles/${id}/archive`, {});
            }
          }
          showToast("Aksi massal berhasil diselesaikan!", "success");
          queryClient.invalidateQueries({ queryKey: ["admin", "posts"] });
          setCheckedIds([]);
          setBulkAction("");
        } catch (e) {
          showToast("Gagal melakukan aksi massal", "error");
        }
      },
      "Konfirmasi Aksi Massal",
      { type: bulkAction === "delete" ? "danger" : "confirm", confirmText: "Lanjutkan", cancelText: "Batal" }
    );
  };

  const toggleSelect = (id: string) =>
    setCheckedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const toggleAll = () => {
    const ids = articleData?.data?.map(a => a.id) || [];
    const allSelected = ids.every(id => checkedIds.includes(id));
    setCheckedIds(allSelected ? checkedIds.filter(id => !ids.includes(id)) : [...new Set([...checkedIds, ...ids])]);
  };

  const total = articleData?.pagination?.total || 0;
  const articlesList = articleData?.data || [];
  const allSelected = articlesList.length > 0 && articlesList.every(a => checkedIds.includes(a.id));

  return (
    <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 20 }} className="animate-fade-in">
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", margin: 0, letterSpacing: -0.5 }}>All Articles</h1>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "4px 0 0" }}>
            {total} articles total
          </p>
        </div>
        <button
          onClick={() => navigate("/admin/posts/create")}
          style={{
            display: "flex", alignItems: "center", gap: 7, padding: "8px 16px",
            background: "var(--brand)", border: "none", borderRadius: 8,
            cursor: "pointer", color: "#fff", fontSize: 13, fontWeight: 600,
            transition: "background 0.1s",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "var(--brand-hover)"}
          onMouseLeave={e => e.currentTarget.style.background = "var(--brand)"}
        >
          <Plus size={15} /> New Article
        </button>
      </div>

      {/* Filters & Actions */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "14px 16px", display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        {/* Search */}
        <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
          <Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)" }} />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search articles, authors, categories..."
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

        {/* Category Filter */}
        <select
          value={selectedCategory}
          onChange={e => { setSelectedCategory(e.target.value); setPage(1); }}
          style={{
            padding: "6px 12px", background: "var(--bg-subtle)", border: "1px solid var(--border)",
            borderRadius: 8, fontSize: 12, color: "var(--text-secondary)", outline: "none", cursor: "pointer",
          }}
        >
          <option value="all">Semua Kategori</option>
          {categoriesList.map(c => (
            <option key={c.id} value={c.slug}>{c.name}</option>
          ))}
        </select>

        {/* Status Filter Pills */}
        <div style={{ display: "flex", gap: 4 }}>
          {["all", "PUBLISHED", "DRAFT", "SCHEDULED"].map(s => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1); }}
              style={{
                padding: "5px 11px", borderRadius: 6, border: "1px solid",
                fontSize: 12, fontWeight: 500, cursor: "pointer",
                borderColor: statusFilter === s ? "var(--brand)" : "var(--border)",
                background: statusFilter === s ? "var(--brand-subtle)" : "transparent",
                color: statusFilter === s ? "var(--brand)" : "var(--text-secondary)",
                transition: "all 0.1s",
              }}
            >
              {s === "all" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Bulk Action Controls */}
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }} className="flex items-center">
          {checkedIds.length > 0 ? (
            <div style={{ display: "flex", gap: 6, alignItems: "center" }} className="flex items-center">
              <span style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 500 }}>{checkedIds.length} selected</span>
              <select
                value={bulkAction}
                onChange={e => setBulkAction(e.target.value)}
                style={{
                  padding: "5px 8px", background: "var(--bg-subtle)", border: "1px solid var(--border)",
                  borderRadius: 6, fontSize: 11, color: "var(--text-secondary)", outline: "none", cursor: "pointer",
                }}
              >
                <option value="">Aksi Massal</option>
                <option value="delete">Hapus Selamanya</option>
                <option value="draft">Ubah ke Draft</option>
                <option value="archive">Ubah ke Arsip</option>
              </select>
              <button
                onClick={handleBulkAction}
                style={{
                  padding: "5px 10px", background: "var(--brand)", border: "none",
                  borderRadius: 6, cursor: "pointer", color: "#fff", fontSize: 11, fontWeight: 600,
                }}
              >
                Terapkan
              </button>
            </div>
          ) : (
            <button style={{
              display: "flex", alignItems: "center", gap: 6, padding: "6px 11px",
              background: "var(--bg-subtle)", border: "1px solid var(--border)",
              borderRadius: 8, cursor: "pointer", color: "var(--text-secondary)", fontSize: 12,
            }}>
              <Download size={12} /> Export
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
        {articlesLoading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--text-tertiary)" }}>
            Memuat data artikel...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "var(--bg-subtle)", borderBottom: "1px solid var(--border)" }}>
                  <th style={{ padding: "10px 16px", width: 40 }}>
                    <div
                      onClick={toggleAll}
                      style={{
                        width: 16, height: 16, borderRadius: 4, border: "1.5px solid var(--border)",
                        background: allSelected ? "var(--brand)" : "transparent",
                        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                        transition: "all 0.1s",
                      }}
                    >
                      {allSelected && <Check size={10} color="#fff" />}
                    </div>
                  </th>
                  <th style={{ padding: "10px 8px", width: 56 }} />
                  {[
                    { label: "Title" },
                    { label: "Author" },
                    { label: "Editor" },
                    { label: "Category" },
                    { label: "Status" },
                    { label: "Modified" },
                    { label: "Views" },
                  ].map(col => (
                    <th
                      key={col.label}
                      style={{
                        padding: "10px 8px", textAlign: "left", fontSize: 11, fontWeight: 600,
                        color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em",
                      }}
                    >
                      {col.label}
                    </th>
                  ))}
                  <th style={{ padding: "10px 8px", width: 80 }} />
                </tr>
              </thead>
              <tbody>
                {articlesList.length === 0 ? (
                  <tr>
                    <td colSpan={10} style={{ padding: "40px", textAlign: "center", color: "var(--text-tertiary)" }}>
                      Tidak ada artikel yang ditemukan
                    </td>
                  </tr>
                ) : (
                  articlesList.map(article => {
                    const isSelected = checkedIds.includes(article.id);
                    const s = STATUS_STYLE[article.status] || STATUS_STYLE.DRAFT;
                    return (
                      <tr
                        key={article.id}
                        style={{
                          background: isSelected ? "var(--brand-subtle)" : "transparent",
                          borderBottom: "1px solid var(--border-subtle)",
                          transition: "background 0.1s",
                        }}
                        onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = "var(--bg-subtle)"; }}
                        onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}
                      >
                        <td style={{ padding: "12px 16px" }}>
                          <div
                            onClick={() => toggleSelect(article.id)}
                            style={{
                              width: 16, height: 16, borderRadius: 4, border: "1.5px solid",
                              borderColor: isSelected ? "var(--brand)" : "var(--border)",
                              background: isSelected ? "var(--brand)" : "transparent",
                              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                            }}
                          >
                            {isSelected && <Check size={10} color="#fff" />}
                          </div>
                        </td>
                        <td style={{ padding: "12px 8px" }}>
                          <img
                            src={article.image || "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=60&h=60&fit=crop&auto=format"}
                            alt=""
                            style={{ width: 44, height: 44, objectFit: "cover", borderRadius: 6, background: "var(--bg-muted)", display: "block" }}
                          />
                        </td>
                        <td style={{ padding: "12px 8px", maxWidth: 320 }}>
                          <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }} className="truncate">
                            {article.title}
                          </div>
                          {article.tags && article.tags.length > 0 && (
                            <div style={{ marginTop: 3, display: "flex", gap: 4, flexWrap: "nowrap", overflow: "hidden" }}>
                              {article.tags.slice(0, 2).map((tag, idx) => (
                                <span key={tag.tag?.name || idx} style={{
                                  fontSize: 10, padding: "1px 6px", borderRadius: 99,
                                  background: "var(--bg-muted)", color: "var(--text-tertiary)", whiteSpace: "nowrap",
                                }}>{tag.tag?.name || "Tag"}</span>
                              ))}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: "12px 8px", fontSize: 12.5, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>{article.author?.name || "Super Admin"}</td>
                        <td style={{ padding: "12px 8px", fontSize: 12.5, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>{article.editor?.name || "Ahmad Syafi'i"}</td>
                        <td style={{ padding: "12px 8px" }}>
                          <span style={{
                            fontSize: 11, fontWeight: 500, padding: "2px 8px", borderRadius: 99,
                            background: "var(--blue-subtle)", color: "var(--blue)", whiteSpace: "nowrap",
                          }}>{article.category?.name || "Umum"}</span>
                        </td>
                        <td style={{ padding: "12px 8px" }}>
                          <span style={{
                            fontSize: 11, fontWeight: 500, padding: "2px 8px", borderRadius: 99,
                            background: s.bg, color: s.color, whiteSpace: "nowrap",
                          }}>{s.label}</span>
                        </td>
                        <td style={{ padding: "12px 8px", fontSize: 11.5, color: "var(--text-tertiary)", whiteSpace: "nowrap", fontFamily: "'JetBrains Mono', monospace" }}>
                          {new Date(article.createdAt).toLocaleString("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </td>
                        <td style={{ padding: "12px 8px", fontSize: 12.5, fontWeight: 600, color: "var(--text-primary)", whiteSpace: "nowrap", fontFamily: "'JetBrains Mono', monospace" }}>
                          {article.views > 0 ? article.views.toLocaleString() : "—"}
                        </td>
                        <td style={{ padding: "12px 8px" }}>
                          <div style={{ display: "flex", gap: 4 }}>
                            <button
                              onClick={() => navigate(`/admin/posts/edit/${article.id}`)}
                              style={{
                                width: 28, height: 28, borderRadius: 6, border: "1px solid var(--border)",
                                background: "transparent", cursor: "pointer", display: "flex",
                                alignItems: "center", justifyContent: "center", color: "var(--text-tertiary)",
                                transition: "all 0.1s",
                              }}
                              onMouseEnter={e => { e.currentTarget.style.background = "var(--bg-muted)"; e.currentTarget.style.color = "var(--text-primary)"; }}
                              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-tertiary)"; }}
                              className="flex items-center justify-center"
                            >
                              <Edit2 size={12} />
                            </button>
                            <button
                              onClick={() => {
                                showConfirm(
                                  `Apakah Anda yakin ingin menghapus artikel "${article.title}"?`,
                                  () => deleteMutation.mutate(article.id),
                                  "Hapus Artikel",
                                  { type: "danger", confirmText: "Hapus", cancelText: "Batal" }
                                );
                              }}
                              style={{
                                width: 28, height: 28, borderRadius: 6, border: "1px solid var(--border)",
                                background: "transparent", cursor: "pointer", display: "flex",
                                alignItems: "center", justifyContent: "center", color: "var(--text-tertiary)",
                                transition: "all 0.1s",
                              }}
                              onMouseEnter={e => { e.currentTarget.style.background = "var(--red-subtle)"; e.currentTarget.style.color = "var(--red)"; }}
                              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-tertiary)"; }}
                              className="flex items-center justify-center"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {articleData?.pagination && (
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "12px 16px", borderTop: "1px solid var(--border)",
            background: "var(--bg-subtle)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
                Menampilkan {total > 0 ? (page - 1) * limit + 1 : 0}–{Math.min(page * limit, total)} dari {total} artikel
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>Tampilkan:</span>
                <select
                  value={limit}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setLimit(val);
                    setPage(1);
                  }}
                  style={{
                    padding: "4px 8px",
                    borderRadius: 6,
                    border: "1px solid var(--border)",
                    background: "var(--surface)",
                    fontSize: 11,
                    fontWeight: 600,
                    color: "var(--text-secondary)",
                    outline: "none",
                    cursor: "pointer",
                  }}
                  className="focus:border-[#0D2B5C] transition-colors"
                >
                  <option value={15}>15</option>
                  <option value={30}>30</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{
                  width: 30, height: 30, borderRadius: 7, border: "1px solid var(--border)",
                  background: "transparent", cursor: page === 1 ? "default" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: page === 1 ? "var(--text-tertiary)" : "var(--text-secondary)",
                  opacity: page === 1 ? 0.5 : 1,
                }}
                className="flex items-center justify-center"
              >
                <ChevronLeft size={13} />
              </button>
              {(() => {
                const pages = [];
                const totalPages = articleData.pagination.totalPages;
                const maxPageDisplay = 5;
                let startPage = Math.max(1, page - Math.floor(maxPageDisplay / 2));
                let endPage = Math.min(totalPages, startPage + maxPageDisplay - 1);

                if (endPage - startPage + 1 < maxPageDisplay) {
                  startPage = Math.max(1, endPage - maxPageDisplay + 1);
                }

                const renderPageButton = (p: number) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    style={{
                      width: 30, height: 30, borderRadius: 7, border: "1px solid",
                      borderColor: p === page ? "var(--brand)" : "var(--border)",
                      background: p === page ? "var(--brand)" : "transparent",
                      cursor: "pointer", fontSize: 12, fontWeight: p === page ? 600 : 400,
                      color: p === page ? "#fff" : "var(--text-secondary)",
                    }}
                  >
                    {p}
                  </button>
                );

                if (startPage > 1) {
                  pages.push(renderPageButton(1));
                  if (startPage > 2) {
                    pages.push(
                      <span key="ellipsis-start" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 30, height: 30, color: "var(--text-tertiary)", fontSize: 12 }}>
                        ...
                      </span>
                    );
                  }
                }

                for (let p = startPage; p <= endPage; p++) {
                  pages.push(renderPageButton(p));
                }

                if (endPage < totalPages) {
                  if (endPage < totalPages - 1) {
                    pages.push(
                      <span key="ellipsis-end" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 30, height: 30, color: "var(--text-tertiary)", fontSize: 12 }}>
                        ...
                      </span>
                    );
                  }
                  pages.push(renderPageButton(totalPages));
                }

                return pages;
              })()}
              <button
                onClick={() => setPage(p => Math.min(articleData.pagination.totalPages, p + 1))}
                disabled={page === articleData.pagination.totalPages}
                style={{
                  width: 30, height: 30, borderRadius: 7, border: "1px solid var(--border)",
                  background: "transparent", cursor: page === articleData.pagination.totalPages ? "default" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "var(--text-secondary)",
                  opacity: page === articleData.pagination.totalPages ? 0.5 : 1,
                }}
                className="flex items-center justify-center"
              >
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

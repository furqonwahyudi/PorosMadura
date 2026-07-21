import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../../../lib/adminApi";
import { useDialog } from "../../../context/DialogContext";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";

interface SpamComment {
  id: string;
  author: string;
  email?: string;
  ipAddress?: string;
  content: string;
  createdAt: string;
  article?: {
    id: string;
    title: string;
    slug: string;
  };
}

export default function CommentSpamPage() {
  const queryClient = useQueryClient();
  const { confirm, toast } = useDialog();

  const { data: spamRes, isLoading } = useQuery<{ success: boolean; data: SpamComment[] }>({
    queryKey: ["admin", "comments", "spam"],
    queryFn: async () => adminApi.get<any>("/api/comments/admin/spam"),
  });

  const spams = spamRes?.data || [];

  const deleteOneMutation = useMutation({
    mutationFn: async (id: string) => adminApi.delete(`/api/comments/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      toast("success", "Komentar spam berhasil dihapus permanen!");
    },
    onError: (err: any) => toast("error", `Gagal menghapus: ${err.message}`),
  });

  const emptyStorageMutation = useMutation({
    mutationFn: async () => adminApi.delete("/api/comments/admin/spam/empty"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      toast("success", "Folder spam telah dikosongkan!");
    },
    onError: (err: any) => toast("error", `Gagal mengosongkan folder: ${err.message}`),
  });

  const handleEmptyAll = () => {
    confirm({
      title: "Kosongkan Folder Spam",
      message: `Apakah Anda yakin ingin menghapus seluruh ${spams.length} komentar spam secara permanen?`,
      confirmText: "Ya, Kosongkan",
      cancelText: "Batal",
      type: "danger",
      onConfirm: () => emptyStorageMutation.mutate(),
    });
  };

  const handleDeleteOne = (s: SpamComment) => {
    confirm({
      title: "Hapus Komentar Spam",
      message: `Hapus komentar spam dari "${s.author}" secara permanen?`,
      confirmText: "Hapus",
      cancelText: "Batal",
      type: "danger",
      onConfirm: () => deleteOneMutation.mutate(s.id),
    });
  };

  return (
    <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 20 }} className="animate-fade-in">
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", margin: 0, letterSpacing: -0.5 }}>
            Automated &amp; Manual Spam Comments Box
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "4px 0 0" }}>
            {spams.length} komentar terdaftar di database PostgreSQL folder spam
          </p>
        </div>
        <button
          onClick={handleEmptyAll}
          disabled={spams.length === 0 || emptyStorageMutation.isPending}
          style={{
            display: "flex", alignItems: "center", gap: 7, padding: "8px 16px",
            background: spams.length === 0 ? "var(--bg-muted)" : "var(--red)",
            border: "none", borderRadius: 8,
            cursor: spams.length === 0 ? "not-allowed" : "pointer",
            color: spams.length === 0 ? "var(--text-tertiary)" : "#fff",
            fontSize: 13, fontWeight: 600,
          }}
        >
          {emptyStorageMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />} Empty Spam Storage
        </button>
      </div>

      {/* Info Notice */}
      <div style={{
        background: "var(--orange-subtle)", border: "1px solid var(--orange)",
        borderRadius: 10, padding: "12px 16px", display: "flex", gap: 10, alignItems: "center",
      }}>
        <AlertTriangle size={16} style={{ color: "var(--orange)", flexShrink: 0 }} />
        <p style={{ fontSize: 12, color: "var(--text-primary)", margin: 0 }}>
          Komentar ditandai sebagai spam secara otomatis oleh filter kata kunci &amp; IP reputation, atau secara manual dari antrean moderasi.
        </p>
      </div>

      {/* Spam List */}
      {isLoading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "40px 0", color: "var(--text-secondary)", fontSize: 13, alignItems: "center" }}>
          <Loader2 className="animate-spin" size={16} style={{ marginRight: 8 }} />
          Memuat data komentar spam dari database...
        </div>
      ) : spams.length === 0 ? (
        <div style={{ padding: 36, textAlign: "center", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, color: "var(--text-secondary)" }}>
          <p style={{ fontSize: 14, fontWeight: 600, margin: 0, color: "var(--text-primary)" }}>Folder Spam Kosong!</p>
          <p style={{ fontSize: 12, margin: "4px 0 0" }}>Tidak ada komentar terdeteksi spam saat ini di PostgreSQL.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {spams.map(s => (
            <div key={s.id} style={{
              background: "var(--surface)", border: "1px solid var(--border)",
              borderRadius: 12, padding: 16, display: "flex", flexDirection: "column", gap: 8
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{s.author}</span>
                  <span style={{ fontSize: 11, color: "var(--text-tertiary)", marginLeft: 8 }}>{s.email || "No Email"}</span>
                  {s.ipAddress && <span style={{ fontSize: 11, color: "var(--text-tertiary)", marginLeft: 8 }}>IP: {s.ipAddress}</span>}
                </div>
                <button
                  onClick={() => handleDeleteOne(s)}
                  style={{
                    padding: "4px 8px", borderRadius: 6, border: "1px solid var(--border)",
                    background: "var(--bg-subtle)", color: "var(--red)", cursor: "pointer"
                  }}
                  title="Hapus Permanen"
                >
                  <Trash2 size={13} />
                </button>
              </div>

              <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0, background: "var(--bg-subtle)", padding: "8px 12px", borderRadius: 8, fontStyle: "italic" }}>
                "{s.content}"
              </p>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11, color: "var(--text-tertiary)" }}>
                <span>Artikel: <strong>{s.article?.title || "Portal Berita"}</strong></span>
                <span>{new Date(s.createdAt).toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

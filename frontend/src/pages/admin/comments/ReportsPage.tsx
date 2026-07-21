import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../../../lib/adminApi";
import { useDialog } from "../../../context/DialogContext";
import { Flag, Trash2, CheckCircle, Loader2 } from "lucide-react";

interface ReportedComment {
  id: string;
  author: string;
  email?: string;
  content: string;
  reportReason?: string;
  createdAt: string;
  article?: {
    id: string;
    title: string;
    slug: string;
  };
}

export default function CommentReportsPage() {
  const queryClient = useQueryClient();
  const { confirm, toast } = useDialog();

  const { data: reportsRes, isLoading } = useQuery<{ success: boolean; data: ReportedComment[] }>({
    queryKey: ["admin", "comments", "reports"],
    queryFn: async () => adminApi.get<any>("/api/comments/admin/reports"),
  });

  const reports = reportsRes?.data || [];

  const dismissMutation = useMutation({
    mutationFn: async (id: string) => adminApi.patch(`/api/comments/admin/reports/${id}/dismiss`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      toast("info", "Laporan berhasil diabaikan!");
    },
    onError: (err: any) => toast("error", `Gagal mengabaikan: ${err.message}`),
  });

  const deleteCommentMutation = useMutation({
    mutationFn: async (id: string) => adminApi.delete(`/api/comments/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      toast("success", "Komentar berpelanggaran berhasil dihapus permanen!");
    },
    onError: (err: any) => toast("error", `Gagal menghapus: ${err.message}`),
  });

  const handleDismiss = (r: ReportedComment) => {
    dismissMutation.mutate(r.id);
  };

  const handleDelete = (r: ReportedComment) => {
    confirm({
      title: "Hapus Komentar Berpelanggaran",
      message: `Hapus komentar dari "${r.author}" secara permanen dari database?`,
      confirmText: "Hapus Permanen",
      cancelText: "Batal",
      type: "danger",
      onConfirm: () => deleteCommentMutation.mutate(r.id),
    });
  };

  return (
    <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 20 }} className="animate-fade-in">
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", margin: 0, letterSpacing: -0.5 }}>
          User Flagged &amp; Reported Comments
        </h1>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "4px 0 0" }}>
          {reports.length} laporan pelanggaran komentar dari pembaca terdaftar di database PostgreSQL
        </p>
      </div>

      {/* Reports list */}
      {isLoading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "40px 0", color: "var(--text-secondary)", fontSize: 13, alignItems: "center" }}>
          <Loader2 className="animate-spin" size={16} style={{ marginRight: 8 }} />
          Memuat daftar laporan pengguna dari database...
        </div>
      ) : reports.length === 0 ? (
        <div style={{ padding: 36, textAlign: "center", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, color: "var(--text-secondary)" }}>
          <p style={{ fontSize: 14, fontWeight: 600, margin: 0, color: "var(--text-primary)" }}>Tidak Ada Laporan Pelanggaran!</p>
          <p style={{ fontSize: 12, margin: "4px 0 0" }}>Semua komentar pembaca bersih dari laporan hoaks atau SARA saat ini di PostgreSQL.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {reports.map(r => (
            <div key={r.id} style={{
              background: "var(--surface)", border: "1px solid var(--border)",
              borderRadius: 12, padding: 16, display: "flex", flexDirection: "column", gap: 10
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{r.author}</span>
                  <span style={{ fontSize: 11, color: "var(--text-tertiary)", marginLeft: 8 }}>{r.email || "No Email"}</span>
                </div>
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 12,
                  background: "var(--red-subtle)", color: "var(--red)", border: "1px solid var(--red)"
                }}>
                  Alasan: {r.reportReason || "Ujaran Kebencian / SARA"}
                </span>
              </div>

              <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0, background: "var(--bg-subtle)", padding: "10px 14px", borderRadius: 8, fontStyle: "italic" }}>
                "{r.content}"
              </p>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>
                  Artikel: <strong>{r.article?.title || "Portal Berita"}</strong> · {new Date(r.createdAt).toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                </span>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => handleDismiss(r)}
                    style={{
                      display: "flex", alignItems: "center", gap: 4, padding: "5px 10px", borderRadius: 6,
                      border: "1px solid var(--border)", background: "var(--bg-subtle)", fontSize: 12, color: "var(--text-secondary)", cursor: "pointer"
                    }}
                  >
                    <CheckCircle size={12} /> Abaikan Laporan
                  </button>
                  <button
                    onClick={() => handleDelete(r)}
                    style={{
                      display: "flex", alignItems: "center", gap: 4, padding: "5px 10px", borderRadius: 6,
                      border: "none", background: "var(--red)", fontSize: 12, color: "#fff", fontWeight: 600, cursor: "pointer"
                    }}
                  >
                    <Trash2 size={12} /> Hapus Komentar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

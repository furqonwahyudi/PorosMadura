import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../../../lib/adminApi";
import { useDialog } from "../../../context/DialogContext";
import { CheckCircle, X, Flag, Reply, MessageSquare, User, Globe, Clock, Loader2, Send } from "lucide-react";

interface CommentItem {
  id: string;
  content: string;
  author: string;
  email?: string;
  isApproved: boolean;
  createdAt: string;
  article?: {
    id: string;
    title: string;
    slug: string;
  };
}

export default function CommentModerationPage() {
  const queryClient = useQueryClient();
  const { showConfirm, showToast } = useDialog();

  const [replyId, setReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  // Fetch pending comments for moderation
  const { data: commentsRes, isLoading } = useQuery<{ success: boolean; data: CommentItem[] }>({
    queryKey: ["admin", "comments", "pending"],
    queryFn: async () => adminApi.get<any>("/api/comments/admin/all?status=pending")
  });

  const comments = commentsRes?.data || [];

  // Mutations
  const approveMutation = useMutation({
    mutationFn: async (id: string) => adminApi.patch(`/api/comments/${id}/approve`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      showToast("Komentar disetujui!", "success");
    },
    onError: (err: any) => showToast(err.message || "Gagal menyetujui komentar", "error")
  });

  const rejectMutation = useMutation({
    mutationFn: async (id: string) => adminApi.patch(`/api/comments/${id}/unapprove`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      showToast("Komentar ditolak!", "info");
    },
    onError: (err: any) => showToast(err.message || "Gagal menolak komentar", "error")
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => adminApi.delete(`/api/comments/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      showToast("Komentar berhasil dihapus!", "success");
    },
    onError: (err: any) => showToast(err.message || "Gagal menghapus komentar", "error")
  });

  const replyMutation = useMutation({
    mutationFn: async ({ commentId, content }: { commentId: string; content: string }) =>
      adminApi.post(`/api/comments/admin/${commentId}/reply`, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      showToast("Balasan redaksi berhasil dikirim & disetujui!", "success");
      setReplyId(null);
      setReplyText("");
    },
    onError: (err: any) => showToast(err.message || "Gagal mengirim balasan", "error")
  });

  const handleApproveAll = () => {
    if (comments.length === 0) return;
    showConfirm(
      `Apakah Anda yakin ingin menyetujui sekaligus ${comments.length} komentar yang sedang antre?`,
      async () => {
        for (const c of comments) {
          await adminApi.patch(`/api/comments/${c.id}/approve`, {});
        }
        queryClient.invalidateQueries({ queryKey: ["admin", "comments"] });
        showToast("Semua komentar berhasil disetujui!", "success");
      },
      "Setujui Semua Komentar",
      { confirmText: "Setujui Semua", type: "confirm" }
    );
  };

  const handleSendReply = (commentId: string) => {
    if (!replyText.trim()) {
      showToast("Tuliskan isi balasan terlebih dahulu!", "warning");
      return;
    }
    replyMutation.mutate({ commentId, content: replyText });
  };

  return (
    <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 20 }} className="animate-fade-in">
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", margin: 0, letterSpacing: -0.5 }}>
            Comment Moderation &amp; Approval Queue
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "4px 0 0" }}>
            {comments.length} komentar menunggu persetujuan
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={handleApproveAll}
            disabled={comments.length === 0}
            style={{
              padding: "7px 14px", borderRadius: 8, border: "1px solid var(--border)",
              background: "transparent", color: comments.length === 0 ? "var(--text-tertiary)" : "var(--green)", fontSize: 12, fontWeight: 600, cursor: comments.length === 0 ? "not-allowed" : "pointer",
            }}
          >
            Setujui Semua ({comments.length})
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
        {[
          { label: "Menunggu Review", val: comments.length, color: "var(--yellow)" },
          { label: "Total Komentar", val: comments.length, color: "var(--blue)" },
        ].map(s => (
          <div key={s.label} style={{
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: 10, padding: "14px 16px",
          }}>
            <p style={{ fontSize: 11, color: "var(--text-tertiary)", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: 600 }}>{s.label}</p>
            <p style={{ fontSize: 24, fontWeight: 700, color: s.color, margin: 0 }}>{s.val}</p>
          </div>
        ))}
      </div>

      {/* Comment queue */}
      {isLoading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "40px 0", color: "var(--text-secondary)", fontSize: 13, alignItems: "center" }}>
          <Loader2 className="animate-spin" size={16} style={{ marginRight: 8 }} />
          Memuat antrean moderasi komentar...
        </div>
      ) : comments.length === 0 ? (
        <div style={{
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: 12, padding: "48px 24px", textAlign: "center",
        }}>
          <CheckCircle size={40} style={{ color: "var(--green)", margin: "0 auto 12px" }} />
          <p style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 4px" }}>Antrean Bersih!</p>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0 }}>Semua komentar pembaca di database sudah diproses.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {comments.map(c => (
            <div key={c.id} style={{
              background: "var(--surface)", border: "1px solid var(--border)",
              borderRadius: 12, overflow: "hidden",
            }}>
              <div style={{ padding: "14px 16px" }}>
                {/* Meta row */}
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 10 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                    background: "var(--brand-subtle)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <User size={16} style={{ color: "var(--brand)" }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 12px", alignItems: "center" }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{c.author}</span>
                      {c.email && <span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>{c.email}</span>}
                      <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, color: "var(--text-tertiary)" }}>
                        <Clock size={10} /> {new Date(c.createdAt).toLocaleString("id-ID")}
                      </span>
                    </div>
                    {c.article && (
                      <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
                        <MessageSquare size={10} style={{ color: "var(--text-tertiary)" }} />
                        <span style={{ fontSize: 11, color: "var(--brand)" }}>
                          Pada Artikel: {c.article.title}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Comment content */}
                <div style={{
                  padding: "10px 14px", background: "var(--bg-subtle)",
                  borderRadius: 8, borderLeft: "3px solid var(--brand)",
                  fontSize: 13, color: "var(--text-primary)", lineHeight: 1.55,
                  marginBottom: 12,
                }}>
                  {c.content}
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button
                    onClick={() => approveMutation.mutate(c.id)}
                    disabled={approveMutation.isPending}
                    style={{
                      display: "flex", alignItems: "center", gap: 5, padding: "6px 12px",
                      borderRadius: 7, border: "1px solid var(--green)", background: "var(--green-subtle)",
                      color: "var(--green)", fontSize: 12, fontWeight: 600, cursor: "pointer",
                    }}
                  >
                    <CheckCircle size={12} /> Setujui
                  </button>
                  <button
                    onClick={() => setReplyId(replyId === c.id ? null : c.id)}
                    style={{
                      display: "flex", alignItems: "center", gap: 5, padding: "6px 12px",
                      borderRadius: 7, border: "1px solid var(--border)", background: "var(--bg-subtle)",
                      color: "var(--text-secondary)", fontSize: 12, fontWeight: 600, cursor: "pointer",
                    }}
                  >
                    <Reply size={12} /> Balas
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate(c.id)}
                    disabled={deleteMutation.isPending}
                    style={{
                      display: "flex", alignItems: "center", gap: 5, padding: "6px 12px",
                      borderRadius: 7, border: "1px solid var(--orange)", background: "var(--orange-subtle)",
                      color: "var(--orange)", fontSize: 12, fontWeight: 600, cursor: "pointer",
                    }}
                  >
                    <Flag size={12} /> Tandai Spam / Hapus
                  </button>
                  <button
                    onClick={() => rejectMutation.mutate(c.id)}
                    disabled={rejectMutation.isPending}
                    style={{
                      display: "flex", alignItems: "center", gap: 5, padding: "6px 12px",
                      borderRadius: 7, border: "1px solid var(--red)", background: "var(--red-subtle)",
                      color: "var(--red)", fontSize: 12, fontWeight: 600, cursor: "pointer",
                    }}
                  >
                    <X size={12} /> Tolak
                  </button>
                </div>

                {/* Reply box */}
                {replyId === c.id && (
                  <div style={{ marginTop: 12, borderTop: "1px solid var(--border)", paddingTop: 12 }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", margin: "0 0 6px" }}>
                      Balas sebagai Redaksi Poros Madura:
                    </p>
                    <textarea
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      rows={3}
                      placeholder="Tulis balasan resmi dari redaksi..."
                      style={{
                        width: "100%", padding: "8px 12px", background: "var(--bg-subtle)",
                        border: "1px solid var(--border)", borderRadius: 8,
                        fontSize: 13, color: "var(--text-primary)", resize: "none", outline: "none",
                        boxSizing: "border-box",
                      }}
                    />
                    <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                      <button
                        onClick={() => handleSendReply(c.id)}
                        disabled={replyMutation.isPending}
                        style={{
                          padding: "7px 14px", borderRadius: 7, border: "none",
                          background: "var(--brand)", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer",
                          display: "flex", alignItems: "center", gap: 6
                        }}
                      >
                        {replyMutation.isPending ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                        Kirim Balasan & Setujui
                      </button>
                      <button
                        onClick={() => { setReplyId(null); setReplyText(""); }}
                        style={{
                          padding: "7px 12px", borderRadius: 7, border: "1px solid var(--border)",
                          background: "transparent", color: "var(--text-secondary)", fontSize: 12, cursor: "pointer",
                        }}
                      >
                        Batal
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

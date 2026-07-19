import React, { useState } from "react";
import { CheckCircle, X, Flag, Reply, MessageSquare, User, Globe, Clock, ChevronDown } from "lucide-react";

const MOCK_COMMENTS = [
  { id: "1", author: "Budi Santoso", email: "budi.s@gmail.com", ip: "182.4.12.53", userAgent: "Chrome 125, Android", content: "Semoga infrastruktur di Sampang segera diperbaiki pak Bupati, sudah lama warga menunggu!", article: "Bupati Bangkalan Resmikan Jembatan Baru", time: "2 menit lalu" },
  { id: "2", author: "Rina Maulida", email: "rina.m@yahoo.com", ip: "36.77.201.10", userAgent: "Safari, iPhone 14", content: "Terima kasih beritanya sangat informatif. Warga Sumenep sangat terbantu dengan berita seperti ini.", article: "DPRD Sumenep Bahas Anggaran Kesehatan 2026", time: "8 menit lalu" },
  { id: "3", author: "Agus Wahyudi", email: "agus.w@outlook.com", ip: "114.122.77.4", userAgent: "Firefox 127, Windows", content: "Kenapa tidak ada foto pelaksanaannya? Tolong redaksi lebih lengkap dalam meliputi berita lapangan.", article: "Festival Seni Budaya Madura Ke-14 Sukses Digelar", time: "15 menit lalu" },
  { id: "4", author: "Dewi Puspita", email: "dewi.p@gmail.com", ip: "202.93.4.19", userAgent: "Chrome 125, Windows", content: "Akhirnya ada juga liputan tentang petani garam Madura. Mereka butuh perhatian lebih dari pemerintah!", article: "Harga Garam Madura Anjlok, Petani Mengeluh", time: "23 menit lalu" },
  { id: "5", author: "Hasan Basri", email: "hbasri@gmail.com", ip: "180.244.3.87", userAgent: "Chrome, Android", content: "Tolong cross-check dulu sebelum publish, data yang disajikan berbeda dengan data BPS yang saya punya.", article: "Inflasi Madura Q2 Stabil di 2.3%", time: "41 menit lalu" },
];

export default function CommentModerationPage() {
  const [comments, setComments] = useState(MOCK_COMMENTS);
  const [replyId, setReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const approve = (id: string) => setComments(prev => prev.filter(c => c.id !== id));
  const reject = (id: string) => setComments(prev => prev.filter(c => c.id !== id));
  const spam = (id: string) => setComments(prev => prev.filter(c => c.id !== id));

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
            onClick={() => setComments([])}
            style={{
              padding: "7px 14px", borderRadius: 8, border: "1px solid var(--border)",
              background: "transparent", color: "var(--green)", fontSize: 12, fontWeight: 600, cursor: "pointer",
            }}
          >
            Setujui Semua ({comments.length})
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        {[
          { label: "Menunggu Review", val: comments.length, color: "var(--yellow)" },
          { label: "Disetujui Hari Ini", val: 142, color: "var(--green)" },
          { label: "Ditolak / Spam", val: 23, color: "var(--red)" },
          { label: "Total Komentar", val: "1,284", color: "var(--blue)" },
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
      {comments.length === 0 ? (
        <div style={{
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: 12, padding: "48px 24px", textAlign: "center",
        }}>
          <CheckCircle size={40} style={{ color: "var(--green)", margin: "0 auto 12px" }} />
          <p style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 4px" }}>Antrean Bersih!</p>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0 }}>Semua komentar sudah diproses.</p>
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
                  {/* Avatar */}
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
                      <span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>{c.email}</span>
                      <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, color: "var(--text-tertiary)" }}>
                        <Globe size={10} /> {c.ip}
                      </span>
                      <span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>{c.userAgent}</span>
                      <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, color: "var(--text-tertiary)" }}>
                        <Clock size={10} /> {c.time}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
                      <MessageSquare size={10} style={{ color: "var(--text-tertiary)" }} />
                      <span style={{ fontSize: 11, color: "var(--brand)" }}>
                        Pada: {c.article}
                      </span>
                    </div>
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
                    onClick={() => approve(c.id)}
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
                    onClick={() => spam(c.id)}
                    style={{
                      display: "flex", alignItems: "center", gap: 5, padding: "6px 12px",
                      borderRadius: 7, border: "1px solid var(--border)", background: "var(--bg-subtle)",
                      color: "var(--orange)", fontSize: 12, fontWeight: 600, cursor: "pointer",
                    }}
                  >
                    <Flag size={12} /> Tandai Spam
                  </button>
                  <button
                    onClick={() => reject(c.id)}
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
                        onClick={() => { approve(c.id); setReplyId(null); setReplyText(""); }}
                        style={{
                          padding: "7px 14px", borderRadius: 7, border: "none",
                          background: "var(--brand)", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer",
                        }}
                      >
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

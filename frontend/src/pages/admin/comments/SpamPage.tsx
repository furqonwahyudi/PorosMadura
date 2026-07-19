import React, { useState } from "react";
import { Trash2, Flag, Globe, Clock, User, AlertTriangle } from "lucide-react";

const MOCK_SPAM = [
  { id: "1", author: "spammer123", email: "spam@spambot.ru", ip: "45.14.10.233", content: "Buy cheap Rolex watch! Click here now >>> http://bit.ly/fakeshop123. Best deals guaranteed!!!", article: "Harga Garam Madura Anjlok", time: "5 menit lalu", auto: true },
  { id: "2", author: "iklan_murah", email: "promo@promo.biz", ip: "103.28.90.11", content: "PROMO PINJAMAN ONLINE TANPA JAMINAN RP 500 RIBU SD 50 JUTA. CAIR 1 HARI. WA: 08127xxxxx", article: "Bupati Bangkalan Resmikan Jembatan", time: "12 menit lalu", auto: true },
  { id: "3", author: "bot_comment", email: "bot@mailinator.com", ip: "5.188.206.90", content: "Artikel sangat bagus. Kunjungi juga website kami untuk informasi menarik lainnya di www.clickbait-site.com", article: "Festival Seni Budaya Madura", time: "28 menit lalu", auto: false },
  { id: "4", author: "casino_promoter", email: "promo@casino88.id", ip: "202.95.170.4", content: "DAFTAR SEKARANG!! Dapatkan bonus slot 200% di Casino88. Kode promo: MADURA2026", article: "Inflasi Madura Q2 Stabil", time: "1 jam lalu", auto: true },
];

export default function CommentSpamPage() {
  const [spams, setSpams] = useState(MOCK_SPAM);
  const [showConfirm, setShowConfirm] = useState(false);

  const removeOne = (id: string) => setSpams(prev => prev.filter(s => s.id !== id));
  const emptyAll = () => { setSpams([]); setShowConfirm(false); };

  return (
    <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 20 }} className="animate-fade-in">
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", margin: 0, letterSpacing: -0.5 }}>
            Automated &amp; Manual Spam Comments Box
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "4px 0 0" }}>
            {spams.length} komentar di folder spam
          </p>
        </div>
        <button
          onClick={() => setShowConfirm(true)}
          disabled={spams.length === 0}
          style={{
            display: "flex", alignItems: "center", gap: 7, padding: "8px 16px",
            background: spams.length === 0 ? "var(--bg-muted)" : "var(--red)",
            border: "none", borderRadius: 8,
            cursor: spams.length === 0 ? "not-allowed" : "pointer",
            color: spams.length === 0 ? "var(--text-tertiary)" : "#fff",
            fontSize: 13, fontWeight: 600,
          }}
        >
          <Trash2 size={14} /> Empty Spam Storage
        </button>
      </div>

      {/* Confirm dialog */}
      {showConfirm && (
        <div style={{
          background: "var(--red-subtle)", border: "1px solid var(--red)",
          borderRadius: 10, padding: "14px 16px",
          display: "flex", gap: 12, alignItems: "center",
        }}>
          <AlertTriangle size={18} style={{ color: "var(--red)", flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 2px" }}>
              Hapus semua {spams.length} komentar spam secara permanen?
            </p>
            <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0 }}>
              Tindakan ini tidak dapat dibatalkan. Data akan dihapus dari database.
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            <button onClick={emptyAll}
              style={{ padding: "6px 14px", borderRadius: 7, border: "none", background: "var(--red)", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
              Ya, Hapus Semua
            </button>
            <button onClick={() => setShowConfirm(false)}
              style={{ padding: "6px 12px", borderRadius: 7, border: "1px solid var(--border)", background: "transparent", color: "var(--text-secondary)", fontSize: 12, cursor: "pointer" }}>
              Batal
            </button>
          </div>
        </div>
      )}

      {/* Info banner */}
      <div style={{
        background: "var(--orange-subtle)", border: "1px solid var(--orange)",
        borderRadius: 10, padding: "10px 14px",
        display: "flex", gap: 8, alignItems: "center",
      }}>
        <Flag size={13} style={{ color: "var(--orange)", flexShrink: 0 }} />
        <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0 }}>
          Komentar ditandai sebagai spam secara <strong>otomatis</strong> oleh sistem filter kata kunci &amp; IP reputation, atau <strong>manual</strong> oleh moderator.
        </p>
      </div>

      {/* Spam list */}
      {spams.length === 0 ? (
        <div style={{
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: 12, padding: "48px 24px", textAlign: "center",
        }}>
          <Flag size={36} style={{ color: "var(--green)", margin: "0 auto 12px" }} />
          <p style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 4px" }}>Folder Spam Kosong</p>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0 }}>Tidak ada komentar spam yang perlu ditangani.</p>
        </div>
      ) : (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
          {/* Header row */}
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 140px 100px 90px",
            gap: 12, padding: "10px 16px",
            background: "var(--bg-subtle)", borderBottom: "1px solid var(--border)",
          }}>
            {["Komentar Spam", "Terdeteksi", "Sumber", "Aksi"].map(h => (
              <span key={h} style={{ fontSize: 11, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</span>
            ))}
          </div>

          {spams.map((s, i) => (
            <div key={s.id} style={{
              display: "grid", gridTemplateColumns: "1fr 140px 100px 90px",
              gap: 12, padding: "13px 16px", alignItems: "start",
              borderBottom: i < spams.length - 1 ? "1px solid var(--border)" : "none",
            }}>
              {/* Comment */}
              <div>
                <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap", marginBottom: 5 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <User size={11} style={{ color: "var(--text-tertiary)" }} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)" }}>{s.author}</span>
                  </div>
                  <span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>{s.email}</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, color: "var(--text-tertiary)" }}>
                    <Globe size={9} /> {s.ip}
                  </span>
                </div>
                <p style={{
                  fontSize: 13, color: "var(--text-secondary)", margin: "0 0 6px",
                  lineHeight: 1.5, fontStyle: "italic",
                  background: "var(--bg-subtle)", padding: "8px 10px", borderRadius: 6,
                  borderLeft: "3px solid var(--red)",
                }}>
                  "{s.content}"
                </p>
                <span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>Artikel: {s.article}</span>
              </div>

              {/* Time */}
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <Clock size={11} style={{ color: "var(--text-tertiary)" }} />
                <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{s.time}</span>
              </div>

              {/* Source */}
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                fontSize: 10, fontWeight: 700, padding: "3px 7px", borderRadius: 20,
                background: s.auto ? "var(--blue-subtle)" : "var(--orange-subtle)",
                color: s.auto ? "var(--blue)" : "var(--orange)",
              }}>
                {s.auto ? "Auto Filter" : "Manual"}
              </span>

              {/* Actions */}
              <div style={{ display: "flex", gap: 5 }}>
                <button
                  onClick={() => removeOne(s.id)}
                  style={{
                    padding: "5px 8px", borderRadius: 6, border: "1px solid var(--border)",
                    background: "var(--bg-subtle)", color: "var(--red)",
                    fontSize: 11, cursor: "pointer",
                  }}
                  title="Hapus permanen"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

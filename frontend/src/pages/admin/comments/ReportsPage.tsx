import React, { useState } from "react";
import { Flag, CheckCircle, Trash2, User, Clock, MessageSquare, ChevronDown, AlertOctagon } from "lucide-react";

type ReportReason = "Pelecehan" | "SARA" | "Ujaran Kebencian" | "Hoaks" | "Lainnya";

const MOCK_REPORTS = [
  { id: "1", comment: "Bangsat si Anies, pengkhianat rakyat! Sudah jelas-jelas gagal masih mau nyapres lagi!", commentAuthor: "anon_user_4821", reportReason: "Ujaran Kebencian" as ReportReason, reporters: 7, article: "Debat Calon Presiden 2026: Masing-masing Paparkan Visi Misi", time: "1 jam lalu" },
  { id: "2", comment: "Ini bohong semua! Ada agenda terselubung di balik berita ini. Penyebaran hoaks!", commentAuthor: "truth_seeker_99", reportReason: "Hoaks" as ReportReason, reporters: 3, article: "Pemerintah Resmikan Program Subsidi Sembako Baru", time: "2 jam lalu" },
  { id: "3", comment: "Orang-orang [suku tertentu] memang begitu. Sudah dari sononya tidak bisa dipercaya.", commentAuthor: "user_5524", reportReason: "SARA" as ReportReason, reporters: 12, article: "Konflik Lahan di Perbatasan Kabupaten Sampang", time: "3 jam lalu" },
  { id: "4", comment: "Cek fotonya! Ini pakai filter digital, bukan foto asli banjir. Redaksi bohong!", commentAuthor: "fact_checker_88", reportReason: "Hoaks" as ReportReason, reporters: 2, article: "Banjir Besar Landa Sampang, Ratusan Warga Mengungsi", time: "4 jam lalu" },
];

const REASON_COLORS: Record<ReportReason, string> = {
  "Pelecehan": "var(--red)",
  "SARA": "var(--purple)",
  "Ujaran Kebencian": "var(--orange)",
  "Hoaks": "var(--yellow)",
  "Lainnya": "var(--text-tertiary)",
};

export default function CommentReportsPage() {
  const [reports, setReports] = useState(MOCK_REPORTS);

  const dismiss = (id: string) => setReports(p => p.filter(r => r.id !== id));
  const execute = (id: string) => setReports(p => p.filter(r => r.id !== id));

  return (
    <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 20 }} className="animate-fade-in">
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", margin: 0, letterSpacing: -0.5 }}>
          Flagged Comments &amp; Community Reports Log
        </h1>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "4px 0 0" }}>
          {reports.length} laporan dari komunitas pembaca menunggu penanganan
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        {(["Ujaran Kebencian", "SARA", "Hoaks", "Pelecehan"] as ReportReason[]).map(r => (
          <div key={r} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
              <AlertOctagon size={12} style={{ color: REASON_COLORS[r] }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.04em" }}>{r}</span>
            </div>
            <p style={{ fontSize: 22, fontWeight: 700, color: REASON_COLORS[r], margin: 0 }}>
              {reports.filter(rep => rep.reportReason === r).length}
            </p>
          </div>
        ))}
      </div>

      {/* Reports table */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
        {/* Table header */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 140px 90px 100px",
          gap: 12, padding: "10px 16px",
          background: "var(--bg-subtle)", borderBottom: "1px solid var(--border)",
        }}>
          {["Komentar Terlaporkan", "Alasan Laporan", "Pelapor", "Aksi Penanganan"].map(h => (
            <span key={h} style={{ fontSize: 11, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</span>
          ))}
        </div>

        {reports.length === 0 ? (
          <div style={{ padding: "40px 24px", textAlign: "center" }}>
            <CheckCircle size={32} style={{ color: "var(--green)", margin: "0 auto 10px" }} />
            <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 4px" }}>Semua Laporan Sudah Ditangani</p>
            <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0 }}>Tidak ada laporan komunitas yang perlu ditindaklanjuti.</p>
          </div>
        ) : reports.map((rep, i) => (
          <div key={rep.id} style={{
            display: "grid", gridTemplateColumns: "1fr 140px 90px 100px",
            gap: 12, padding: "14px 16px", alignItems: "start",
            borderBottom: i < reports.length - 1 ? "1px solid var(--border)" : "none",
          }}>
            {/* Comment */}
            <div>
              <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 6 }}>
                <User size={11} style={{ color: "var(--text-tertiary)" }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)" }}>{rep.commentAuthor}</span>
                <Clock size={10} style={{ color: "var(--text-tertiary)" }} />
                <span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>{rep.time}</span>
              </div>
              <div style={{
                fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5,
                background: "var(--bg-subtle)", padding: "8px 10px", borderRadius: 6,
                borderLeft: `3px solid ${REASON_COLORS[rep.reportReason]}`,
                marginBottom: 6, fontStyle: "italic",
              }}>
                "{rep.comment}"
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <MessageSquare size={10} style={{ color: "var(--text-tertiary)" }} />
                <span style={{ fontSize: 11, color: "var(--brand)" }}>{rep.article}</span>
              </div>
            </div>

            {/* Reason */}
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              fontSize: 11, fontWeight: 700, padding: "4px 9px", borderRadius: 20,
              background: `${REASON_COLORS[rep.reportReason]}18`,
              color: REASON_COLORS[rep.reportReason],
            }}>
              <Flag size={10} /> {rep.reportReason}
            </span>

            {/* Reporter count */}
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ display: "flex" }}>
                {Array.from({ length: Math.min(rep.reporters, 4) }).map((_, j) => (
                  <div key={j} style={{
                    width: 20, height: 20, borderRadius: "50%",
                    background: `hsl(${j * 60 + 200}, 60%, 55%)`,
                    border: "2px solid var(--surface)",
                    marginLeft: j > 0 ? -7 : 0,
                  }} />
                ))}
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)" }}>
                {rep.reporters}
              </span>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <button
                onClick={() => dismiss(rep.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 4, padding: "5px 9px",
                  borderRadius: 6, border: "1px solid var(--green)",
                  background: "var(--green-subtle)", color: "var(--green)",
                  fontSize: 11, fontWeight: 600, cursor: "pointer",
                }}
              >
                <CheckCircle size={10} /> Abaikan
              </button>
              <button
                onClick={() => execute(rep.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 4, padding: "5px 9px",
                  borderRadius: 6, border: "1px solid var(--red)",
                  background: "var(--red-subtle)", color: "var(--red)",
                  fontSize: 11, fontWeight: 600, cursor: "pointer",
                }}
              >
                <Trash2 size={10} /> Hapus & Blokir
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

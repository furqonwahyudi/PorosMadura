import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "../../../lib/adminApi";
import { FileText, Search, Download, ExternalLink, Trash2, FileSpreadsheet, File } from "lucide-react";

const TYPE_CONFIG: Record<string, { color: string; icon: React.ReactNode }> = {
  PDF: { color: "var(--red)", icon: <File size={14} style={{ color: "var(--red)" }} /> },
  XLSX: { color: "var(--green)", icon: <FileSpreadsheet size={14} style={{ color: "var(--green)" }} /> },
  DOCX: { color: "var(--blue)", icon: <FileText size={14} style={{ color: "var(--blue)" }} /> },
  DOC: { color: "var(--blue)", icon: <FileText size={14} style={{ color: "var(--blue)" }} /> },
  DEFAULT: { color: "var(--orange)", icon: <FileText size={14} style={{ color: "var(--orange)" }} /> },
};

export default function DocumentsPage() {
  const [search, setSearch] = useState("");

  const { data: mediaFiles = [] } = useQuery<any[]>({
    queryKey: ["admin", "media", "list"],
    queryFn: async () => {
      const res = await adminApi.get<{ success: boolean; data: any[] }>("/api/media");
      return res.data
        .filter(item => !item.mimeType?.startsWith("image/") && !item.mimeType?.startsWith("video/"))
        .map(item => {
          const ext = item.name.split(".").pop()?.toUpperCase() || "PDF";
          return {
            id: item.id,
            name: item.name,
            type: ext,
            size: (item.size / 1024).toFixed(1) + " KB",
            articles: ["Rilis Resmi"],
            downloads: 0,
            date: new Date(item.uploadedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
            uploader: "Super Admin",
          };
        });
    }
  });

  const filtered = mediaFiles.filter(d =>
    !search || d.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 20 }} className="animate-fade-in">
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", margin: 0, letterSpacing: -0.5 }}>
            Document Attachments &amp; Press Release Repositories
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "4px 0 0" }}>
            {mediaFiles.length} dokumen tersimpan — PDF, DOC, DOCX, XLS, XLSX
          </p>
        </div>
        <button style={{
          display: "flex", alignItems: "center", gap: 7, padding: "8px 16px",
          background: "var(--brand)", border: "none", borderRadius: 8,
          cursor: "pointer", color: "#fff", fontSize: 13, fontWeight: 600,
        }}>
          <FileText size={15} /> Upload Dokumen
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        {[
          { label: "Total Dokumen", val: mediaFiles.length.toString(), sub: "Berkas lampiran aktif" },
          { label: "Total Download", val: "840", sub: "Kumulatif semua dokumen" },
          { label: "Ukuran Total", val: "3.0 MB", sub: "Dioptimasi secara otomatis" },
        ].map(s => (
          <div key={s.label} style={{
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: 10, padding: "14px 16px",
          }}>
            <p style={{ fontSize: 11, color: "var(--text-tertiary)", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: 600 }}>{s.label}</p>
            <p style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 2px" }}>{s.val}</p>
            <p style={{ fontSize: 11, color: "var(--text-tertiary)", margin: 0 }}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div style={{ position: "relative", maxWidth: 380 }}>
        <Search size={13} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)" }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari nama dokumen..."
          style={{ width: "100%", padding: "8px 10px 8px 32px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 13, color: "var(--text-primary)", outline: "none" }}
        />
      </div>

      {/* Table */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
        {/* Header */}
        <div style={{
          display: "grid", gridTemplateColumns: "2fr 80px 80px 1fr 90px 100px",
          gap: 12, padding: "10px 16px",
          background: "var(--bg-subtle)", borderBottom: "1px solid var(--border)",
        }}>
          {["Nama Dokumen", "Tipe", "Ukuran", "Artikel Terkait", "Download", "Aksi"].map(h => (
            <span key={h} style={{ fontSize: 11, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</span>
          ))}
        </div>

        {filtered.map((doc, i) => {
          const tc = TYPE_CONFIG[doc.type] || TYPE_CONFIG.PDF;
          return (
            <div key={doc.id} style={{
              display: "grid", gridTemplateColumns: "2fr 80px 80px 1fr 90px 100px",
              gap: 12, padding: "13px 16px", alignItems: "center",
              borderBottom: i < filtered.length - 1 ? "1px solid var(--border)" : "none",
            }}>
              {/* Name */}
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 8,
                  background: `${tc.color}18`,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  {tc.icon}
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 200 }}>{doc.name}</p>
                  <p style={{ fontSize: 11, color: "var(--text-tertiary)", margin: 0 }}>{doc.date} · {doc.uploader}</p>
                </div>
              </div>

              {/* Type */}
              <span style={{
                display: "inline-block", fontSize: 11, fontWeight: 700, padding: "3px 7px",
                borderRadius: 6, background: `${tc.color}18`, color: tc.color,
              }}>{doc.type}</span>

              <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{doc.size}</span>

              {/* Articles */}
              <div>
                {doc.articles.map(a => (
                  <div key={a} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <ExternalLink size={10} style={{ color: "var(--text-tertiary)", flexShrink: 0 }} />
                    <span style={{ fontSize: 11, color: "var(--brand)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a}</span>
                  </div>
                ))}
              </div>

              {/* Downloads */}
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <Download size={12} style={{ color: "var(--text-tertiary)" }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{doc.downloads.toLocaleString()}</span>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: 5 }}>
                <button style={{
                  display: "flex", alignItems: "center", gap: 4, padding: "5px 9px",
                  borderRadius: 6, border: "1px solid var(--border)",
                  background: "var(--bg-subtle)", color: "var(--text-secondary)",
                  fontSize: 11, cursor: "pointer",
                }}>
                  <Download size={11} /> Unduh
                </button>
                <button style={{
                  padding: "5px 8px", borderRadius: 6, border: "1px solid var(--border)",
                  background: "var(--bg-subtle)", color: "var(--red)", cursor: "pointer",
                }}>
                  <Trash2 size={11} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

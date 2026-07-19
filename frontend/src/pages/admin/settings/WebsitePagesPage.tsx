import React, { useState } from "react";
import { BookOpen, FileText, Edit2, Eye, Circle, HelpCircle } from "lucide-react";

export default function WebsitePagesPage() {
  const [pages, setPages] = useState([
    { id: 1, name: "Tentang Kami", slug: "/pages/about", status: "Published", mandatory: true },
    { id: 2, name: "Susunan Redaksi & Struktur Organisasi", slug: "/pages/editorial-board", status: "Published", mandatory: true },
    { id: 3, name: "Pedoman Pemberitaan Media Siber", slug: "/pages/cyber-media-guidelines", status: "Published", mandatory: true },
    { id: 4, name: "Kebijakan Privasi (Privacy Policy)", slug: "/pages/privacy-policy", status: "Published", mandatory: true },
    { id: 5, name: "Info Kontak Pengaduan Sengketa", slug: "/pages/dispute-contact", status: "Published", mandatory: true },
    { id: 6, name: "Karir / Lowongan Kerja", slug: "/pages/careers", status: "Draft", mandatory: false },
  ]);

  return (
    <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 20 }} className="animate-fade-in">
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", margin: 0, letterSpacing: -0.5 }}>
          Core Static Pages Manager (Legal &amp; Press Disclosures)
        </h1>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "4px 0 0" }}>
          Kelola halaman editorial statis wajib standar Dewan Pers Indonesia dan halaman legalitas hukum lainnya
        </p>
      </div>

      {/* Mandatory alert block */}
      <div style={{
        background: "var(--brand-subtle)", border: "1px solid var(--brand)",
        borderRadius: 10, padding: 14, display: "flex", gap: 10, alignItems: "flex-start"
      }}>
        <HelpCircle size={16} style={{ color: "var(--brand)", flexShrink: 0, marginTop: 2 }} />
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: "var(--brand)", margin: "0 0 2px" }}>Standar Verifikasi Dewan Pers</p>
          <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0 }}>
            Sebagai media pers resmi, halaman <strong style={{ color: "var(--text-primary)" }}>Pedoman Pemberitaan Media Siber</strong> dan <strong style={{ color: "var(--text-primary)" }}>Susunan Redaksi</strong> wajib dalam keadaan terbit dan mudah diakses oleh pembaca umum.
          </p>
        </div>
      </div>

      {/* Pages table grid */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
        {/* Table header */}
        <div style={{
          display: "grid", gridTemplateColumns: "2fr 1.5fr 120px 100px 100px",
          gap: 12, padding: "10px 16px",
          background: "var(--bg-subtle)", borderBottom: "1px solid var(--border)",
        }}>
          {["Nama Halaman", "URL Slug", "Status", "Kategori", "Aksi"].map(h => (
            <span key={h} style={{ fontSize: 11, fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</span>
          ))}
        </div>

        {pages.map((p, i) => (
          <div key={p.id} style={{
            display: "grid", gridTemplateColumns: "2fr 1.5fr 120px 100px 100px",
            gap: 12, padding: "14px 16px", alignItems: "center",
            borderBottom: i < pages.length - 1 ? "1px solid var(--border)" : "none",
          }}>
            {/* Page name */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <FileText size={15} style={{ color: "var(--text-tertiary)" }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{p.name}</span>
            </div>

            {/* Slug */}
            <span style={{ fontSize: 12, fontFamily: "monospace", color: "var(--text-secondary)" }}>{p.slug}</span>

            {/* Status */}
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 20,
              background: p.status === "Published" ? "var(--green-subtle)" : "var(--bg-muted)",
              color: p.status === "Published" ? "var(--green)" : "var(--text-secondary)",
            }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: "currentColor" }} />
              {p.status}
            </span>

            {/* Category Mandatory badge */}
            <div>
              {p.mandatory ? (
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: "3px 7px", borderRadius: 6,
                  background: "var(--brand-subtle)", color: "var(--brand)"
                }}>Dewan Pers</span>
              ) : (
                <span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>Statis</span>
              )}
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 5 }}>
              <button style={{ padding: "5px 8px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--bg-subtle)", color: "var(--text-secondary)", cursor: "pointer" }}>
                <Edit2 size={12} />
              </button>
              <button style={{ padding: "5px 8px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--bg-subtle)", color: "var(--text-tertiary)", cursor: "pointer" }}>
                <Eye size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

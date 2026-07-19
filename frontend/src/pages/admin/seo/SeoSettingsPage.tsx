import React, { useState } from "react";
import { Settings, Save, CheckCircle, Eye } from "lucide-react";

export default function SeoSettingsPage() {
  const [activeTab, setActiveTab] = useState("homepage");
  const [canonical, setCanonical] = useState(true);
  const [saved, setSaved] = useState(false);

  // Tab values
  const [homeTitle, setHomeTitle] = useState("Poros Madura - Portal Berita Madura Terkini & Terpercaya");
  const [homeDesc, setHomeDesc] = useState("Portal berita resmi menyajikan informasi berita terkini seputar Bangkalan, Sampang, Pamekasan, Sumenep, dan wilayah Madura Jawa Timur.");
  const [titleToken, setTitleToken] = useState("%title% | %category% | %sitename%");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 20 }} className="animate-fade-in">
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", margin: 0, letterSpacing: -0.5 }}>
          SEO Global Core Foundations
        </h1>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "4px 0 0" }}>
          Konfigurasi otomatisasi meta tag judul, deskripsi, tautan kanonikal global, dan Open Graph default
        </p>
      </div>

      {saved && (
        <div style={{
          background: "var(--green-subtle)", border: "1px solid var(--green)",
          borderRadius: 8, padding: "10px 12px", display: "flex", gap: 8, alignItems: "center",
          maxWidth: 600
        }}>
          <CheckCircle size={15} style={{ color: "var(--green)" }} />
          <span style={{ fontSize: 12, color: "var(--text-primary)" }}>Skema metadata SEO berhasil disimpan.</span>
        </div>
      )}

      {/* Main Tabbed Config Form */}
      <form onSubmit={handleSave} style={{
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: 12, overflow: "hidden", maxWidth: 600
      }}>
        {/* Horizontal tabs */}
        <div style={{
          display: "flex", background: "var(--bg-subtle)", borderBottom: "1px solid var(--border)",
        }}>
          {[
            { id: "homepage", label: "Homepage Meta" },
            { id: "tokens", label: "Global Title Formulations" },
            { id: "technical", label: "Technical SEO & OG" },
          ].map(t => (
            <button
              type="button" key={t.id} onClick={() => setActiveTab(t.id)}
              style={{
                flex: 1, padding: "12px 0", border: "none", cursor: "pointer",
                background: activeTab === t.id ? "var(--surface)" : "transparent",
                color: activeTab === t.id ? "var(--brand)" : "var(--text-secondary)",
                fontWeight: 600, fontSize: 12, borderBottom: activeTab === t.id ? "2px solid var(--brand)" : "none"
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab contents */}
        <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
          
          {activeTab === "homepage" && (
            <>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>
                  Homepage Meta Title *
                </label>
                <input
                  type="text" value={homeTitle} onChange={e => setHomeTitle(e.target.value)}
                  style={{
                    width: "100%", padding: "8px 12px", background: "var(--bg-subtle)",
                    border: "1px solid var(--border)", borderRadius: 8, fontSize: 13,
                    color: "var(--text-primary)", outline: "none", boxSizing: "border-box"
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>
                  Homepage Meta Description *
                </label>
                <textarea
                  value={homeDesc} onChange={e => setHomeDesc(e.target.value)}
                  rows={4}
                  style={{
                    width: "100%", padding: "8px 12px", background: "var(--bg-subtle)",
                    border: "1px solid var(--border)", borderRadius: 8, fontSize: 12,
                    color: "var(--text-primary)", outline: "none", boxSizing: "border-box",
                    resize: "none"
                  }}
                  required
                />
              </div>
            </>
          )}

          {activeTab === "tokens" && (
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>
                Global Title Formulations Token Pattern *
              </label>
              <input
                type="text" value={titleToken} onChange={e => setTitleToken(e.target.value)}
                style={{
                  width: "100%", padding: "8px 12px", background: "var(--bg-subtle)",
                  border: "1px solid var(--border)", borderRadius: 8, fontSize: 13,
                  color: "var(--text-primary)", outline: "none", boxSizing: "border-box"
                }}
                required
              />
              <p style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 6, lineHeight: 1.4 }}>
                Gunakan token pengganti: <strong style={{ color: "var(--text-primary)" }}>%title%</strong> (Judul artikel), <strong style={{ color: "var(--text-primary)" }}>%category%</strong> (Kategori utama), <strong style={{ color: "var(--text-primary)" }}>%sitename%</strong> (Nama website).
              </p>
            </div>
          )}

          {activeTab === "technical" && (
            <>
              {/* Enforce canonical links */}
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  onClick={() => setCanonical(v => !v)}
                  style={{
                    width: 44, height: 24, borderRadius: 99, flexShrink: 0,
                    background: canonical ? "var(--brand)" : "var(--bg-muted)",
                    position: "relative", transition: "background 0.2s", cursor: "pointer",
                  }}
                >
                  <div style={{
                    position: "absolute", top: 4, left: canonical ? 23 : 4,
                    width: 16, height: 16, borderRadius: "50%",
                    background: "#fff", transition: "left 0.2s",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.25)"
                  }} />
                </div>
                <div>
                  <span style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 600 }}>Enforce Global Canonical Links</span>
                  <p style={{ fontSize: 11, color: "var(--text-secondary)", margin: 0 }}>
                    Tambahkan tag rel="canonical" otomatis untuk menghindari isu duplikasi konten.
                  </p>
                </div>
              </div>

              {/* Open Graph entity */}
              <div style={{ borderTop: "1px solid var(--border)", paddingTop: 14 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>
                  Default Open Graph Entity Type
                </label>
                <select
                  style={{
                    width: "100%", padding: "8px 12px", background: "var(--bg-subtle)",
                    border: "1px solid var(--border)", borderRadius: 8, fontSize: 13,
                    color: "var(--text-primary)", outline: "none", boxSizing: "border-box"
                  }}
                >
                  <option value="website">website</option>
                  <option value="article">article</option>
                  <option value="news">news</option>
                </select>
              </div>
            </>
          )}

          {/* Submit */}
          <button type="submit" style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
            padding: "9px 0", background: "var(--brand)", border: "none", borderRadius: 8,
            cursor: "pointer", color: "#fff", fontSize: 13, fontWeight: 600, marginTop: 10
          }}>
            <Save size={14} /> Simpan Skema SEO
          </button>

        </div>
      </form>
    </div>
  );
}

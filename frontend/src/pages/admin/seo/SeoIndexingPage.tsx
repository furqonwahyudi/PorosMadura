import React, { useState } from "react";
import { Globe, FileCode, Upload, Save, CheckCircle, RefreshCw } from "lucide-react";

export default function SeoIndexingPage() {
  const [robotsTxt, setRobotsTxt] = useState(
    "User-agent: *\n" +
    "Allow: /\n" +
    "Disallow: /admin/\n" +
    "Disallow: /api/\n\n" +
    "Sitemap: https://porosmadura.com/sitemap.xml\n" +
    "Sitemap: https://porosmadura.com/news-sitemap.xml"
  );
  const [loadingSitemap, setLoadingSitemap] = useState(false);
  const [sitemapSuccess, setSitemapSuccess] = useState(false);
  const [savedRobots, setSavedRobots] = useState(false);

  const handleSaveRobots = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedRobots(true);
    setTimeout(() => setSavedRobots(false), 2000);
  };

  const handleGenerateSitemap = () => {
    setLoadingSitemap(true);
    setSitemapSuccess(false);
    setTimeout(() => {
      setLoadingSitemap(false);
      setSitemapSuccess(true);
    }, 1500);
  };

  return (
    <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 20 }} className="animate-fade-in">
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", margin: 0, letterSpacing: -0.5 }}>
          Search Engine Crawl Control &amp; Automated Sitemaps
        </h1>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "4px 0 0" }}>
          Kelola peta situs sitemap XML (termasuk sitemap khusus Google News), konfigurasi robots.txt, dan API instan Google Indexing
        </p>
      </div>

      <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
        
        {/* Left: Sitemap & Google Indexing */}
        <div style={{ flex: 1, minWidth: 320, display: "flex", flexDirection: "column", gap: 16 }}>
          
          {/* Dual-Engine XML Sitemap */}
          <div style={{
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: 12, padding: 20, display: "flex", flexDirection: "column", gap: 12
          }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", margin: 0, display: "flex", alignItems: "center", gap: 6 }}>
              <Globe size={15} style={{ color: "var(--brand)" }} /> Dual-Engine XML Sitemap Automator Generator
            </h2>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0 }}>
              Sitemap dibuat dan diperbarui otomatis setiap kali artikel tayang.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
              <div style={{ padding: "10px 12px", background: "var(--bg-subtle)", borderRadius: 8, border: "1px solid var(--border)" }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>Standard XML Sitemap</span>
                <p style={{ fontSize: 11, color: "var(--text-secondary)", margin: "2px 0 0" }}>Untuk halaman statis, kategori, dan arsip: <strong style={{ color: "var(--brand)" }}>/sitemap.xml</strong></p>
              </div>
              <div style={{ padding: "10px 12px", background: "var(--bg-subtle)", borderRadius: 8, border: "1px solid var(--border)" }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>Google News Specialized Sitemap</span>
                <p style={{ fontSize: 11, color: "var(--text-secondary)", margin: "2px 0 0" }}>Artikel dalam 48 jam terakhir dengan standar tag XML Google News: <strong style={{ color: "var(--brand)" }}>/news-sitemap.xml</strong></p>
              </div>
            </div>

            <button
              onClick={handleGenerateSitemap} disabled={loadingSitemap}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                padding: "8px 0", borderRadius: 8, border: "none", background: "var(--brand)",
                color: "#fff", fontSize: 12, fontWeight: 600, cursor: loadingSitemap ? "not-allowed" : "pointer",
                opacity: loadingSitemap ? 0.7 : 1
              }}
            >
              {loadingSitemap ? "Rebuilding Sitemaps..." : "Rebuild Sitemaps Sekarang"}
            </button>
            {sitemapSuccess && <span style={{ fontSize: 11, color: "var(--green)", textAlign: "center" }}>Sitemaps sukses diregenerasi!</span>}
          </div>

          {/* Google Indexing API Setup */}
          <div style={{
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: 12, padding: 20, display: "flex", flexDirection: "column", gap: 12
          }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", margin: 0, display: "flex", alignItems: "center", gap: 6 }}>
              <Globe size={15} style={{ color: "var(--brand)" }} /> Google Indexing API Setup
            </h2>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0 }}>
              Sinyal API ping instan ke server Google agar berita terindeks otomatis dalam beberapa detik.
            </p>

            <div style={{
              border: "2px dashed var(--border)", borderRadius: 8, padding: "20px 14px",
              textAlign: "center", background: "var(--bg-subtle)"
            }}>
              <Upload size={24} style={{ color: "var(--text-tertiary)", margin: "0 auto 8px" }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", display: "block" }}>Unggah JSON Kredensial Kunci</span>
              <p style={{ fontSize: 11, color: "var(--text-tertiary)", margin: "2px 0 0" }}>Google Service Account Key File</p>
            </div>
          </div>

        </div>

        {/* Right: Robots.txt Terminal Panel */}
        <form onSubmit={handleSaveRobots} style={{
          flex: 1, minWidth: 320, background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: 12, padding: 20, display: "flex", flexDirection: "column", gap: 14
        }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", margin: 0, display: "flex", alignItems: "center", gap: 6 }}>
            <FileCode size={15} style={{ color: "var(--brand)" }} /> Robots.txt Terminal Panel
          </h2>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0 }}>
            Tentukan direktif perayapan mesin pencari dengan mengedit isi robots.txt di bawah.
          </p>

          <textarea
            value={robotsTxt} onChange={e => setRobotsTxt(e.target.value)}
            rows={8}
            style={{
              width: "100%", padding: "10px 12px", background: "var(--bg-subtle)",
              border: "1px solid var(--border)", borderRadius: 8, fontSize: 12,
              fontFamily: "monospace", color: "var(--text-primary)", outline: "none",
              boxSizing: "border-box", resize: "none", lineHeight: 1.5
            }}
            required
          />

          <button type="submit" style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            padding: "9px 0", background: "var(--brand)", border: "none", borderRadius: 8,
            cursor: "pointer", color: "#fff", fontSize: 13, fontWeight: 600
          }}>
            <Save size={14} /> Simpan Robots.txt
          </button>
          {savedRobots && <span style={{ fontSize: 11, color: "var(--green)", textAlign: "center" }}>Robots.txt berhasil disimpan.</span>}
        </form>

      </div>
    </div>
  );
}

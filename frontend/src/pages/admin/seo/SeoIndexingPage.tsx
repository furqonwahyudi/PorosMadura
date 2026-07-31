import React, { useState, useEffect } from "react";
import { Globe, FileCode, Upload, Save, CheckCircle, RefreshCw } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../../../lib/adminApi";
import { useDialog } from "../../../context/DialogContext";

export default function SeoIndexingPage() {
  const { showToast } = useDialog();
  const queryClient = useQueryClient();

  const [robotsTxt, setRobotsTxt] = useState("");

  // Load SEO settings (to get robotsTxt and siteUrl)
  const { data: seoData, isLoading } = useQuery({
    queryKey: ["admin", "seo", "settings"],
    queryFn: async () => {
      const res = await adminApi.get<{ success: boolean; data: any }>("/api/seo/settings");
      return res.data;
    }
  });

  // Populate robotsTxt state when data loaded
  useEffect(() => {
    if (seoData) {
      setRobotsTxt(seoData.robotsTxt || "");
    }
  }, [seoData]);

  // Save robots.txt mutation
  const saveRobotsMutation = useMutation({
    mutationFn: async (newRobotsTxt: string) => {
      // Kita update robotsTxt dengan mengirimkannya ke endpoint update settings
      return adminApi.put("/api/seo/settings", {
        ...seoData,
        robotsTxt: newRobotsTxt
      });
    },
    onSuccess: () => {
      showToast("Robots.txt berhasil disimpan secara dinamis!", "success");
      queryClient.invalidateQueries({ queryKey: ["admin", "seo", "settings"] });
    },
    onError: (err: any) => {
      showToast(err.message || "Gagal menyimpan robots.txt.", "error");
    }
  });

  // Rebuild sitemap mutation
  const rebuildSitemapMutation = useMutation({
    mutationFn: async () => {
      return adminApi.post<{ success: boolean; message: string }>("/api/seo/sitemap/rebuild", {});
    },
    onSuccess: (res) => {
      showToast(res.message || "Sitemaps sukses diregenerasi secara dinamis!", "success");
    },
    onError: (err: any) => {
      showToast(err.message || "Gagal membangun ulang sitemaps.", "error");
    }
  });

  const handleSaveRobots = (e: React.FormEvent) => {
    e.preventDefault();
    saveRobotsMutation.mutate(robotsTxt);
  };

  const handleGenerateSitemap = () => {
    rebuildSitemapMutation.mutate();
  };

  if (isLoading) {
    return (
      <div style={{ padding: "24px", display: "flex", justifyContent: "center", alignItems: "center", minHeight: "200px" }}>
        <RefreshCw className="animate-spin text-slate-400" size={24} />
      </div>
    );
  }

  const siteUrl = seoData?.siteUrl || "https://youdie.my.id";

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
                <p style={{ fontSize: 11, color: "var(--text-secondary)", margin: "2px 0 0" }}>Untuk halaman statis, kategori, dan arsip: <a href={`${siteUrl}/sitemap.xml`} target="_blank" rel="noreferrer" style={{ color: "var(--brand)", fontWeight: 600 }}>/sitemap.xml</a></p>
              </div>
              <div style={{ padding: "10px 12px", background: "var(--bg-subtle)", borderRadius: 8, border: "1px solid var(--border)" }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>Google News Specialized Sitemap</span>
                <p style={{ fontSize: 11, color: "var(--text-secondary)", margin: "2px 0 0" }}>Artikel dalam 48 jam terakhir dengan standar tag XML Google News: <a href={`${siteUrl}/news-sitemap.xml`} target="_blank" rel="noreferrer" style={{ color: "var(--brand)", fontWeight: 600 }}>/news-sitemap.xml</a></p>
              </div>
            </div>

            <button
              onClick={handleGenerateSitemap} disabled={rebuildSitemapMutation.isPending}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                padding: "8px 0", borderRadius: 8, border: "none", background: "var(--brand)",
                color: "#fff", fontSize: 12, fontWeight: 600, cursor: rebuildSitemapMutation.isPending ? "not-allowed" : "pointer",
                opacity: rebuildSitemapMutation.isPending ? 0.7 : 1
              }}
            >
              {rebuildSitemapMutation.isPending ? "Rebuilding Sitemaps..." : "Rebuild Sitemaps Sekarang"}
            </button>
            {rebuildSitemapMutation.isSuccess && <span style={{ fontSize: 11, color: "var(--green)", textAlign: "center" }}>Sitemaps sukses diregenerasi!</span>}
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

          <button type="submit" disabled={saveRobotsMutation.isPending} style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            padding: "9px 0", background: "var(--brand)", border: "none", borderRadius: 8,
            cursor: saveRobotsMutation.isPending ? "not-allowed" : "pointer", color: "#fff", fontSize: 13, fontWeight: 600,
            opacity: saveRobotsMutation.isPending ? 0.7 : 1
          }}>
            <Save size={14} /> {saveRobotsMutation.isPending ? "Menyimpan..." : "Simpan Robots.txt"}
          </button>
          {saveRobotsMutation.isSuccess && <span style={{ fontSize: 11, color: "var(--green)", textAlign: "center" }}>Robots.txt berhasil disimpan.</span>}
        </form>

      </div>
    </div>
  );
}

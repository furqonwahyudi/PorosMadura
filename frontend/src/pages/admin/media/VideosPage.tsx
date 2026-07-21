import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "../../../lib/adminApi";
import { Video, Play, ExternalLink, Link2, Youtube, Search, Eye } from "lucide-react";

type Strategy = "self-hosted" | "external";

export default function VideosPage() {
  const [search, setSearch] = useState("");
  const [selectedVideo, setSelectedVideo] = useState<any | null>(null);
  const [editStrategy, setEditStrategy] = useState<Strategy>("self-hosted");
  const [externalUrl, setExternalUrl] = useState("");
  const [hls, setHls] = useState(true);

  const { data: mediaFiles = [] } = useQuery<any[]>({
    queryKey: ["admin", "media", "list"],
    queryFn: async () => {
      const res = await adminApi.get<{ success: boolean; data: any[] }>("/api/media");
      return res.data
        .filter(item => item.mimeType?.startsWith("video/"))
        .map(item => ({
          id: item.id,
          name: item.name,
          size: (item.size / 1024 / 1024).toFixed(2) + " MB",
          duration: "—",
          dimensions: item.width && item.height ? `${item.width}×${item.height}` : "—",
          date: new Date(item.uploadedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
          uploader: "Super Admin",
          strategy: "self-hosted" as Strategy,
          thumbnail: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=320&h=180&fit=crop"
        }));
    }
  });

  const filtered = mediaFiles.filter(v => !search || v.name.toLowerCase().includes(search.toLowerCase()));

  const openConfig = (v: any) => {
    setSelectedVideo(v);
    setEditStrategy(v.strategy);
    setExternalUrl(v.externalId ? `https://www.youtube.com/watch?v=${v.externalId}` : "");
  };

  return (
    <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 20 }} className="animate-fade-in">
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", margin: 0, letterSpacing: -0.5 }}>
          Video Asset Management &amp; Embed Streaming
        </h1>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "4px 0 0" }}>
          Kelola aset video dan konfigurasi strategi streaming
        </p>
      </div>

      {/* Search */}
      <div style={{ position: "relative", maxWidth: 380 }}>
        <Search size={13} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)" }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari video..."
          style={{ width: "100%", padding: "8px 10px 8px 32px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 13, color: "var(--text-primary)", outline: "none" }}
        />
      </div>

      {/* Video table */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
        {/* Header */}
        <div style={{
          display: "grid", gridTemplateColumns: "120px 1fr 80px 90px 110px 120px 100px",
          gap: 12, padding: "10px 16px",
          background: "var(--bg-subtle)", borderBottom: "1px solid var(--border)",
        }}>
          {["Preview", "Nama File", "Durasi", "Ukuran", "Dimensi", "Strategi", "Aksi"].map(h => (
            <span key={h} style={{ fontSize: 11, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</span>
          ))}
        </div>

        {filtered.map((v, i) => (
          <div key={v.id} style={{
            display: "grid", gridTemplateColumns: "120px 1fr 80px 90px 110px 120px 100px",
            gap: 12, padding: "12px 16px", alignItems: "center",
            borderBottom: i < filtered.length - 1 ? "1px solid var(--border)" : "none",
          }}>
            {/* Thumbnail */}
            <div style={{ position: "relative", width: 110, height: 62, borderRadius: 6, overflow: "hidden" }}>
              <img src={v.thumbnail} alt={v.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <div style={{
                position: "absolute", inset: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "rgba(0,0,0,0.35)",
              }}>
                <Play size={18} fill="#fff" style={{ color: "#fff" }} />
              </div>
              {v.strategy === "external" && (
                <div style={{
                  position: "absolute", top: 3, right: 3,
                  background: "#FF0000", borderRadius: 3, padding: "1px 5px",
                  fontSize: 9, fontWeight: 700, color: "#fff",
                }}>YT</div>
              )}
            </div>

            {/* Name */}
            <div>
              <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)", margin: 0 }}>{v.name}</p>
              <p style={{ fontSize: 11, color: "var(--text-tertiary)", margin: "2px 0 0" }}>Oleh: {v.uploader} · {v.date}</p>
            </div>

            <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{v.duration}</span>
            <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{v.size}</span>
            <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{v.dimensions}</span>

            {/* Strategy badge */}
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 20,
              background: v.strategy === "self-hosted" ? "var(--blue-subtle)" : "#FF000015",
              color: v.strategy === "self-hosted" ? "var(--blue)" : "#cc0000",
            }}>
              {v.strategy === "self-hosted" ? <Video size={10} /> : <Youtube size={10} />}
              {v.strategy === "self-hosted" ? "Self-Hosted" : "Eksternal"}
            </span>

            {/* Actions */}
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => openConfig(v)}
                style={{ display: "flex", alignItems: "center", gap: 4, padding: "5px 9px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--bg-subtle)", color: "var(--text-secondary)", fontSize: 11, cursor: "pointer" }}
              >
                <Link2 size={11} /> Config
              </button>
              <button
                style={{ padding: "5px 8px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--bg-subtle)", color: "var(--text-tertiary)", cursor: "pointer" }}
              >
                <Eye size={11} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Streaming Strategy Config Panel */}
      {selectedVideo && (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 14px", display: "flex", alignItems: "center", gap: 7 }}>
            <Link2 size={14} style={{ color: "var(--brand)" }} />
            Streaming Strategy: {selectedVideo.name}
          </h3>

          {/* Strategy selector */}
          <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
            {(["self-hosted", "external"] as Strategy[]).map(s => (
              <button
                key={s}
                onClick={() => setEditStrategy(s)}
                style={{
                  flex: 1, padding: "12px 14px", borderRadius: 10,
                  border: `2px solid ${editStrategy === s ? "var(--brand)" : "var(--border)"}`,
                  background: editStrategy === s ? "var(--brand-subtle)" : "var(--bg-subtle)",
                  cursor: "pointer", textAlign: "left",
                }}
              >
                <p style={{ fontSize: 13, fontWeight: 600, color: editStrategy === s ? "var(--brand)" : "var(--text-primary)", margin: "0 0 2px" }}>
                  {s === "self-hosted" ? "Self-Hosted / Object Storage" : "External Embed Service"}
                </p>
                <p style={{ fontSize: 11, color: "var(--text-secondary)", margin: 0 }}>
                  {s === "self-hosted" ? "Upload ke server sendiri / AWS S3 bucket, dengan dukungan HLS streaming" : "Embed dari YouTube, TikTok, Facebook Watch, atau Vimeo"}
                </p>
              </button>
            ))}
          </div>

          {editStrategy === "self-hosted" ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                <div
                  onClick={() => setHls(v => !v)}
                  style={{
                    width: 40, height: 22, borderRadius: 99,
                    background: hls ? "var(--brand)" : "var(--bg-muted)",
                    position: "relative", transition: "background 0.2s", cursor: "pointer",
                  }}
                >
                  <div style={{
                    position: "absolute", top: 3, left: hls ? 21 : 3,
                    width: 16, height: 16, borderRadius: "50%",
                    background: "#fff", transition: "left 0.2s",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.25)",
                  }} />
                </div>
                <span style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 500 }}>
                  Auto-generate HLS Streaming (.m3u8) — hemat bandwidth
                </span>
              </label>
            </div>
          ) : (
            <div>
              <p style={{ fontSize: 12, color: "var(--text-tertiary)", margin: "0 0 6px" }}>URL Embed / ID Platform</p>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  value={externalUrl}
                  onChange={e => setExternalUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=... atau kode embed platform lain"
                  style={{
                    flex: 1, padding: "8px 12px", background: "var(--bg-subtle)",
                    border: "1px solid var(--border)", borderRadius: 8,
                    fontSize: 13, color: "var(--text-primary)", outline: "none",
                  }}
                />
                <a href={externalUrl} target="_blank" rel="noopener noreferrer"
                  style={{ display: "flex", alignItems: "center", padding: "0 12px", background: "var(--bg-muted)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text-secondary)", textDecoration: "none" }}>
                  <ExternalLink size={13} />
                </a>
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
            <button style={{ padding: "8px 18px", borderRadius: 8, border: "none", background: "var(--brand)", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              Simpan Konfigurasi
            </button>
            <button onClick={() => setSelectedVideo(null)}
              style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid var(--border)", background: "transparent", color: "var(--text-secondary)", fontSize: 13, cursor: "pointer" }}>
              Batal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState } from "react";
import { Search, Crop, RotateCw, Maximize2, X, Image as ImageIcon, Check } from "lucide-react";

const MOCK_IMAGES = [
  { id: "1", name: "foto-berita-banjir-sampang.jpg", size: "1.2 MB", dimensions: "1920×1080", date: "19 Jul 2026", url: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=250&fit=crop" },
  { id: "2", name: "pelantikan-bupati-bangkalan.jpg", size: "856 KB", dimensions: "1600×900", date: "18 Jul 2026", url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=250&fit=crop" },
  { id: "3", name: "pasar-tradisional-sumenep.jpg", size: "2.1 MB", dimensions: "2400×1600", date: "18 Jul 2026", url: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=400&h=250&fit=crop" },
  { id: "4", name: "lomba-karapan-sapi.jpg", size: "1.8 MB", dimensions: "2048×1365", date: "16 Jul 2026", url: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=400&h=250&fit=crop" },
  { id: "5", name: "dermaga-kamal-madura.jpg", size: "967 KB", dimensions: "1920×1280", date: "16 Jul 2026", url: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=400&h=250&fit=crop" },
  { id: "6", name: "wisata-pantai-lombang.jpg", size: "3.2 MB", dimensions: "3000×2000", date: "15 Jul 2026", url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=250&fit=crop" },
  { id: "7", name: "garam-madura-petani.jpg", size: "1.1 MB", dimensions: "1800×1200", date: "14 Jul 2026", url: "https://images.unsplash.com/photo-1474171829340-a2d6d8e4d4f7?w=400&h=250&fit=crop" },
  { id: "8", name: "batik-madura-festival.jpg", size: "2.4 MB", dimensions: "2560×1440", date: "13 Jul 2026", url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=250&fit=crop" },
];

const ASPECT_RATIOS = [
  { label: "16:9", detail: "Gambar Utama Artikel", color: "var(--blue)" },
  { label: "4:3", detail: "List Thumbnail", color: "var(--purple)" },
  { label: "1:1", detail: "Grid Feed / Profil", color: "var(--orange)" },
];

export default function ImagesPage() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<typeof MOCK_IMAGES[0] | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [activeRatio, setActiveRatio] = useState("16:9");
  const [rotation, setRotation] = useState(0);
  const [quality, setQuality] = useState(80);

  const filtered = MOCK_IMAGES.filter(img =>
    !search || img.name.toLowerCase().includes(search.toLowerCase())
  );

  const openEditor = (img: typeof MOCK_IMAGES[0]) => {
    setSelected(img);
    setEditorOpen(true);
    setRotation(0);
    setQuality(80);
  };

  return (
    <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 20 }} className="animate-fade-in">
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", margin: 0, letterSpacing: -0.5 }}>
            Image Asset Management
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "4px 0 0" }}>
            {MOCK_IMAGES.length} gambar tersimpan — JPG, PNG, WebP, GIF
          </p>
        </div>
      </div>

      {/* Search */}
      <div style={{ position: "relative", maxWidth: 380 }}>
        <Search size={13} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)" }} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Cari gambar..."
          style={{
            width: "100%", padding: "8px 10px 8px 32px",
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: 8, fontSize: 13, color: "var(--text-primary)", outline: "none",
          }}
        />
      </div>

      {/* Image grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
        {filtered.map(img => (
          <div
            key={img.id}
            style={{
              background: "var(--surface)", border: "1px solid var(--border)",
              borderRadius: 10, overflow: "hidden",
              transition: "transform 0.15s, box-shadow 0.15s",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.1)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = "";
              e.currentTarget.style.boxShadow = "";
            }}
          >
            <div style={{ position: "relative", overflow: "hidden" }}>
              <img
                src={img.url}
                alt={img.name}
                style={{ width: "100%", height: 120, objectFit: "cover", display: "block" }}
              />
              {/* Overlay actions */}
              <div style={{
                position: "absolute", inset: 0,
                background: "rgba(0,0,0,0.45)",
                display: "flex", alignItems: "center", justifyContent: "center",
                gap: 8, opacity: 0, transition: "opacity 0.15s",
              }}
                onMouseEnter={e => e.currentTarget.style.opacity = "1"}
                onMouseLeave={e => e.currentTarget.style.opacity = "0"}
              >
                <button
                  onClick={() => openEditor(img)}
                  style={{
                    display: "flex", alignItems: "center", gap: 5,
                    padding: "6px 12px", borderRadius: 6, border: "none",
                    background: "#fff", color: "#111", fontSize: 12, fontWeight: 600, cursor: "pointer",
                  }}
                >
                  <Crop size={12} /> Edit
                </button>
                <button
                  style={{
                    padding: "6px 10px", borderRadius: 6, border: "none",
                    background: "rgba(255,255,255,0.2)", color: "#fff",
                    fontSize: 12, cursor: "pointer",
                  }}
                >
                  <Maximize2 size={12} />
                </button>
              </div>
            </div>
            <div style={{ padding: "8px 10px" }}>
              <p style={{ fontSize: 11, fontWeight: 500, color: "var(--text-primary)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{img.name}</p>
              <p style={{ fontSize: 11, color: "var(--text-tertiary)", margin: "2px 0 0" }}>{img.dimensions} · {img.size}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Image Editor Modal */}
      {editorOpen && selected && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
          backdropFilter: "blur(4px)",
        }}>
          <div style={{
            background: "var(--surface)", borderRadius: 16, overflow: "hidden",
            width: 760, maxWidth: "95vw", maxHeight: "90vh",
            display: "flex", flexDirection: "column",
            boxShadow: "0 24px 80px rgba(0,0,0,0.4)",
          }}>
            {/* Modal header */}
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "14px 18px", borderBottom: "1px solid var(--border)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Crop size={15} style={{ color: "var(--brand)" }} />
                <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>
                  Image Editor: {selected.name}
                </span>
              </div>
              <button onClick={() => setEditorOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)" }}>
                <X size={16} />
              </button>
            </div>

            <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
              {/* Preview */}
              <div style={{ flex: 1, background: "#111", display: "flex", alignItems: "center", justifyContent: "center", minHeight: 300 }}>
                <img
                  src={selected.url}
                  alt={selected.name}
                  style={{
                    maxWidth: "100%", maxHeight: 360,
                    transform: `rotate(${rotation}deg)`,
                    transition: "transform 0.3s",
                    objectFit: "contain",
                  }}
                />
              </div>

              {/* Controls */}
              <div style={{ width: 240, padding: 16, borderLeft: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 16, overflowY: "auto" }}>

                {/* Aspect Ratio */}
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 8px" }}>Aspect Ratio Cropper</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {ASPECT_RATIOS.map(r => (
                      <button
                        key={r.label}
                        onClick={() => setActiveRatio(r.label)}
                        style={{
                          display: "flex", alignItems: "center", justifyContent: "space-between",
                          padding: "8px 10px", borderRadius: 8,
                          border: `1.5px solid ${activeRatio === r.label ? r.color : "var(--border)"}`,
                          background: activeRatio === r.label ? `${r.color}18` : "transparent",
                          cursor: "pointer",
                        }}
                      >
                        <div>
                          <span style={{ fontSize: 13, fontWeight: 600, color: activeRatio === r.label ? r.color : "var(--text-primary)" }}>{r.label}</span>
                          <p style={{ fontSize: 10, color: "var(--text-tertiary)", margin: 0 }}>{r.detail}</p>
                        </div>
                        {activeRatio === r.label && <Check size={13} style={{ color: r.color }} />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Rotation */}
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 8px" }}>Rotasi Gambar</p>
                  <div style={{ display: "flex", gap: 6 }}>
                    {[-90, 90].map(deg => (
                      <button
                        key={deg}
                        onClick={() => setRotation(r => (r + deg + 360) % 360)}
                        style={{
                          flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                          padding: "7px 0", borderRadius: 7, border: "1px solid var(--border)",
                          background: "var(--bg-subtle)", color: "var(--text-secondary)",
                          fontSize: 12, cursor: "pointer",
                        }}
                      >
                        <RotateCw size={13} style={{ transform: deg < 0 ? "scaleX(-1)" : undefined }} />
                        {deg > 0 ? "+90°" : "-90°"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quality compression */}
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 8px" }}>
                    Kualitas Kompresi: <span style={{ color: "var(--brand)" }}>{quality}%</span>
                  </p>
                  <input
                    type="range" min={30} max={100} value={quality}
                    onChange={e => setQuality(Number(e.target.value))}
                    style={{ width: "100%", accentColor: "var(--brand)" }}
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--text-tertiary)" }}>
                    <span>30% (kecil)</span>
                    <span>100% (asli)</span>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 7 }}>
                  <button style={{
                    padding: "9px 0", borderRadius: 8, border: "none",
                    background: "var(--brand)", color: "#fff",
                    fontSize: 13, fontWeight: 600, cursor: "pointer",
                  }}>
                    Simpan Salinan Baru
                  </button>
                  <button
                    onClick={() => setEditorOpen(false)}
                    style={{
                      padding: "9px 0", borderRadius: 8,
                      border: "1px solid var(--border)", background: "transparent",
                      color: "var(--text-secondary)", fontSize: 13, cursor: "pointer",
                    }}
                  >
                    Batal
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

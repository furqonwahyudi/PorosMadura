import React, { useState } from "react";
import {
  Image, Search, Filter, Grid3x3, List, X, Copy, Trash2,
  ChevronLeft, ChevronRight, Upload, Info, Eye, Edit2,
  FileImage, Video, FileText, Music
} from "lucide-react";

type MediaType = "all" | "images" | "videos" | "documents" | "audio";

const MOCK_MEDIA = [
  { id: "1", name: "foto-berita-banjir-sampang.jpg", type: "image", size: "1.2 MB", dimensions: "1920×1080", date: "19 Jul 2026", uploader: "Ahmad Syafi'i", url: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=250&fit=crop", alt: "" },
  { id: "2", name: "pelantikan-bupati-bangkalan.jpg", type: "image", size: "856 KB", dimensions: "1600×900", date: "18 Jul 2026", uploader: "Siti Rahmah", url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=250&fit=crop", alt: "" },
  { id: "3", name: "pasar-tradisional-sumenep.jpg", type: "image", size: "2.1 MB", dimensions: "2400×1600", date: "18 Jul 2026", uploader: "Ahmad Syafi'i", url: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=400&h=250&fit=crop", alt: "" },
  { id: "4", name: "video-profil-madura.mp4", type: "video", size: "45.6 MB", dimensions: "1920×1080", date: "17 Jul 2026", uploader: "Tim Produksi", url: "", alt: "" },
  { id: "5", name: "rilis-pers-bupati.pdf", type: "document", size: "342 KB", dimensions: "—", date: "17 Jul 2026", uploader: "Humas Pemda", url: "", alt: "" },
  { id: "6", name: "lomba-karapan-sapi.jpg", type: "image", size: "1.8 MB", dimensions: "2048×1365", date: "16 Jul 2026", uploader: "Siti Rahmah", url: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=400&h=250&fit=crop", alt: "" },
  { id: "7", name: "dermaga-kamal-madura.jpg", type: "image", size: "967 KB", dimensions: "1920×1280", date: "16 Jul 2026", uploader: "Ahmad Syafi'i", url: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=400&h=250&fit=crop", alt: "" },
  { id: "8", name: "rekap-apbd-2026.xlsx", type: "document", size: "128 KB", dimensions: "—", date: "15 Jul 2026", uploader: "Bagian Keuangan", url: "", alt: "" },
  { id: "9", name: "wisata-pantai-lombang.jpg", type: "image", size: "3.2 MB", dimensions: "3000×2000", date: "15 Jul 2026", uploader: "Tim Foto", url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=250&fit=crop", alt: "" },
  { id: "10", name: "garam-madura-petani.jpg", type: "image", size: "1.1 MB", dimensions: "1800×1200", date: "14 Jul 2026", uploader: "Siti Rahmah", url: "https://images.unsplash.com/photo-1474171829340-a2d6d8e4d4f7?w=400&h=250&fit=crop", alt: "" },
  { id: "11", name: "wawancara-gubernur.mp4", type: "video", size: "78.3 MB", dimensions: "1280×720", date: "14 Jul 2026", uploader: "Tim Produksi", url: "", alt: "" },
  { id: "12", name: "batik-madura-festival.jpg", type: "image", size: "2.4 MB", dimensions: "2560×1440", date: "13 Jul 2026", uploader: "Ahmad Syafi'i", url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=250&fit=crop", alt: "" },
];

const TYPE_ICONS: Record<string, React.ReactNode> = {
  image: <FileImage size={32} style={{ color: "var(--blue)" }} />,
  video: <Video size={32} style={{ color: "var(--purple)" }} />,
  document: <FileText size={32} style={{ color: "var(--orange)" }} />,
  audio: <Music size={32} style={{ color: "var(--green)" }} />,
};

export default function GalleryPage() {
  const [filter, setFilter] = useState<MediaType>("all");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selected, setSelected] = useState<typeof MOCK_MEDIA[0] | null>(null);
  const [altText, setAltText] = useState("");
  const [copied, setCopied] = useState(false);

  const filtered = MOCK_MEDIA.filter(m => {
    if (filter !== "all" && m.type !== filter.slice(0, -1)) return false;
    if (search && !m.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleSelect = (item: typeof MOCK_MEDIA[0]) => {
    setSelected(item);
    setAltText(item.alt || "");
    setCopied(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`https://cdn.porosmadura.com/media/${selected?.name}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filterTabs: { key: MediaType; label: string }[] = [
    { key: "all", label: "Semua" },
    { key: "images", label: "Images" },
    { key: "videos", label: "Videos" },
    { key: "documents", label: "Documents" },
    { key: "audio", label: "Audio" },
  ];

  return (
    <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 20 }} className="animate-fade-in">
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", margin: 0, letterSpacing: -0.5 }}>
            Central Media Library
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "4px 0 0" }}>
            {MOCK_MEDIA.length} aset media tersimpan
          </p>
        </div>
        <button
          onClick={() => window.location.href = "/admin/media/upload"}
          style={{
            display: "flex", alignItems: "center", gap: 7, padding: "8px 16px",
            background: "var(--brand)", border: "none", borderRadius: 8,
            cursor: "pointer", color: "#fff", fontSize: 13, fontWeight: 600,
          }}
        >
          <Upload size={15} /> Upload File
        </button>
      </div>

      {/* Main layout */}
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
        {/* Left panel */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Filter bar */}
          <div style={{
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: 12, padding: "12px 16px", marginBottom: 12,
            display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap"
          }}>
            {/* Search */}
            <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
              <Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)" }} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Cari nama file..."
                style={{
                  width: "100%", padding: "7px 10px 7px 30px",
                  background: "var(--bg-subtle)", border: "1px solid var(--border)",
                  borderRadius: 8, fontSize: 13, color: "var(--text-primary)", outline: "none",
                }}
              />
            </div>

            {/* Type filter */}
            <div style={{ display: "flex", gap: 4 }}>
              {filterTabs.map(f => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  style={{
                    padding: "5px 11px", borderRadius: 6, border: "1px solid",
                    fontSize: 12, fontWeight: 500, cursor: "pointer",
                    borderColor: filter === f.key ? "var(--brand)" : "var(--border)",
                    background: filter === f.key ? "var(--brand-subtle)" : "transparent",
                    color: filter === f.key ? "var(--brand)" : "var(--text-secondary)",
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* View toggle */}
            <div style={{ display: "flex", border: "1px solid var(--border)", borderRadius: 7, overflow: "hidden" }}>
              {(["grid", "list"] as const).map(v => (
                <button
                  key={v}
                  onClick={() => setViewMode(v)}
                  style={{
                    padding: "6px 10px", border: "none", cursor: "pointer",
                    background: viewMode === v ? "var(--bg-muted)" : "transparent",
                    color: viewMode === v ? "var(--text-primary)" : "var(--text-tertiary)",
                  }}
                >
                  {v === "grid" ? <Grid3x3 size={14} /> : <List size={14} />}
                </button>
              ))}
            </div>
          </div>

          {/* Grid or List */}
          {viewMode === "grid" ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 10 }}>
              {filtered.map(item => (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  style={{
                    background: "var(--surface)", border: `2px solid ${selected?.id === item.id ? "var(--brand)" : "var(--border)"}`,
                    borderRadius: 10, overflow: "hidden", cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={e => { if (selected?.id !== item.id) e.currentTarget.style.borderColor = "var(--text-tertiary)"; }}
                  onMouseLeave={e => { if (selected?.id !== item.id) e.currentTarget.style.borderColor = "var(--border)"; }}
                >
                  {item.type === "image" ? (
                    <img
                      src={item.url}
                      alt={item.name}
                      style={{ width: "100%", height: 110, objectFit: "cover", display: "block" }}
                    />
                  ) : (
                    <div style={{
                      width: "100%", height: 110, display: "flex", alignItems: "center",
                      justifyContent: "center", background: "var(--bg-subtle)",
                    }}>
                      {TYPE_ICONS[item.type]}
                    </div>
                  )}
                  <div style={{ padding: "8px 10px" }}>
                    <p style={{ fontSize: 11, fontWeight: 500, color: "var(--text-primary)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {item.name}
                    </p>
                    <p style={{ fontSize: 11, color: "var(--text-tertiary)", margin: "2px 0 0" }}>{item.size}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
              {filtered.map((item, i) => (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "12px 16px",
                    background: selected?.id === item.id ? "var(--brand-subtle)" : "transparent",
                    borderBottom: i < filtered.length - 1 ? "1px solid var(--border)" : "none",
                    cursor: "pointer", transition: "background 0.1s",
                  }}
                >
                  {item.type === "image" ? (
                    <img src={item.url} alt={item.name} style={{ width: 48, height: 36, objectFit: "cover", borderRadius: 6, flexShrink: 0 }} />
                  ) : (
                    <div style={{ width: 48, height: 36, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-subtle)", borderRadius: 6, flexShrink: 0 }}>
                      {TYPE_ICONS[item.type]}
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</p>
                    <p style={{ fontSize: 11, color: "var(--text-tertiary)", margin: 0 }}>{item.type} · {item.size} · {item.date}</p>
                  </div>
                  <span style={{ fontSize: 11, color: "var(--text-tertiary)", flexShrink: 0 }}>{item.uploader}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right inspector panel */}
        {selected && (
          <div style={{
            width: 280, flexShrink: 0, background: "var(--surface)",
            border: "1px solid var(--border)", borderRadius: 12,
            overflow: "hidden", position: "sticky", top: 0,
          }}>
            {/* Preview */}
            {selected.type === "image" ? (
              <img src={selected.url} alt={selected.name} style={{ width: "100%", height: 160, objectFit: "cover", display: "block" }} />
            ) : (
              <div style={{ width: "100%", height: 160, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-subtle)" }}>
                {TYPE_ICONS[selected.type]}
              </div>
            )}

            {/* Header */}
            <div style={{ padding: "12px 14px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>Detail Aset</span>
              <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-tertiary)" }}>
                <X size={14} />
              </button>
            </div>

            {/* Metadata */}
            <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { label: "Nama File", val: selected.name },
                { label: "Tipe", val: selected.type },
                { label: "Ukuran", val: selected.size },
                { label: "Dimensi", val: selected.dimensions },
                { label: "Tanggal Unggah", val: selected.date },
                { label: "Diunggah Oleh", val: selected.uploader },
              ].map(row => (
                <div key={row.label}>
                  <p style={{ fontSize: 10, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.04em", margin: "0 0 2px" }}>{row.label}</p>
                  <p style={{ fontSize: 12, color: "var(--text-primary)", margin: 0, wordBreak: "break-all" }}>{row.val}</p>
                </div>
              ))}

              {/* Alt text editable */}
              <div>
                <p style={{ fontSize: 10, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.04em", margin: "0 0 4px" }}>
                  Alt Text (SEO)
                </p>
                <textarea
                  value={altText}
                  onChange={e => setAltText(e.target.value)}
                  rows={2}
                  placeholder="Deskripsi gambar untuk aksesibilitas..."
                  style={{
                    width: "100%", padding: "6px 8px", background: "var(--bg-subtle)",
                    border: "1px solid var(--border)", borderRadius: 6,
                    fontSize: 12, color: "var(--text-primary)", resize: "none", outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: 6, paddingTop: 4 }}>
                <button
                  onClick={handleCopy}
                  style={{
                    flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                    padding: "7px 0", borderRadius: 7, border: "1px solid var(--border)",
                    background: copied ? "var(--green-subtle)" : "var(--bg-subtle)",
                    color: copied ? "var(--green)" : "var(--text-secondary)",
                    fontSize: 12, fontWeight: 500, cursor: "pointer",
                  }}
                >
                  <Copy size={12} /> {copied ? "Disalin!" : "Copy URL"}
                </button>
                <button
                  style={{
                    flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                    padding: "7px 0", borderRadius: 7, border: "1px solid var(--border)",
                    background: "var(--bg-subtle)", color: "var(--red)",
                    fontSize: 12, fontWeight: 500, cursor: "pointer",
                  }}
                >
                  <Trash2 size={12} /> Hapus
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

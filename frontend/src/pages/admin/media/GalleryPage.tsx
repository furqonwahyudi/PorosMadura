import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { adminApi } from "../../../lib/adminApi";
import { useForm } from "react-hook-form";
import { useDialog } from "../../../context/DialogContext";
import {
  Image as ImageIcon, Search, Filter, Grid3x3, List, X, Copy, Trash2,
  ChevronLeft, ChevronRight, Upload, Info, Eye, Edit2,
  FileImage, Video, FileText, Music
} from "lucide-react";

type MediaType = "all" | "images" | "videos" | "documents" | "audio";

const TYPE_ICONS: Record<string, React.ReactNode> = {
  image: <FileImage size={32} style={{ color: "var(--blue)" }} />,
  video: <Video size={32} style={{ color: "var(--purple)" }} />,
  document: <FileText size={32} style={{ color: "var(--orange)" }} />,
  audio: <Music size={32} style={{ color: "var(--green)" }} />,
};

export default function GalleryPage() {
  const { showToast } = useDialog();
  const [filter, setFilter] = useState<MediaType>("all");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selected, setSelected] = useState<any | null>(null);
  const [altText, setAltText] = useState("");
  const [copied, setCopied] = useState(false);

  const { data: mediaFiles = [], refetch } = useQuery<any[]>({
    queryKey: ["admin", "media", "list"],
    queryFn: async () => {
      const res = await adminApi.get<{ success: boolean; data: any[] }>("/api/media");
      return res.data.map(item => ({
        id: item.id,
        name: item.name,
        type: item.mimeType?.startsWith("image/") ? "image" : item.mimeType?.startsWith("video/") ? "video" : "document",
        size: (item.size / 1024 / 1024).toFixed(2) + " MB",
        dimensions: item.width && item.height ? `${item.width}×${item.height}` : "—",
        date: new Date(item.uploadedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
        uploader: "Super Admin",
        url: item.url,
        alt: item.tags?.join(", ") || ""
      }));
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (mediaId: string) => adminApi.delete(`/api/media/${mediaId}`),
    onSuccess: () => {
      showToast("Media berhasil dihapus!", "success");
      setSelected(null);
      refetch();
    },
    onError: (err: any) => {
      showToast(err.message || "Gagal menghapus media", "error");
    }
  });

  const filtered = mediaFiles.filter(m => {
    if (filter !== "all" && m.type !== filter.slice(0, -1)) return false;
    if (search && !m.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleSelect = (item: any) => {
    setSelected(item);
    setAltText(item.alt || "");
    setCopied(false);
  };

  const handleCopy = () => {
    if (selected) {
      navigator.clipboard.writeText(selected.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
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
            {mediaFiles.length} aset media tersimpan
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
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start", width: "100%" }}>
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
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 16, width: "100%" }}>
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
                    <div style={{ width: "100%", aspectRatio: "4/3", overflow: "hidden", background: "var(--bg-subtle)" }}>
                      <img
                        src={item.url}
                        alt={item.name}
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                      />
                    </div>
                  ) : (
                    <div style={{
                      width: "100%", aspectRatio: "4/3", display: "flex", alignItems: "center",
                      justifyContent: "center", background: "var(--bg-subtle)",
                    }}>
                      {TYPE_ICONS[item.type]}
                    </div>
                  )}
                  <div style={{ padding: "10px 12px" }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={item.name}>
                      {item.name}
                    </p>
                    <p style={{ fontSize: 11, color: "var(--text-tertiary)", margin: "4px 0 0" }}>{item.size}</p>
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
                  onClick={() => deleteMutation.mutate(selected.id)}
                  disabled={deleteMutation.isPending}
                  style={{
                    flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                    padding: "7px 0", borderRadius: 7, border: "1px solid var(--border)",
                    background: "var(--bg-subtle)", color: "var(--red)",
                    fontSize: 12, fontWeight: 500, cursor: deleteMutation.isPending ? "not-allowed" : "pointer",
                  }}
                >
                  <Trash2 size={12} /> {deleteMutation.isPending ? "Deleting..." : "Hapus"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState } from "react";
import { Zap, Image, SlidersHorizontal, Maximize2, Save, AlertCircle, CheckCircle } from "lucide-react";

export default function OptimizationPage() {
  const [webpEnabled, setWebpEnabled] = useState(true);
  const [avifEnabled, setAvifEnabled] = useState(false);
  const [compression, setCompression] = useState(78);
  const [maxWidth, setMaxWidth] = useState(1920);
  const [maxHeight, setMaxHeight] = useState(1080);
  const [saved, setSaved] = useState(false);

  const getQualityLabel = (v: number) => {
    if (v >= 90) return { label: "Kualitas Tinggi", color: "var(--green)" };
    if (v >= 70) return { label: "Seimbang (Disarankan)", color: "var(--brand)" };
    if (v >= 50) return { label: "Ukuran Kecil", color: "var(--orange)" };
    return { label: "Agresif (Hati-hati)", color: "var(--red)" };
  };

  const q = getQualityLabel(compression);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const Toggle = ({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) => (
    <div
      onClick={onToggle}
      style={{
        width: 44, height: 24, borderRadius: 99, flexShrink: 0,
        background: enabled ? "var(--brand)" : "var(--bg-muted)",
        position: "relative", transition: "background 0.2s", cursor: "pointer",
      }}
    >
      <div style={{
        position: "absolute", top: 4, left: enabled ? 23 : 4,
        width: 16, height: 16, borderRadius: "50%",
        background: "#fff", transition: "left 0.2s",
        boxShadow: "0 1px 4px rgba(0,0,0,0.25)",
      }} />
    </div>
  );

  return (
    <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 20 }} className="animate-fade-in">
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", margin: 0, letterSpacing: -0.5 }}>
          Automated Media Optimization &amp; Edge Compression
        </h1>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "4px 0 0" }}>
          Konfigurasi global pemrosesan gambar otomatis saat diunggah
        </p>
      </div>

      {/* Stats summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        {[
          { label: "Gambar Dioptimasi", val: "1,847", sub: "30 hari terakhir", icon: <Image size={16} style={{ color: "var(--blue)" }} /> },
          { label: "Ukuran Dihemat", val: "4.3 GB", sub: "~67% reduksi rata-rata", icon: <Zap size={16} style={{ color: "var(--yellow)" }} /> },
          { label: "Format WebP", val: "94%", sub: "dari total gambar aktif", icon: <CheckCircle size={16} style={{ color: "var(--green)" }} /> },
        ].map(s => (
          <div key={s.label} style={{
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: 10, padding: "14px 16px", display: "flex", gap: 12, alignItems: "center",
          }}>
            <div style={{ width: 38, height: 38, borderRadius: 9, background: "var(--bg-subtle)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {s.icon}
            </div>
            <div>
              <p style={{ fontSize: 11, color: "var(--text-tertiary)", margin: "0 0 2px", textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: 600 }}>{s.label}</p>
              <p style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 1px" }}>{s.val}</p>
              <p style={{ fontSize: 11, color: "var(--text-tertiary)", margin: 0 }}>{s.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Settings card */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
        {/* Section 1: Format Converter */}
        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: "var(--brand-subtle)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Zap size={14} style={{ color: "var(--brand)" }} />
                </div>
                <h2 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
                  Next-Gen Format Converter
                </h2>
              </div>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "0 0 12px" }}>
                Konversi otomatis gambar lama ke format modern saat diunggah jurnalis.
              </p>

              {/* WebP toggle */}
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "12px 14px", background: "var(--bg-subtle)", borderRadius: 10, marginBottom: 8,
                border: `1px solid ${webpEnabled ? "var(--brand)" : "var(--border)"}`,
              }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 2px" }}>
                    Auto-Convert ke WebP
                  </p>
                  <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0 }}>
                    Format Google-recommended. Rata-rata 25–35% lebih kecil dari JPG dengan kualitas visual setara.
                  </p>
                </div>
                <Toggle enabled={webpEnabled} onToggle={() => setWebpEnabled(v => !v)} />
              </div>

              {/* AVIF toggle */}
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "12px 14px", background: "var(--bg-subtle)", borderRadius: 10,
                border: `1px solid ${avifEnabled ? "var(--brand)" : "var(--border)"}`,
              }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 2px" }}>
                    Auto-Convert ke AVIF <span style={{ fontSize: 10, background: "var(--orange-subtle)", color: "var(--orange)", padding: "1px 6px", borderRadius: 10, fontWeight: 700 }}>EXPERIMENTAL</span>
                  </p>
                  <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0 }}>
                    Format generasi terbaru. Hingga 50% lebih kecil dari WebP. Dukungan browser masih terbatas.
                  </p>
                </div>
                <Toggle enabled={avifEnabled} onToggle={() => setAvifEnabled(v => !v)} />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Compression */}
        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: "var(--purple-subtle)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <SlidersHorizontal size={14} style={{ color: "var(--purple)" }} />
            </div>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
              Global Compression Level Engine
            </h2>
          </div>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "0 0 16px" }}>
            Tingkat kompresi kualitas gambar yang diterapkan ke seluruh unggahan baru.
          </p>

          <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 8 }}>
            <input
              type="range" min={30} max={100} value={compression}
              onChange={e => setCompression(Number(e.target.value))}
              style={{ flex: 1, accentColor: "var(--brand)", height: 6 }}
            />
            <div style={{
              minWidth: 80, padding: "6px 12px", borderRadius: 8,
              background: `${q.color}18`, border: `1px solid ${q.color}`,
              textAlign: "center",
            }}>
              <span style={{ fontSize: 18, fontWeight: 800, color: q.color }}>{compression}%</span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: q.color, flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: q.color, fontWeight: 600 }}>{q.label}</span>
            <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
              — {compression >= 75 ? "Kualitas visual berita tetap terjaga" : compression >= 55 ? "Perlu diuji sebelum diterapkan" : "Hanya untuk gambar non-editorial"}
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
            {[
              { v: 30, label: "30% Agresif" }, { v: 75, label: "75% Rekomen" }, { v: 80, label: "80% Default" }, { v: 100, label: "100% Asli" }
            ].map(p => (
              <button key={p.v} onClick={() => setCompression(p.v)}
                style={{
                  padding: "3px 8px", borderRadius: 6, border: "1px solid var(--border)",
                  background: compression === p.v ? "var(--brand-subtle)" : "transparent",
                  color: compression === p.v ? "var(--brand)" : "var(--text-tertiary)",
                  fontSize: 11, cursor: "pointer",
                }}>{p.label}</button>
            ))}
          </div>
        </div>

        {/* Section 3: Max dimensions */}
        <div style={{ padding: "20px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: "var(--blue-subtle)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Maximize2 size={14} style={{ color: "var(--blue)" }} />
            </div>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
              Image Dimension Max Thresholds
            </h2>
          </div>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "0 0 16px" }}>
            Foto resolusi tinggi (4K+) otomatis di-downscale ke batas ini. Jurnalis tidak perlu mengecilkan foto manual.
          </p>

          <div style={{ display: "flex", gap: 16 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Max Width (px)</label>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  type="number" value={maxWidth} onChange={e => setMaxWidth(Number(e.target.value))}
                  min={800} max={4000} step={160}
                  style={{
                    flex: 1, padding: "9px 12px", background: "var(--bg-subtle)",
                    border: "1px solid var(--border)", borderRadius: 8,
                    fontSize: 14, fontWeight: 600, color: "var(--text-primary)", outline: "none",
                  }}
                />
                <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>px</span>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 6 }}>Max Height (px)</label>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  type="number" value={maxHeight} onChange={e => setMaxHeight(Number(e.target.value))}
                  min={600} max={4000} step={90}
                  style={{
                    flex: 1, padding: "9px 12px", background: "var(--bg-subtle)",
                    border: "1px solid var(--border)", borderRadius: 8,
                    fontSize: 14, fontWeight: 600, color: "var(--text-primary)", outline: "none",
                  }}
                />
                <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>px</span>
              </div>
            </div>
          </div>

          <div style={{
            marginTop: 12, padding: "10px 14px",
            background: "var(--bg-subtle)", borderRadius: 8,
            display: "flex", gap: 8, alignItems: "center",
          }}>
            <AlertCircle size={13} style={{ color: "var(--text-tertiary)", flexShrink: 0 }} />
            <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0 }}>
              Resolusi saat ini: <strong style={{ color: "var(--text-primary)" }}>{maxWidth}×{maxHeight}px</strong>.
              Foto &gt;{(maxWidth / 1000).toFixed(1)}K lebar akan di-downscale otomatis saat upload. File asli tidak disimpan.
            </p>
          </div>
        </div>
      </div>

      {/* Save button */}
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <button
          onClick={handleSave}
          style={{
            display: "flex", alignItems: "center", gap: 7, padding: "10px 22px",
            background: saved ? "var(--green)" : "var(--brand)",
            border: "none", borderRadius: 9, cursor: "pointer",
            color: "#fff", fontSize: 13, fontWeight: 600, transition: "background 0.3s",
          }}
        >
          {saved ? <><CheckCircle size={15} /> Tersimpan!</> : <><Save size={15} /> Simpan Konfigurasi</>}
        </button>
        <p style={{ fontSize: 12, color: "var(--text-tertiary)", margin: 0 }}>
          Pengaturan berlaku untuk semua unggahan baru setelah disimpan.
        </p>
      </div>
    </div>
  );
}

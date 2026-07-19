import React, { useState } from "react";
import { Plus, ArrowRight, Trash2, ShieldAlert, Image, Save, CheckCircle } from "lucide-react";

export default function SeoRedirectPage() {
  const [oldUrl, setOldUrl] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [type, setType] = useState("301");
  const [saved, setSaved] = useState(false);

  const [redirects, setRedirects] = useState([
    { id: 1, old: "/berita-lama-123", new: "/post/berita-baru-keren", type: "301" },
    { id: 2, old: "/kategori/olahraga-temp", new: "/olahraga", type: "302" },
  ]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (oldUrl && newUrl) {
      setRedirects(prev => [...prev, { id: Date.now(), old: oldUrl, new: newUrl, type }]);
      setOldUrl("");
      setNewUrl("");
    }
  };

  const handleRemove = (id: number) => {
    setRedirects(prev => prev.filter(r => r.id !== id));
  };

  const handleSaveFallback = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const deadLinks = [
    { url: "/read/kategori-bola-hilang", count: 142, lastSeen: "10 menit lalu" },
    { url: "/assets/banner-old.jpg", count: 48, lastSeen: "1 jam lalu" },
    { url: "/post/berita-hoaks-dihapus", count: 12, lastSeen: "3 jam lalu" },
  ];

  return (
    <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 20 }} className="animate-fade-in">
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", margin: 0, letterSpacing: -0.5 }}>
          URL Redirection Engine &amp; Social Media Fallbacks
        </h1>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "4px 0 0" }}>
          Atur pengalihan tautan 301/302 broken link, pantau logs error 404, dan upload fallback open graph banner
        </p>
      </div>

      <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
        
        {/* Left: Redirection manager */}
        <div style={{ flex: 1.2, minWidth: 320, display: "flex", flexDirection: "column", gap: 16 }}>
          
          {/* Redirect form */}
          <form onSubmit={handleAdd} style={{
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: 12, padding: 20, display: "flex", flexDirection: "column", gap: 14
          }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
              301/302 URL Redirection Manager Matrix
            </h2>

            <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>Old URL (Broken)</label>
                <input
                  type="text" value={oldUrl} onChange={e => setOldUrl(e.target.value)}
                  placeholder="/kategori-lama"
                  style={{
                    width: "100%", padding: "8px 12px", background: "var(--bg-subtle)",
                    border: "1px solid var(--border)", borderRadius: 8, fontSize: 13,
                    color: "var(--text-primary)", outline: "none", boxSizing: "border-box"
                  }}
                  required
                />
              </div>

              <div style={{ display: "flex", alignItems: "center", height: 35 }}>
                <ArrowRight size={14} style={{ color: "var(--text-tertiary)" }} />
              </div>

              <div style={{ flex: 1 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>New Active URL</label>
                <input
                  type="text" value={newUrl} onChange={e => setNewUrl(e.target.value)}
                  placeholder="/kategori-baru"
                  style={{
                    width: "100%", padding: "8px 12px", background: "var(--bg-subtle)",
                    border: "1px solid var(--border)", borderRadius: 8, fontSize: 13,
                    color: "var(--text-primary)", outline: "none", boxSizing: "border-box"
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>Type</label>
                <select
                  value={type} onChange={e => setType(e.target.value)}
                  style={{
                    padding: "8px 10px", background: "var(--bg-subtle)",
                    border: "1px solid var(--border)", borderRadius: 8, fontSize: 13,
                    color: "var(--text-primary)", outline: "none", cursor: "pointer"
                  }}
                >
                  <option value="301">301 (Perm)</option>
                  <option value="302">302 (Temp)</option>
                </select>
              </div>

              <button type="submit" style={{
                padding: "8px 14px", borderRadius: 8, border: "none",
                background: "var(--brand)", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                <Plus size={14} />
              </button>
            </div>
          </form>

          {/* Redirect list table */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
            <div style={{
              display: "grid", gridTemplateColumns: "1.2fr 1.2fr 80px 70px",
              gap: 12, padding: "10px 16px",
              background: "var(--bg-subtle)", borderBottom: "1px solid var(--border)",
            }}>
              {["Old URL Link", "New Redirect URL", "Redirection", "Aksi"].map(h => (
                <span key={h} style={{ fontSize: 11, fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</span>
              ))}
            </div>

            {redirects.map(r => (
              <div key={r.id} style={{
                display: "grid", gridTemplateColumns: "1.2fr 1.2fr 80px 70px",
                gap: 12, padding: "12px 16px", alignItems: "center",
                borderBottom: "1px solid var(--border)"
              }}>
                <span style={{ fontSize: 12, fontFamily: "monospace", color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.old}</span>
                <span style={{ fontSize: 12, fontFamily: "monospace", color: "var(--brand)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.new}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: r.type === "301" ? "var(--green)" : "var(--blue)" }}>{r.type}</span>
                <button
                  onClick={() => handleRemove(r.id)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--red)" }}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>

        </div>

        {/* Right: Dead Links & Social Open Graph */}
        <div style={{ flex: 1, minWidth: 320, display: "flex", flexDirection: "column", gap: 16 }}>
          
          {/* Dead Links 404 Monitor */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 20 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 12px", display: "flex", alignItems: "center", gap: 6 }}>
              <ShieldAlert size={15} style={{ color: "var(--red)" }} /> Dead Links 404 Interception Log Monitor
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {deadLinks.map((d, idx) => (
                <div key={idx} style={{
                  border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px",
                  display: "flex", justifyContent: "space-between", alignItems: "center"
                }}>
                  <div>
                    <span style={{ fontSize: 12, fontFamily: "monospace", color: "var(--text-secondary)", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 180 }}>{d.url}</span>
                    <span style={{ fontSize: 10, color: "var(--text-tertiary)" }}>Last seen: {d.lastSeen}</span>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "var(--red)" }}>{d.count} hit</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Social Open Graph Media Fallback */}
          <div style={{
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: 12, padding: 20, display: "flex", flexDirection: "column", gap: 12
          }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", margin: 0, display: "flex", alignItems: "center", gap: 6 }}>
              <Image size={15} style={{ color: "var(--brand)" }} /> Social Open Graph Media Fallback
            </h2>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0 }}>
              Banner fallback standar ukuran 1200×630 px jika artikel tidak memiliki gambar utama.
            </p>

            <input
              type="file" accept="image/*"
              style={{
                width: "100%", padding: "6px", background: "var(--bg-subtle)",
                border: "1px solid var(--border)", borderRadius: 8, fontSize: 12,
                color: "var(--text-primary)", outline: "none", boxSizing: "border-box"
              }}
            />

            <button
              onClick={handleSaveFallback}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                padding: "8px 0", borderRadius: 8, border: "none", background: "var(--brand)",
                color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer"
              }}
            >
              <Save size={13} /> Update Fallback Image
            </button>
            {saved && <span style={{ fontSize: 11, color: "var(--green)", textAlign: "center" }}>Fallback image updated!</span>}
          </div>

        </div>

      </div>
    </div>
  );
}

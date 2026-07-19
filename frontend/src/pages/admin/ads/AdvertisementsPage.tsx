import React, { useState } from "react";
import { Layers, Plus, Code, Image as ImageIcon, Link, Save, CheckCircle } from "lucide-react";

export default function AdvertisementsPage() {
  const [adType, setAdType] = useState("direct");
  const [name, setName] = useState("");
  const [targetUrl, setTargetUrl] = useState("");
  const [scriptCode, setScriptCode] = useState("");
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setName("");
      setTargetUrl("");
      setScriptCode("");
    }, 2000);
  };

  const adItems = [
    { id: "AD-01", name: "Bupati Bangkalan Banner 1", type: "Direct Banner", slot: "Homepage Top", url: "https://pemkab-bangkalan.go.id" },
    { id: "AD-02", name: "Google AdSense Responsive", type: "Programmatic Script", slot: "Article Middle Sidebar", url: "Script Embed" },
    { id: "AD-03", name: "Yahoo Finance Live Feed fallback", type: "Programmatic Script", slot: "Mobile Sticky", url: "Script Embed" },
  ];

  return (
    <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 20 }} className="animate-fade-in">
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", margin: 0, letterSpacing: -0.5 }}>
          Master Banner &amp; Programmatic Scripts Repository
        </h1>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "4px 0 0" }}>
          Kelola aset kreatif iklan berupa gambar spanduk, tautan langsung, atau script programmatik (Google AdSense)
        </p>
      </div>

      {/* Grid: Creator Form on Left, List on Right */}
      <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
        
        {/* Ad Creator Form */}
        <form onSubmit={handleSave} style={{
          flex: 1, minWidth: 320, background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: 12, padding: 20, display: "flex", flexDirection: "column", gap: 14,
        }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 4px", display: "flex", alignItems: "center", gap: 6 }}>
            <Plus size={15} style={{ color: "var(--brand)" }} /> Ad Creative Material Creator
          </h2>

          {successMsg()}

          {/* Ad Name */}
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Nama Materi Iklan *</label>
            <input
              type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder="Contoh: Banner Promosi Event Batik 2026"
              style={{
                width: "100%", padding: "8px 12px", background: "var(--bg-subtle)",
                border: "1px solid var(--border)", borderRadius: 8, fontSize: 13,
                color: "var(--text-primary)", outline: "none", boxSizing: "border-box"
              }}
              required
            />
          </div>

          {/* Ad Type Choice */}
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Ad Type *</label>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="button" onClick={() => setAdType("direct")}
                style={{
                  flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  padding: "9px 0", borderRadius: 8, border: "1.5px solid",
                  borderColor: adType === "direct" ? "var(--brand)" : "var(--border)",
                  background: adType === "direct" ? "var(--brand-subtle)" : "transparent",
                  color: adType === "direct" ? "var(--brand)" : "var(--text-secondary)",
                  fontSize: 12, fontWeight: 600, cursor: "pointer",
                }}
              >
                <ImageIcon size={14} /> Direct Banner
              </button>
              <button
                type="button" onClick={() => setAdType("programmatic")}
                style={{
                  flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  padding: "9px 0", borderRadius: 8, border: "1.5px solid",
                  borderColor: adType === "programmatic" ? "var(--brand)" : "var(--border)",
                  background: adType === "programmatic" ? "var(--brand-subtle)" : "transparent",
                  color: adType === "programmatic" ? "var(--brand)" : "var(--text-secondary)",
                  fontSize: 12, fontWeight: 600, cursor: "pointer",
                }}
              >
                <Code size={14} /> Programmatic Script
              </button>
            </div>
          </div>

          {/* Conditional inputs */}
          {adType === "direct" ? (
            <>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Unggah Gambar Banner *</label>
                <input
                  type="file" accept="image/*"
                  style={{
                    width: "100%", padding: "6px", background: "var(--bg-subtle)",
                    border: "1px solid var(--border)", borderRadius: 8, fontSize: 12,
                    color: "var(--text-primary)", outline: "none", boxSizing: "border-box"
                  }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Target URL Redirection Link *</label>
                <div style={{ position: "relative" }}>
                  <Link size={13} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)" }} />
                  <input
                    type="url" value={targetUrl} onChange={e => setTargetUrl(e.target.value)}
                    placeholder="https://..."
                    style={{
                      width: "100%", padding: "8px 12px 8px 32px", background: "var(--bg-subtle)",
                      border: "1px solid var(--border)", borderRadius: 8, fontSize: 13,
                      color: "var(--text-primary)", outline: "none", boxSizing: "border-box"
                    }}
                    required
                  />
                </div>
              </div>
            </>
          ) : (
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Programmatic Ad Network Script *</label>
              <textarea
                value={scriptCode} onChange={e => setScriptCode(e.target.value)}
                rows={5} placeholder="Paste kode script tag Google AdSense/MGID di sini..."
                style={{
                  width: "100%", padding: "8px 12px", background: "var(--bg-subtle)",
                  border: "1px solid var(--border)", borderRadius: 8, fontSize: 12,
                  fontFamily: "monospace", color: "var(--text-primary)", outline: "none",
                  boxSizing: "border-box", resize: "none"
                }}
                required
              />
            </div>
          )}

          {/* Submit */}
          <button type="submit" style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
            padding: "10px 0", background: "var(--brand)", border: "none", borderRadius: 8,
            cursor: "pointer", color: "#fff", fontSize: 13, fontWeight: 600, marginTop: 6
          }}>
            <Save size={14} /> Simpan Materi Iklan
          </button>
        </form>

        {/* Ad List */}
        <div style={{ flex: 1.2, minWidth: 320, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 20 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 12px" }}>
            Daftar Materi Kreatif
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {adItems.map(item => (
              <div key={item.id} style={{
                border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px",
                display: "flex", justifyContent: "space-between", alignItems: "center"
              }}>
                <div>
                  <span style={{ fontSize: 11, fontFamily: "monospace", color: "var(--text-tertiary)" }}>{item.id}</span>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", margin: "2px 0 3px" }}>{item.name}</p>
                  <p style={{ fontSize: 11, color: "var(--text-secondary)", margin: 0 }}>
                    Tipe: <span style={{ fontWeight: 600 }}>{item.type}</span> · Slot: <span style={{ fontWeight: 600 }}>{item.slot}</span>
                  </p>
                </div>
                <div style={{ fontSize: 11, color: "var(--brand)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 140 }}>
                  {item.url}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  function successMsg() {
    if (saved) {
      return (
        <div style={{
          background: "var(--green-subtle)", border: "1px solid var(--green)",
          borderRadius: 8, padding: "10px 12px", display: "flex", gap: 8, alignItems: "center",
          marginBottom: 10
        }}>
          <CheckCircle size={15} style={{ color: "var(--green)" }} />
          <span style={{ fontSize: 12, color: "var(--text-primary)" }}>Materi iklan berhasil disimpan ke repositori.</span>
        </div>
      );
    }
    return null;
  }
}

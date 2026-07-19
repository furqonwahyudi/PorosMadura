import React, { useState } from "react";
import { ShieldAlert, Save, CheckCircle, FileCode } from "lucide-react";

export default function AdsSettingsPage() {
  const [antiAdblock, setAntiAdblock] = useState(true);
  const [adsTxt, setAdsTxt] = useState(
    "# ads.txt - Google AdSense & Authorized Direct Sellers\n" +
    "google.com, pub-1029384756102938, DIRECT, f08c47fec0942fa0\n" +
    "mgid.com, 849302, RESELLER, 2819cdac92837fbc\n" +
    "porosmadura.com, direct-ad-slot-01, DIRECT"
  );
  const [saved, setSaved] = useState(false);

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
          Global Advertising Controls &amp; Verification Files
        </h1>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "4px 0 0" }}>
          Konfigurasi mitigasi pemblokir iklan (AdBlock) dan kelola berkas ads.txt otorisasi penjual iklan
        </p>
      </div>

      {saved && (
        <div style={{
          background: "var(--green-subtle)", border: "1px solid var(--green)",
          borderRadius: 8, padding: "10px 12px", display: "flex", gap: 8, alignItems: "center",
          maxWidth: 600
        }}>
          <CheckCircle size={15} style={{ color: "var(--green)" }} />
          <span style={{ fontSize: 12, color: "var(--text-primary)" }}>Pengaturan iklan global berhasil diperbarui.</span>
        </div>
      )}

      <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 600 }}>
        
        {/* Anti-AdBlock settings block */}
        <div style={{
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: 12, padding: 20, display: "flex", flexDirection: "column", gap: 14
        }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 4px", display: "flex", alignItems: "center", gap: 6 }}>
                <ShieldAlert size={15} style={{ color: "var(--brand)" }} /> Anti-AdBlock Detection Mitigation
              </h2>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0 }}>
                Deteksi penggunaan ekstensi pemblokir iklan pada peramban pembaca berita dan tampilkan jendela modal permintaan mematikan AdBlock.
              </p>
            </div>
            
            {/* Toggle switch */}
            <div
              onClick={() => setAntiAdblock(v => !v)}
              style={{
                width: 44, height: 24, borderRadius: 99, flexShrink: 0,
                background: antiAdblock ? "var(--brand)" : "var(--bg-muted)",
                position: "relative", transition: "background 0.2s", cursor: "pointer",
                marginTop: 4
              }}
            >
              <div style={{
                position: "absolute", top: 4, left: antiAdblock ? 23 : 4,
                width: 16, height: 16, borderRadius: "50%",
                background: "#fff", transition: "left 0.2s",
                boxShadow: "0 1px 4px rgba(0,0,0,0.25)"
              }} />
            </div>
          </div>
        </div>

        {/* Ads.txt terminal block */}
        <div style={{
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: 12, padding: 20, display: "flex", flexDirection: "column", gap: 14
        }}>
          <div>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 4px", display: "flex", alignItems: "center", gap: 6 }}>
              <FileCode size={15} style={{ color: "var(--brand)" }} /> Direct Ads.txt Terminal Editor
            </h2>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0 }}>
              Edit berkas verifikasi ads.txt yang berada pada root direktori server web publik.
            </p>
          </div>

          <textarea
            value={adsTxt} onChange={e => setAdsTxt(e.target.value)}
            rows={8}
            style={{
              width: "100%", padding: "10px 12px", background: "var(--bg-subtle)",
              border: "1px solid var(--border)", borderRadius: 8, fontSize: 12,
              fontFamily: "monospace", color: "var(--text-primary)", outline: "none",
              boxSizing: "border-box", resize: "none", lineHeight: 1.5
            }}
            required
          />
        </div>

        {/* Submit */}
        <div>
          <button type="submit" style={{
            display: "flex", alignItems: "center", gap: 7, padding: "10px 20px",
            background: "var(--brand)", border: "none", borderRadius: 8,
            cursor: "pointer", color: "#fff", fontSize: 13, fontWeight: 600
          }}>
            <Save size={14} /> Simpan Pengaturan Global
          </button>
        </div>

      </form>
    </div>
  );
}

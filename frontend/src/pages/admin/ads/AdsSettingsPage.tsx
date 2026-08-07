import React, { useState, useEffect } from "react";
import { ShieldAlert, Save, CheckCircle, FileCode, Loader2 } from "lucide-react";
import { adminApi } from "../../../lib/adminApi";
import { useDialog } from "../../../context/DialogContext";

export default function AdsSettingsPage() {
  const { showToast } = useDialog();
  const [loading, setLoading] = useState(true);
  const [antiAdblock, setAntiAdblock] = useState(true);
  const [adsTxt, setAdsTxt] = useState("");
  const [globalHeaderScript, setGlobalHeaderScript] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await adminApi.get<any>("/api/settings");
      if (res && res.success) {
        const adSet = res.data.adSettings || {};
        setAntiAdblock(adSet.antiAdblock !== false);
        setAdsTxt(adSet.adsTxt || "");
        setGlobalHeaderScript(adSet.globalHeaderScript || "");
      }
    } catch (err) {
      console.error("Gagal mengambil pengaturan iklan global", err);
      showToast("Gagal memuat pengaturan dari server.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const updatedAdSettings = {
        antiAdblock,
        adsTxt,
        globalHeaderScript
      };
      const res = await adminApi.put<any>("/api/settings", {
        adSettings: updatedAdSettings
      });
      if (res && res.success) {
        showToast("Pengaturan iklan global berhasil disimpan ke database!", "success");
      }
    } catch (err) {
      console.error("Gagal menyimpan pengaturan iklan", err);
      showToast("Gagal menyimpan pengaturan ke server.", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "40px", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, color: "var(--text-secondary)" }}>
        <Loader2 size={16} className="animate-spin" />
        <span style={{ fontSize: 13 }}>Memuat pengaturan iklan...</span>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 20 }} className="animate-fade-in">
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", margin: 0, letterSpacing: -0.5 }}>
          Global Advertising Controls &amp; Verification Files
        </h1>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "4px 0 0" }}>
          Konfigurasi mitigasi pemblokir iklan (AdBlock), script header programmatic, dan kelola berkas ads.txt otorisasi penjual iklan
        </p>
      </div>

      <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 600 }}>
        
        {/* Global Ads Header Script (AdSense/MGID Script Injection) */}
        <div style={{
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: 12, padding: 20, display: "flex", flexDirection: "column", gap: 14
        }}>
          <div>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 4px", display: "flex", alignItems: "center", gap: 6 }}>
              <FileCode size={15} style={{ color: "var(--brand)" }} /> Global Ad Network Header Scripts (<span style={{ fontFamily: "monospace" }}>&lt;head&gt;</span> Script)
            </h2>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0 }}>
              Tempel script tag dari jaringan iklan (seperti Google AdSense Auto Ads Script, kode integrasi header MGID, atau analitik eksternal) di sini. Kode ini akan otomatis dimuat pada bagian kepala (<span style={{ fontFamily: "monospace" }}>&lt;head&gt;</span>) portal berita utama.
            </p>
          </div>

          <textarea
            value={globalHeaderScript} onChange={e => setGlobalHeaderScript(e.target.value)}
            rows={6}
            placeholder={`Contoh:
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-xxxxxxxxxxxxxxxx" crossorigin="anonymous"></script>`}
            style={{
              width: "100%", padding: "10px 12px", background: "var(--bg-subtle)",
              border: "1px solid var(--border)", borderRadius: 8, fontSize: 12,
              fontFamily: "monospace", color: "var(--text-primary)", outline: "none",
              boxSizing: "border-box", resize: "vertical", lineHeight: 1.5
            }}
          />
        </div>

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
            rows={6}
            style={{
              width: "100%", padding: "10px 12px", background: "var(--bg-subtle)",
              border: "1px solid var(--border)", borderRadius: 8, fontSize: 12,
              fontFamily: "monospace", color: "var(--text-primary)", outline: "none",
              boxSizing: "border-box", resize: "vertical", lineHeight: 1.5
            }}
            required
          />
        </div>

        {/* Submit */}
        <div>
          <button type="submit" disabled={saving} style={{
            display: "flex", alignItems: "center", gap: 7, padding: "10px 20px",
            background: "var(--brand)", border: "none", borderRadius: 8,
            cursor: saving ? "not-allowed" : "pointer", color: "#fff", fontSize: 13, fontWeight: 600,
            opacity: saving ? 0.7 : 1
          }}>
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} 
            Simpan Pengaturan Global
          </button>
        </div>

      </form>
    </div>
  );
}

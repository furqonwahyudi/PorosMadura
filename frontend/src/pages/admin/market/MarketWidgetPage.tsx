import React, { useState } from "react";
import { Coins, Key, Save, CheckCircle, Sliders } from "lucide-react";

export default function MarketWidgetPage() {
  const [streams, setStreams] = useState({
    kurs: true,
    emas: true,
    ihsg: false,
    kripto: false,
  });
  const [apiKey, setApiKey] = useState("alpha_vantage_secret_key_1029384756");
  const [cacheDuration, setCacheDuration] = useState(15);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const toggleStream = (key: "kurs" | "emas" | "ihsg" | "kripto") => {
    setStreams(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 20 }} className="animate-fade-in">
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", margin: 0, letterSpacing: -0.5 }}>
          Financial &amp; Market Live Ticker Feed Settings
        </h1>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "4px 0 0" }}>
          Konfigurasikan aliran data pasar keuangan langsung (Ticker Feed) pada header portal berita
        </p>
      </div>

      {saved && (
        <div style={{
          background: "var(--green-subtle)", border: "1px solid var(--green)",
          borderRadius: 8, padding: "10px 12px", display: "flex", gap: 8, alignItems: "center",
          maxWidth: 600
        }}>
          <CheckCircle size={15} style={{ color: "var(--green)" }} />
          <span style={{ fontSize: 12, color: "var(--text-primary)" }}>Pengaturan market widget berhasil disimpan.</span>
        </div>
      )}

      {/* Grid: Settings configuration form */}
      <form onSubmit={handleSave} style={{
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: 12, padding: 24, display: "flex", flexDirection: "column", gap: 20,
        maxWidth: 600
      }}>
        
        {/* Streams selector block */}
        <div>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 4px", display: "flex", alignItems: "center", gap: 6 }}>
            <Coins size={15} style={{ color: "var(--brand)" }} /> Market Data Streams Selector Board
          </h2>
          <p style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 12 }}>
            Pilih jenis data yang akan ditampilkan pada ticker feed berjalan di homepage.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { key: "kurs", label: "Kurs Valas (USD/IDR)", desc: "Aliran data nilai tukar rupiah terhadap dollar AS" },
              { key: "emas", label: "Harga Emas Antam", desc: "Harga acuan emas murni Antam per gram" },
              { key: "ihsg", label: "IHSG / Indeks Saham", desc: "Indeks Harga Saham Gabungan BEI" },
              { key: "kripto", label: "Harga Kripto (BTC/IDR)", desc: "Harga bitcoin terkonversi ke rupiah" },
            ].map(item => {
              const enabled = streams[item.key as "kurs" | "emas" | "ihsg" | "kripto"];
              return (
                <div
                  key={item.key}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "10px 12px", background: "var(--bg-subtle)", borderRadius: 8,
                    border: `1px solid ${enabled ? "var(--brand)" : "var(--border)"}`
                  }}
                >
                  <div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{item.label}</span>
                    <p style={{ fontSize: 11, color: "var(--text-secondary)", margin: 0 }}>{item.desc}</p>
                  </div>
                  
                  {/* Toggle */}
                  <div
                    onClick={() => toggleStream(item.key as "kurs" | "emas" | "ihsg" | "kripto")}
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
                      boxShadow: "0 1px 4px rgba(0,0,0,0.25)"
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* API credentials & Caching block */}
        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 4px", display: "flex", alignItems: "center", gap: 6 }}>
            <Key size={15} style={{ color: "var(--brand)" }} /> API Provider Credentials &amp; Caching Engine
          </h2>
          <p style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 12 }}>
            Masukkan kredensial koneksi API eksternal (Alpha Vantage / Yahoo Finance).
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>API Key Provider *</label>
              <input
                type="text" value={apiKey} onChange={e => setApiKey(e.target.value)}
                style={{
                  width: "100%", padding: "8px 12px", background: "var(--bg-subtle)",
                  border: "1px solid var(--border)", borderRadius: 8, fontSize: 13,
                  color: "var(--text-primary)", outline: "none", boxSizing: "border-box"
                }}
                required
              />
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
                <span style={{ fontWeight: 600, color: "var(--text-secondary)" }}>Transient Cache Duration: <strong style={{ color: "var(--brand)" }}>{cacheDuration} Menit</strong></span>
              </div>
              <input
                type="range" min={5} max={60} value={cacheDuration}
                onChange={e => setCacheDuration(Number(e.target.value))}
                style={{ width: "100%", accentColor: "var(--brand)" }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--text-tertiary)", marginTop: 4 }}>
                <span>5 Menit (Boros API)</span>
                <span>60 Menit (Hemat Kuota)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <button type="submit" style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
          padding: "10px 0", background: "var(--brand)", border: "none", borderRadius: 8,
          cursor: "pointer", color: "#fff", fontSize: 13, fontWeight: 600, marginTop: 6
        }}>
          <Save size={14} /> Simpan Pengaturan
        </button>

      </form>
    </div>
  );
}

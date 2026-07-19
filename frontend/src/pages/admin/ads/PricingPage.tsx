import React, { useState } from "react";
import { DollarSign, Save, CheckCircle, Percent } from "lucide-react";

export default function PricingPage() {
  const [cpm, setCpm] = useState("15,000");
  const [cpc, setCpc] = useState("850");
  const [flat, setFlat] = useState("2,500,000");
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
          Ad Inventory Pricing Models (Rate Cards)
        </h1>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "4px 0 0" }}>
          Konfigurasikan model penetapan harga standar (Rate Cards) per impresi, klik, atau paket kontrak flat bulanan
        </p>
      </div>

      {saved && (
        <div style={{
          background: "var(--green-subtle)", border: "1px solid var(--green)",
          borderRadius: 8, padding: "10px 12px", display: "flex", gap: 8, alignItems: "center",
          maxWidth: 600
        }}>
          <CheckCircle size={15} style={{ color: "var(--green)" }} />
          <span style={{ fontSize: 12, color: "var(--text-primary)" }}>Skema harga rate card berhasil diperbarui.</span>
        </div>
      )}

      {/* Grid Configuration Matrix */}
      <form onSubmit={handleSave} style={{
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: 12, padding: 24, display: "flex", flexDirection: "column", gap: 18,
        maxWidth: 600
      }}>
        <h2 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
          Rate Card Configurator Matrix
        </h2>

        {/* CPM */}
        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>
            CPM Rate (Biaya Per 1.000 Tayangan) *
          </label>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>Rp</span>
            <input
              type="text" value={cpm} onChange={e => setCpm(e.target.value)}
              style={{
                flex: 1, padding: "8px 12px", background: "var(--bg-subtle)",
                border: "1px solid var(--border)", borderRadius: 8, fontSize: 13,
                color: "var(--text-primary)", outline: "none"
              }}
            />
            <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>per 1.000 Impressions</span>
          </div>
        </div>

        {/* CPC */}
        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>
            CPC Rate (Biaya Per Klik Pengunjung) *
          </label>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>Rp</span>
            <input
              type="text" value={cpc} onChange={e => setCpc(e.target.value)}
              style={{
                flex: 1, padding: "8px 12px", background: "var(--bg-subtle)",
                border: "1px solid var(--border)", borderRadius: 8, fontSize: 13,
                color: "var(--text-primary)", outline: "none"
              }}
            />
            <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>per Klik Banner</span>
          </div>
        </div>

        {/* Flat Rate */}
        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>
            Flat Rate Pricing (Biaya Sewa Bulanan) *
          </label>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>Rp</span>
            <input
              type="text" value={flat} onChange={e => setFlat(e.target.value)}
              style={{
                flex: 1, padding: "8px 12px", background: "var(--bg-subtle)",
                border: "1px solid var(--border)", borderRadius: 8, fontSize: 13,
                color: "var(--text-primary)", outline: "none"
              }}
            />
            <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>per 30 Hari Kontrak</span>
          </div>
        </div>

        {/* Submit */}
        <button type="submit" style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
          padding: "10px 0", background: "var(--brand)", border: "none", borderRadius: 8,
          cursor: "pointer", color: "#fff", fontSize: 13, fontWeight: 600, marginTop: 6
        }}>
          <Save size={14} /> Terapkan Skema Harga
        </button>
      </form>
    </div>
  );
}

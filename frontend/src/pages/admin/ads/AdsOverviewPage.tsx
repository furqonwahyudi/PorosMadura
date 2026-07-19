import React from "react";
import { DollarSign, Eye, MousePointer, Percent, AlertCircle, BarChart3, Calendar } from "lucide-react";

export default function AdsOverviewPage() {
  const stats = [
    { label: "Total Impressions Hari Ini", val: "142,804", change: "+12.4%", color: "var(--blue)", icon: <Eye size={18} style={{ color: "var(--blue)" }} /> },
    { label: "Total Clicks Hari Ini", val: "3,142", change: "+8.2%", color: "var(--green)", icon: <MousePointer size={18} style={{ color: "var(--green)" }} /> },
    { label: "Rata-rata CTR Global", val: "2.20%", change: "+0.15%", color: "var(--purple)", icon: <Percent size={18} style={{ color: "var(--purple)" }} /> },
    { label: "Estimasi Pendapatan Hari Ini", val: "Rp 1,420,000", change: "+15.3%", color: "var(--orange)", icon: <DollarSign size={18} style={{ color: "var(--orange)" }} /> },
  ];

  const slots = [
    { name: "Homepage Top Banner (970x90)", fillRate: 100, activeCampaign: "DPRD Sumenep", expires: "31 Jul 2026" },
    { name: "Article Middle Sidebar (300x250)", fillRate: 75, activeCampaign: "Batik Madura Festival", expires: "15 Aug 2026" },
    { name: "Article Bottom Footer (728x90)", fillRate: 50, activeCampaign: "Pemkab Bangkalan", expires: "10 Aug 2026" },
    { name: "Mobile Sticky Footer (320x50)", fillRate: 100, activeCampaign: "Yahoo Finance API Ad", expires: "01 Sep 2026" },
    { name: "Headline Inline Text Ad", fillRate: 0, activeCampaign: "None (Empty)", expires: "—" },
  ];

  return (
    <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 20 }} className="animate-fade-in">
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", margin: 0, letterSpacing: -0.5 }}>
          Advertising Dashboard &amp; Inventory Overview
        </h1>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "4px 0 0" }}>
          Metrik pendapatan iklan mandiri dan kapasitas inventori iklan portal berita
        </p>
      </div>

      {/* Stats cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        {stats.map(s => (
          <div key={s.label} style={{
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: 10, padding: "14px 16px",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontSize: 11, color: "var(--text-tertiary)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>{s.label}</span>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: "var(--bg-subtle)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {s.icon}
              </div>
            </div>
            <p style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 4px" }}>{s.val}</p>
            <span style={{ fontSize: 11, color: "var(--green)", fontWeight: 600 }}>{s.change} vs kemarin</span>
          </div>
        ))}
      </div>

      {/* Inventory capacity progress */}
      <div style={{
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: 12, padding: 20, display: "flex", flexDirection: "column", gap: 16
      }}>
        <div>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 4px", display: "flex", alignItems: "center", gap: 6 }}>
            <BarChart3 size={15} style={{ color: "var(--brand)" }} /> Ad Inventory Capacity &amp; Fill Rate
          </h2>
          <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0 }}>Rata-rata persentase keterisian slot iklan utama</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {slots.map(s => (
            <div key={s.name}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{s.name}</span>
                <span style={{ fontWeight: 700, color: s.fillRate === 100 ? "var(--green)" : s.fillRate === 0 ? "var(--red)" : "var(--brand)" }}>
                  {s.fillRate}% Keterisian
                </span>
              </div>
              <div style={{ height: 8, background: "var(--bg-muted)", borderRadius: 99, overflow: "hidden", marginBottom: 4 }}>
                <div style={{
                  height: "100%", width: `${s.fillRate}%`,
                  background: s.fillRate === 100 ? "var(--green)" : s.fillRate === 0 ? "var(--red)" : "var(--brand)",
                  borderRadius: 99
                }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--text-tertiary)" }}>
                <span>Kampanye: {s.activeCampaign}</span>
                <span style={{ display: "flex", alignItems: "center", gap: 3 }}><Calendar size={10} /> Exp: {s.expires}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div style={{
        background: "var(--brand-subtle)", border: "1px solid var(--brand)",
        borderRadius: 10, padding: "12px 16px", display: "flex", gap: 10, alignItems: "flex-start",
      }}>
        <AlertCircle size={15} style={{ color: "var(--brand)", flexShrink: 0, marginTop: 1 }} />
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: "var(--brand)", margin: "0 0 2px" }}>Rekomendasi Monetisasi</p>
          <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0 }}>
            Terdapat 1 slot iklan kosong (Headline Inline Text Ad). Anda dapat membuat Kampanye baru untuk mengisi slot ini atau menaruh kode programmatic fallback Google AdSense.
          </p>
        </div>
      </div>
    </div>
  );
}

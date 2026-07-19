import React, { useState } from "react";
import { FileText, Download, FileSpreadsheet, Calendar, CheckCircle } from "lucide-react";

export default function AdsReportsPage() {
  const [campaign, setCampaign] = useState("all");
  const [format, setFormat] = useState("pdf");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  const handleExport = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setReady(false);
    setTimeout(() => {
      setLoading(false);
      setReady(true);
    }, 1800);
  };

  return (
    <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 20 }} className="animate-fade-in">
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", margin: 0, letterSpacing: -0.5 }}>
          Exportable Advertising Analytical Performance Reports
        </h1>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "4px 0 0" }}>
          Ekspor laporan performa iklan untuk klien pengiklan dan arsip internal keuangan
        </p>
      </div>

      {ready && (
        <div style={{
          background: "var(--green-subtle)", border: "1px solid var(--green)",
          borderRadius: 8, padding: "10px 12px", display: "flex", gap: 8, alignItems: "center",
          maxWidth: 600
        }}>
          <CheckCircle size={15} style={{ color: "var(--green)" }} />
          <span style={{ fontSize: 12, color: "var(--text-primary)" }}>Laporan berhasil dibuat! Klik link unduh di bawah form.</span>
        </div>
      )}

      <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
        
        {/* Export Form */}
        <form onSubmit={handleExport} style={{
          flex: 1, minWidth: 320, background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: 12, padding: 20, display: "flex", flexDirection: "column", gap: 14,
          maxWidth: 600
        }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
            Custom Report Generation Form
          </h2>

          {/* Select Campaign */}
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>
              Pilih Kampanye Iklan *
            </label>
            <select
              value={campaign} onChange={e => setCampaign(e.target.value)}
              style={{
                width: "100%", padding: "8px 12px", background: "var(--bg-subtle)",
                border: "1px solid var(--border)", borderRadius: 8, fontSize: 13,
                color: "var(--text-primary)", outline: "none", boxSizing: "border-box"
              }}
            >
              <option value="all">Semua Kampanye Aktif</option>
              <option value="batik">Batik Madura Festival 2026</option>
              <option value="bangkalan">DPRD Bangkalan Ad</option>
            </select>
          </div>

          {/* Date range */}
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>
                Tanggal Mulai
              </label>
              <input
                type="date"
                style={{
                  width: "100%", padding: "8px 12px", background: "var(--bg-subtle)",
                  border: "1px solid var(--border)", borderRadius: 8, fontSize: 12,
                  color: "var(--text-primary)", outline: "none", boxSizing: "border-box"
                }}
                required
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>
                Tanggal Selesai
              </label>
              <input
                type="date"
                style={{
                  width: "100%", padding: "8px 12px", background: "var(--bg-subtle)",
                  border: "1px solid var(--border)", borderRadius: 8, fontSize: 12,
                  color: "var(--text-primary)", outline: "none", boxSizing: "border-box"
                }}
                required
              />
            </div>
          </div>

          {/* Format selection */}
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>
              Format Output *
            </label>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="button" onClick={() => setFormat("pdf")}
                style={{
                  flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  padding: "9px 0", borderRadius: 8, border: "1.5px solid",
                  borderColor: format === "pdf" ? "var(--brand)" : "var(--border)",
                  background: format === "pdf" ? "var(--brand-subtle)" : "transparent",
                  color: format === "pdf" ? "var(--brand)" : "var(--text-secondary)",
                  fontSize: 12, fontWeight: 600, cursor: "pointer",
                }}
              >
                <FileText size={14} /> PDF Executive Report
              </button>
              <button
                type="button" onClick={() => setFormat("csv")}
                style={{
                  flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  padding: "9px 0", borderRadius: 8, border: "1.5px solid",
                  borderColor: format === "csv" ? "var(--brand)" : "var(--border)",
                  background: format === "csv" ? "var(--brand-subtle)" : "transparent",
                  color: format === "csv" ? "var(--brand)" : "var(--text-secondary)",
                  fontSize: 12, fontWeight: 600, cursor: "pointer",
                }}
              >
                <FileSpreadsheet size={14} /> CSV / XLSX Raw Data
              </button>
            </div>
          </div>

          {/* Submit / Generate button */}
          <button type="submit" disabled={loading} style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
            padding: "10px 0", background: "var(--brand)", border: "none", borderRadius: 8,
            cursor: loading ? "not-allowed" : "pointer", color: "#fff", fontSize: 13, fontWeight: 600, marginTop: 6,
            opacity: loading ? 0.7 : 1
          }}>
            <Download size={14} /> {loading ? "Generating Report..." : "Generate & Export Report"}
          </button>
        </form>
      </div>

      {ready && (
        <div style={{
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: 12, padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center",
          maxWidth: 600
        }}>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 2px" }}>
              {format === "pdf" ? "Executive_Ad_Report_Jul2026.pdf" : "Raw_Ad_Metrics_Jul2026.csv"}
            </p>
            <p style={{ fontSize: 11, color: "var(--text-secondary)", margin: 0 }}>
              Ukuran: {format === "pdf" ? "1.4 MB" : "320 KB"} · Siap untuk diunduh
            </p>
          </div>
          <button style={{
            display: "flex", alignItems: "center", gap: 5, padding: "8px 14px",
            background: "var(--brand)", border: "none", borderRadius: 8,
            cursor: "pointer", color: "#fff", fontSize: 12, fontWeight: 600
          }}>
            <Download size={13} /> Unduh Berkas
          </button>
        </div>
      )}
    </div>
  );
}

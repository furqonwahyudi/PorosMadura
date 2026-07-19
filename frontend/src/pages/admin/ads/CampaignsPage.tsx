import React, { useState } from "react";
import { Calendar, User, Target, Save, CheckCircle, Plus } from "lucide-react";

export default function CampaignsPage() {
  const [name, setName] = useState("");
  const [advertiser, setAdvertiser] = useState("Pemkab Bangkalan");
  const [constraintType, setConstraintType] = useState("impressions");
  const [constraintVal, setConstraintVal] = useState("");
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setName("");
      setConstraintVal("");
    }, 2000);
  };

  const campaigns = [
    { id: "CMP-01", name: "Batik Madura Festival 2026", advertiser: "Humas Sumenep", constraint: "Max 50,000 Clicks", status: "Running" },
    { id: "CMP-02", name: "DPRD Bangkalan Ad", advertiser: "Pemkab Bangkalan", constraint: "30 Hari Kontrak", status: "Running" },
    { id: "CMP-03", name: "Mandiri Ads fallback", advertiser: "Internal", constraint: "Unlimited Impressions", status: "Draft" },
  ];

  return (
    <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 20 }} className="animate-fade-in">
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", margin: 0, letterSpacing: -0.5 }}>
          Ad Campaigns &amp; Contract Management
        </h1>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "4px 0 0" }}>
          Mulai kampanye iklan dan tentukan batasan kontrak jaminan impresi/klik
        </p>
      </div>

      <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
        
        {/* Campaign creator form */}
        <form onSubmit={handleSave} style={{
          flex: 1, minWidth: 320, background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: 12, padding: 20, display: "flex", flexDirection: "column", gap: 14,
        }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 4px", display: "flex", alignItems: "center", gap: 6 }}>
            <Plus size={15} style={{ color: "var(--brand)" }} /> New Campaign Creator &amp; Contract Form
          </h2>

          {saved && (
            <div style={{
              background: "var(--green-subtle)", border: "1px solid var(--green)",
              borderRadius: 8, padding: "10px 12px", display: "flex", gap: 8, alignItems: "center",
            }}>
              <CheckCircle size={15} style={{ color: "var(--green)" }} />
              <span style={{ fontSize: 12, color: "var(--text-primary)" }}>Kampanye &amp; kontrak iklan berhasil didaftarkan.</span>
            </div>
          )}

          {/* Campaign Name */}
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Nama Kampanye Iklan *</label>
            <input
              type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder="Contoh: Kampanye Promosi Wisata Lombang"
              style={{
                width: "100%", padding: "8px 12px", background: "var(--bg-subtle)",
                border: "1px solid var(--border)", borderRadius: 8, fontSize: 13,
                color: "var(--text-primary)", outline: "none", boxSizing: "border-box"
              }}
              required
            />
          </div>

          {/* Advertiser profile */}
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Advertiser Profile *</label>
            <div style={{ position: "relative" }}>
              <User size={13} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)" }} />
              <select
                value={advertiser} onChange={e => setAdvertiser(e.target.value)}
                style={{
                  width: "100%", padding: "8px 12px 8px 32px", background: "var(--bg-subtle)",
                  border: "1px solid var(--border)", borderRadius: 8, fontSize: 13,
                  color: "var(--text-primary)", outline: "none", boxSizing: "border-box",
                  cursor: "pointer"
                }}
              >
                <option value="Pemkab Bangkalan">Pemkab Bangkalan</option>
                <option value="Pemda Sumenep">Pemda Sumenep</option>
                <option value="Batik Madura CRM">Batik Madura CRM Client</option>
                <option value="Internal">Internal / Fallback Ads</option>
              </select>
            </div>
          </div>

          {/* Goal constraints */}
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Campaign Goal Constraints *</label>
            <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
              {[
                { key: "impressions", label: "Max Impressions" },
                { key: "clicks", label: "Max Clicks" },
                { key: "time", label: "Rentang Waktu" },
              ].map(c => (
                <button
                  type="button" key={c.key} onClick={() => setConstraintType(c.key)}
                  style={{
                    flex: 1, padding: "8px 0", borderRadius: 8, border: "1.5px solid",
                    borderColor: constraintType === c.key ? "var(--brand)" : "var(--border)",
                    background: constraintType === c.key ? "var(--brand-subtle)" : "transparent",
                    color: constraintType === c.key ? "var(--brand)" : "var(--text-secondary)",
                    fontSize: 11, fontWeight: 600, cursor: "pointer",
                  }}
                >
                  {c.label}
                </button>
              ))}
            </div>
            
            {constraintType !== "time" ? (
              <input
                type="number" value={constraintVal} onChange={e => setConstraintVal(e.target.value)}
                placeholder={constraintType === "impressions" ? "Jumlah target impresi (misal: 100000)" : "Jumlah target klik (misal: 5000)"}
                style={{
                  width: "100%", padding: "8px 12px", background: "var(--bg-subtle)",
                  border: "1px solid var(--border)", borderRadius: 8, fontSize: 13,
                  color: "var(--text-primary)", outline: "none", boxSizing: "border-box"
                }}
                required
              />
            ) : (
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  type="date"
                  style={{
                    flex: 1, padding: "8px 12px", background: "var(--bg-subtle)",
                    border: "1px solid var(--border)", borderRadius: 8, fontSize: 12,
                    color: "var(--text-primary)", outline: "none", boxSizing: "border-box"
                  }}
                  required
                />
                <input
                  type="date"
                  style={{
                    flex: 1, padding: "8px 12px", background: "var(--bg-subtle)",
                    border: "1px solid var(--border)", borderRadius: 8, fontSize: 12,
                    color: "var(--text-primary)", outline: "none", boxSizing: "border-box"
                  }}
                  required
                />
              </div>
            )}
          </div>

          {/* Submit */}
          <button type="submit" style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
            padding: "10px 0", background: "var(--brand)", border: "none", borderRadius: 8,
            cursor: "pointer", color: "#fff", fontSize: 13, fontWeight: 600, marginTop: 6
          }}>
            <Target size={14} /> Daftarkan Kampanye
          </button>
        </form>

        {/* Campaign List */}
        <div style={{ flex: 1.2, minWidth: 320, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 20 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 12px" }}>
            Daftar Kampanye Aktif
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {campaigns.map(c => (
              <div key={c.id} style={{
                border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px",
                display: "flex", justifyContent: "space-between", alignItems: "center"
              }}>
                <div>
                  <span style={{ fontSize: 11, fontFamily: "monospace", color: "var(--text-tertiary)" }}>{c.id}</span>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", margin: "2px 0 3px" }}>{c.name}</p>
                  <p style={{ fontSize: 11, color: "var(--text-secondary)", margin: 0 }}>
                    Advertiser: <span style={{ fontWeight: 600 }}>{c.advertiser}</span> · Batasan: <span style={{ fontWeight: 600 }}>{c.constraint}</span>
                  </p>
                </div>
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 4,
                  fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 20,
                  background: c.status === "Running" ? "var(--green-subtle)" : "var(--bg-muted)",
                  color: c.status === "Running" ? "var(--green)" : "var(--text-secondary)"
                }}>
                  {c.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

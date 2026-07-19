import React, { useState } from "react";
import { Calendar, Save, CheckCircle, Clock } from "lucide-react";

export default function ScheduledAdsPage() {
  const [adName, setAdName] = useState("Batik Madura Event Banner");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setStartDate("");
      setEndDate("");
    }, 2000);
  };

  const scheduleList = [
    { name: "Batik Madura Event Banner", start: "2026-08-01 00:00", end: "2026-08-15 23:59", status: "Scheduled" },
    { name: "DPRD Bangkalan Rilis Pers", start: "2026-07-20 08:00", end: "2026-07-27 18:00", status: "Scheduled" },
    { name: "Pariwisata Sumenep Promo", start: "2026-06-01 00:00", end: "2026-06-30 23:59", status: "Ended" },
  ];

  return (
    <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 20 }} className="animate-fade-in">
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", margin: 0, letterSpacing: -0.5 }}>
          Automated Ad Publication Flight Scheduler
        </h1>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "4px 0 0" }}>
          Jadwalkan peluncuran penayangan (Flight) iklan dan copot banner otomatis
        </p>
      </div>

      <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
        
        {/* Scheduler Form */}
        <form onSubmit={handleSave} style={{
          flex: 1, minWidth: 320, background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: 12, padding: 20, display: "flex", flexDirection: "column", gap: 14
        }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
            Configure New Flight Schedule
          </h2>

          {saved && (
            <div style={{
              background: "var(--green-subtle)", border: "1px solid var(--green)",
              borderRadius: 8, padding: "10px 12px", display: "flex", gap: 8, alignItems: "center"
            }}>
              <CheckCircle size={15} style={{ color: "var(--green)" }} />
              <span style={{ fontSize: 12, color: "var(--text-primary)" }}>Flight penayangan berhasil dijadwalkan.</span>
            </div>
          )}

          {/* Ad Material */}
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>
              Materi Iklan *
            </label>
            <select
              value={adName} onChange={e => setAdName(e.target.value)}
              style={{
                width: "100%", padding: "8px 12px", background: "var(--bg-subtle)",
                border: "1px solid var(--border)", borderRadius: 8, fontSize: 13,
                color: "var(--text-primary)", outline: "none", boxSizing: "border-box"
              }}
            >
              <option value="Batik Madura Event Banner">Batik Madura Event Banner (300x250)</option>
              <option value="DPRD Bangkalan Rilis Pers">DPRD Bangkalan Rilis Pers (728x90)</option>
              <option value="Pariwisata Sumenep Promo">Pariwisata Sumenep Promo (970x90)</option>
            </select>
          </div>

          {/* Date Range Fields */}
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>
              Start Flight Date &amp; Time *
            </label>
            <input
              type="datetime-local" value={startDate} onChange={e => setStartDate(e.target.value)}
              style={{
                width: "100%", padding: "8px 12px", background: "var(--bg-subtle)",
                border: "1px solid var(--border)", borderRadius: 8, fontSize: 13,
                color: "var(--text-primary)", outline: "none", boxSizing: "border-box"
              }}
              required
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>
              End Flight Date &amp; Time *
            </label>
            <input
              type="datetime-local" value={endDate} onChange={e => setEndDate(e.target.value)}
              style={{
                width: "100%", padding: "8px 12px", background: "var(--bg-subtle)",
                border: "1px solid var(--border)", borderRadius: 8, fontSize: 13,
                color: "var(--text-primary)", outline: "none", boxSizing: "border-box"
              }}
              required
            />
          </div>

          {/* Submit */}
          <button type="submit" style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
            padding: "10px 0", background: "var(--brand)", border: "none", borderRadius: 8,
            cursor: "pointer", color: "#fff", fontSize: 13, fontWeight: 600, marginTop: 6
          }}>
            <Calendar size={14} /> Terapkan Flight Jadwal
          </button>
        </form>

        {/* Queue list */}
        <div style={{ flex: 1.2, minWidth: 320, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 20 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 12px" }}>
            Chronological Ad Deployment Queue
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {scheduleList.map((s, idx) => (
              <div key={idx} style={{
                border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px",
                display: "flex", justifyContent: "space-between", alignItems: "center"
              }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 4px" }}>{s.name}</p>
                  <p style={{ fontSize: 11, color: "var(--text-secondary)", margin: 0, display: "flex", alignItems: "center", gap: 4 }}>
                    <Clock size={11} /> {s.start} s/d {s.end}
                  </p>
                </div>
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 4,
                  fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 20,
                  background: s.status === "Scheduled" ? "var(--blue-subtle)" : "var(--bg-muted)",
                  color: s.status === "Scheduled" ? "var(--blue)" : "var(--text-secondary)"
                }}>
                  {s.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

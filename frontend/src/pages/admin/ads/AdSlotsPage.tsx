import React, { useState } from "react";
import { Layers, Plus, Trash2, Edit2, Play, Circle, CheckCircle2 } from "lucide-react";

export default function AdSlotsPage() {
  const [slots, setSlots] = useState([
    { id: "SLOT-01", name: "Homepage Top Banner", size: "970x90 px", status: "Active" },
    { id: "SLOT-02", name: "Article Middle Sidebar", size: "300x250 px", status: "Active" },
    { id: "SLOT-03", name: "Article Bottom Footer", size: "728x90 px", status: "Active" },
    { id: "SLOT-04", name: "Mobile Sticky Footer", size: "320x50 px", status: "Active" },
    { id: "SLOT-05", name: "Headline Inline Text Ad", size: "Responsive", status: "Empty" },
  ]);

  return (
    <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 20 }} className="animate-fade-in">
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", margin: 0, letterSpacing: -0.5 }}>
            Website Layout Ad Zones Configuration
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "4px 0 0" }}>
            Daftar zona penempatan dan ukuran media banner di seluruh tata letak web
          </p>
        </div>
        <button style={{
          display: "flex", alignItems: "center", gap: 7, padding: "8px 16px",
          background: "var(--brand)", border: "none", borderRadius: 8,
          cursor: "pointer", color: "#fff", fontSize: 13, fontWeight: 600,
        }}>
          <Plus size={15} /> Tambah Slot Zona
        </button>
      </div>

      {/* Ad Registry Table */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
        <div style={{
          display: "grid", gridTemplateColumns: "100px 2fr 150px 120px 100px",
          gap: 12, padding: "10px 16px",
          background: "var(--bg-subtle)", borderBottom: "1px solid var(--border)",
        }}>
          {["ID Slot", "Nama Lokasi Slot", "Target Dimensi", "Status Slot", "Aksi"].map(h => (
            <span key={h} style={{ fontSize: 11, fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</span>
          ))}
        </div>

        {slots.map((s, i) => (
          <div key={s.id} style={{
            display: "grid", gridTemplateColumns: "100px 2fr 150px 120px 100px",
            gap: 12, padding: "13px 16px", alignItems: "center",
            borderBottom: i < slots.length - 1 ? "1px solid var(--border)" : "none",
          }}>
            <span style={{ fontSize: 12, fontFamily: "monospace", color: "var(--text-secondary)" }}>{s.id}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{s.name}</span>
            <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{s.size}</span>
            
            {/* Status */}
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 20,
              background: s.status === "Active" ? "var(--green-subtle)" : "var(--red-subtle)",
              color: s.status === "Active" ? "var(--green)" : "var(--red)",
            }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: "currentColor" }} />
              {s.status === "Active" ? "Aktif" : "Kosong"}
            </span>

            {/* Actions */}
            <div style={{ display: "flex", gap: 5 }}>
              <button style={{ padding: "5px 8px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--bg-subtle)", color: "var(--text-secondary)", cursor: "pointer" }}>
                <Edit2 size={12} />
              </button>
              <button style={{ padding: "5px 8px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--bg-subtle)", color: "var(--red)", cursor: "pointer" }}>
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

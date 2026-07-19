import React from "react";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "../../../lib/adminApi";
import { Layers, Circle, CheckCircle2, Loader2 } from "lucide-react";

interface AdSlot {
  id: string;
  name: string;
  slug: string;
  size: string;
  type: string;
  page: string;
  isActive: boolean;
  _count?: {
    ads: number;
  };
}

export default function AdSlotsPage() {
  // Query for ad slots from database
  const { data: slotsRes, isLoading, error } = useQuery<{ success: boolean; data: AdSlot[] }>({
    queryKey: ["admin", "ads", "slots"],
    queryFn: async () => {
      return adminApi.get<any>("/api/ads/slots");
    }
  });

  const slots = slotsRes?.data || [];

  return (
    <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 20 }} className="animate-fade-in">
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", margin: 0, letterSpacing: -0.5 }}>
            Website Layout Ad Zones Configuration
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "4px 0 0" }}>
            Daftar zona penempatan dan ukuran media banner aktif di seluruh tata letak web (Database Terintegrasi)
          </p>
        </div>
      </div>

      {/* Ad Registry Table */}
      {isLoading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "40px 0", color: "var(--text-secondary)", fontSize: 13, alignItems: "center" }}>
          <Loader2 className="animate-spin" size={16} style={{ marginRight: 8 }} />
          Memuat data slot dari database...
        </div>
      ) : error ? (
        <div style={{ padding: 16, background: "var(--red-subtle)", color: "var(--red)", borderRadius: 8, fontSize: 13 }}>
          Gagal memuat slot iklan dari server: {(error as any).message}
        </div>
      ) : slots.length === 0 ? (
        <div style={{ padding: 24, textAlign: "center", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, color: "var(--text-secondary)", fontSize: 13 }}>
          Tidak ada slot iklan terdaftar di database.
        </div>
      ) : (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
          <div style={{
            display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr 100px 100px",
            gap: 12, padding: "10px 16px",
            background: "var(--bg-subtle)", borderBottom: "1px solid var(--border)",
          }}>
            {["Nama Zona Iklan", "Slug / Penanda", "Dimensi", "Tipe Slot", "Iklan Aktif", "Status"].map(h => (
              <span key={h} style={{ fontSize: 11, fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</span>
            ))}
          </div>

          {slots.map((s, i) => (
            <div key={s.id} style={{
              display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr 100px 100px",
              gap: 12, padding: "13px 16px", alignItems: "center",
              borderBottom: i < slots.length - 1 ? "1px solid var(--border)" : "none",
            }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{s.name}</span>
              <span style={{ fontSize: 12, fontFamily: "monospace", color: "var(--text-secondary)" }}>{s.slug}</span>
              <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text-primary)" }}>{s.size}</span>
              <span style={{ fontSize: 12, color: "var(--text-secondary)", textTransform: "capitalize" }}>{s.type.toLowerCase()}</span>
              <span style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 600 }}>{s._count?.ads ?? 0}</span>
              
              {/* Status */}
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 20,
                background: s.isActive ? "var(--green-subtle)" : "var(--red-subtle)",
                color: s.isActive ? "var(--green)" : "var(--red)",
                width: "fit-content"
              }}>
                <div style={{ width: 5, height: 5, borderRadius: "50%", background: "currentColor" }} />
                {s.isActive ? "Aktif" : "Nonaktif"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

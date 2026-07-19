import React, { useState } from "react";
import { Plus, Search, Mail, Phone, User, Home, HelpCircle } from "lucide-react";

export default function AdvertisersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "Paid" | "Pending" | "Unpaid">("all");

  const advertisers = [
    { id: "ADV-01", company: "Humas Kabupaten Sumenep", pic: "Budi Santoso", whatsapp: "081234567890", email: "humas@sumenep.go.id", invoiceStatus: "Paid" },
    { id: "ADV-02", company: "DPRD Bangkalan", pic: "Siti Rahmah", whatsapp: "081298765432", email: "dprd@bangkalan.go.id", invoiceStatus: "Pending" },
    { id: "ADV-03", company: "CV Batik Madura Utama", pic: "Ahmad Syafi'i", whatsapp: "085678901234", email: "finance@batikmadura.com", invoiceStatus: "Paid" },
    { id: "ADV-04", company: "Pemkab Sampang", pic: "Hasan Basri", whatsapp: "087812345678", email: "pembelian@sampang.go.id", invoiceStatus: "Unpaid" },
  ];

  const filtered = advertisers.filter(a => {
    if (statusFilter !== "all" && a.invoiceStatus !== statusFilter) return false;
    if (search && !a.company.toLowerCase().includes(search.toLowerCase()) && !a.pic.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 20 }} className="animate-fade-in">
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", margin: 0, letterSpacing: -0.5 }}>
            Client &amp; Advertiser CRM Profiles
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "4px 0 0" }}>
            Kelola kontak profil klien pemasang iklan beserta status tagihan faktur/keuangan
          </p>
        </div>
        <button style={{
          display: "flex", alignItems: "center", gap: 7, padding: "8px 16px",
          background: "var(--brand)", border: "none", borderRadius: 8,
          cursor: "pointer", color: "#fff", fontSize: 13, fontWeight: 600,
        }}>
          <Plus size={15} /> Tambah Kontak Klien
        </button>
      </div>

      {/* Filter bar */}
      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ position: "relative", width: 320 }}>
          <Search size={13} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)" }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari nama perusahaan atau PIC..."
            style={{ width: "100%", padding: "8px 10px 8px 32px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 13, color: "var(--text-primary)", outline: "none", boxSizing: "border-box" }}
          />
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {([
            { key: "all", label: "Semua Invoice" },
            { key: "Paid", label: "Paid" },
            { key: "Pending", label: "Pending" },
            { key: "Unpaid", label: "Unpaid" },
          ] as const).map(tab => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setStatusFilter(tab.key)}
              style={{
                padding: "6px 12px", borderRadius: 8, border: "1px solid",
                fontSize: 12, fontWeight: 600, cursor: "pointer",
                borderColor: statusFilter === tab.key ? "var(--brand)" : "var(--border)",
                background: statusFilter === tab.key ? "var(--brand-subtle)" : "var(--surface)",
                color: statusFilter === tab.key ? "var(--brand)" : "var(--text-secondary)",
                transition: "all 0.15s"
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Advertiser Directory Table */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
        {/* Table Header */}
        <div style={{
          display: "grid", gridTemplateColumns: "100px 2fr 1.5fr 2fr 120px 100px",
          gap: 12, padding: "10px 16px",
          background: "var(--bg-subtle)", borderBottom: "1px solid var(--border)",
        }}>
          {["ID Client", "Nama Perusahaan", "Nama PIC", "Kontak", "Status Invoice", "Aksi"].map(h => (
            <span key={h} style={{ fontSize: 11, fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</span>
          ))}
        </div>

        {filtered.map((adv, i) => (
          <div key={adv.id} style={{
            display: "grid", gridTemplateColumns: "100px 2fr 1.5fr 2fr 120px 100px",
            gap: 12, padding: "13px 16px", alignItems: "center",
            borderBottom: i < filtered.length - 1 ? "1px solid var(--border)" : "none",
          }}>
            {/* ID */}
            <span style={{ fontSize: 12, fontFamily: "monospace", color: "var(--text-secondary)" }}>{adv.id}</span>

            {/* Company Name */}
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{adv.company}</span>

            {/* PIC */}
            <span style={{ fontSize: 13, color: "var(--text-primary)" }}>{adv.pic}</span>

            {/* Contacts */}
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <span style={{ fontSize: 12, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 4 }}>
                <Phone size={11} style={{ color: "var(--text-tertiary)" }} /> {adv.whatsapp}
              </span>
              <span style={{ fontSize: 11, color: "var(--text-tertiary)", display: "flex", alignItems: "center", gap: 4 }}>
                <Mail size={11} style={{ color: "var(--text-tertiary)" }} /> {adv.email}
              </span>
            </div>

            {/* Status */}
            <div>
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 20,
                background: adv.invoiceStatus === "Paid" ? "var(--green-subtle)" : adv.invoiceStatus === "Pending" ? "var(--yellow-subtle)" : "var(--red-subtle)",
                color: adv.invoiceStatus === "Paid" ? "var(--green)" : adv.invoiceStatus === "Pending" ? "var(--yellow)" : "var(--red)"
              }}>
                <div style={{ width: 5, height: 5, borderRadius: "50%", background: "currentColor" }} />
                {adv.invoiceStatus}
              </span>
            </div>

            {/* Action buttons */}
            <div style={{ display: "flex", gap: 6 }}>
              <button style={{ padding: "5px 8px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--bg-subtle)", color: "var(--text-secondary)", cursor: "pointer", fontSize: 11 }}>
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

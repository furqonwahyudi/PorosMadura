import React, { useState } from "react";
import ReactDOM from "react-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../../../lib/adminApi";
import { useDialog } from "../../../context/DialogContext";
import { Plus, Search, Mail, Phone, Loader2, X, Trash2, Building2, User, AtSign, Smartphone, UserPlus } from "lucide-react";

interface Advertiser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company: string;
  isActive: boolean;
  createdAt: string;
  _count?: {
    campaigns: number;
    ads: number;
  };
}

export default function AdvertisersPage() {
  const queryClient = useQueryClient();
  const { showConfirm, showToast } = useDialog();
  
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Form state
  const [company, setCompany] = useState("");
  const [picName, setPicName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Query advertisers
  const { data: advertisersRes, isLoading } = useQuery<{ success: boolean; data: Advertiser[] }>({
    queryKey: ["admin", "advertisers"],
    queryFn: async () => {
      return adminApi.get<any>("/api/ads/advertisers");
    }
  });

  const advertisers = advertisersRes?.data || [];

  // Mutations
  const createMutation = useMutation({
    mutationFn: async (newAdv: { name: string; email: string; phone: string; company: string }) => {
      return adminApi.post("/api/ads/advertisers", newAdv);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "advertisers"] });
      showToast("Pengiklan baru berhasil ditambahkan!");
      setShowAddModal(false);
      setCompany("");
      setPicName("");
      setEmail("");
      setPhone("");
    },
    onError: (err: any) => {
      showToast(`Gagal menyimpan: ${err.response?.data?.message || err.message}`, "error");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return adminApi.delete(`/api/ads/advertisers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "advertisers"] });
      showToast("Profil pengiklan berhasil dihapus!");
    },
    onError: (err: any) => {
      showToast(`Gagal menghapus: ${err.message}`, "error");
    }
  });

  const handleDelete = (id: string, name: string) => {
    showConfirm(
      `Apakah Anda yakin ingin menghapus profil pengiklan "${name}"? Seluruh kampanye terkait juga akan terhapus.`,
      () => { deleteMutation.mutate(id); },
      "Hapus Pengiklan",
      { type: "danger", confirmText: "Ya, Hapus", cancelText: "Batal" }
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim() || !picName.trim() || !email.trim()) {
      showToast("Nama Perusahaan, Nama PIC, dan Email wajib diisi!", "warning");
      return;
    }
    createMutation.mutate({ company, name: picName, email, phone });
  };

  const filtered = advertisers.filter(a => {
    if (!search) return true;
    return (
      a.company.toLowerCase().includes(search.toLowerCase()) ||
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase())
    );
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
            Kelola kontak profil klien pemasang iklan beserta status tagihan faktur/keuangan (Database Terintegrasi)
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          style={{
            display: "flex", alignItems: "center", gap: 7, padding: "8px 16px",
            background: "var(--brand)", border: "none", borderRadius: 8,
            cursor: "pointer", color: "#fff", fontSize: 13, fontWeight: 600,
          }}
        >
          <Plus size={15} /> Tambah Kontak Klien
        </button>
      </div>

      {/* Filter bar */}
      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ position: "relative", width: 320 }}>
          <Search size={13} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)" }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari nama perusahaan, PIC, atau email..."
            style={{ width: "100%", padding: "8px 10px 8px 32px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 13, color: "var(--text-primary)", outline: "none", boxSizing: "border-box" }}
          />
        </div>
      </div>

      {/* Advertiser Directory Table */}
      {isLoading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "40px 0", color: "var(--text-secondary)", fontSize: 13, alignItems: "center" }}>
          <Loader2 className="animate-spin" size={16} style={{ marginRight: 8 }} />
          Memuat data pengiklan dari database...
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: 24, textAlign: "center", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, color: "var(--text-secondary)", fontSize: 13 }}>
          Tidak ada pengiklan terdaftar di database.
        </div>
      ) : (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
          <div style={{
            display: "grid", gridTemplateColumns: "2fr 1.5fr 2fr 100px 100px 80px",
            gap: 12, padding: "10px 16px",
            background: "var(--bg-subtle)", borderBottom: "1px solid var(--border)",
          }}>
            {["Nama Perusahaan", "Nama PIC", "Kontak", "Kampanye", "Iklan Aktif", "Aksi"].map(h => (
              <span key={h} style={{ fontSize: 11, fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</span>
            ))}
          </div>

          {filtered.map((adv, i) => (
            <div key={adv.id} style={{
              display: "grid", gridTemplateColumns: "2fr 1.5fr 2fr 100px 100px 80px",
              gap: 12, padding: "13px 16px", alignItems: "center",
              borderBottom: i < filtered.length - 1 ? "1px solid var(--border)" : "none",
            }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{adv.company}</span>
              <span style={{ fontSize: 13, color: "var(--text-primary)" }}>{adv.name}</span>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <span style={{ fontSize: 12, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 4 }}>
                  <Phone size={11} style={{ color: "var(--text-tertiary)" }} /> {adv.phone || "-"}
                </span>
                <span style={{ fontSize: 11, color: "var(--text-tertiary)", display: "flex", alignItems: "center", gap: 4 }}>
                  <Mail size={11} style={{ color: "var(--text-tertiary)" }} /> {adv.email}
                </span>
              </div>
              <span style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 500 }}>{adv._count?.campaigns ?? 0}</span>
              <span style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 500 }}>{adv._count?.ads ?? 0}</span>
              <div style={{ display: "flex", gap: 6 }}>
                <button
                  onClick={() => handleDelete(adv.id, adv.company)}
                  style={{ padding: "5px 8px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--bg-subtle)", color: "var(--red)", cursor: "pointer", display: "flex", alignItems: "center" }}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────
          Add Advertiser Modal — Premium Design
      ───────────────────────────────────────────────────────── */}
      {showAddModal && ReactDOM.createPortal(
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setShowAddModal(false); }}
          style={{
            position: "fixed",
            top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(0,0,0,0.60)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            zIndex: 9999,
            paddingTop: 40,
            paddingBottom: 24,
            paddingLeft: 16,
            paddingRight: 16,
            boxSizing: "border-box",
            overflowY: "auto",
          }}
        >
          {/* Single card child — no adjacent JSX issue */}
          <div style={{
            background: "var(--surface)",
            borderRadius: 20,
            width: "100%",
            maxWidth: 456,
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 20px 60px -10px rgba(0,0,0,0.40), 0 0 0 1px rgba(0,0,0,0.07)",
          }}>

            {/* Inject keyframe via style tag INSIDE card — single child of overlay */}
            <style>{`
              @keyframes advModalIn {
                from { opacity: 0; transform: translateY(-12px); }
                to   { opacity: 1; transform: translateY(0); }
              }
            `}</style>

            {/* ── Gradient header ── */}
            <div style={{
              background: "linear-gradient(135deg, #D60000 0%, #8B0000 100%)",
              padding: "22px 22px 18px",
              borderRadius: "20px 20px 0 0",
              position: "relative",
              overflow: "hidden",
              flexShrink: 0,
              animation: "advModalIn 0.22s ease-out both",
            }}>
              <div style={{ position: "absolute", top: -30, right: -30, width: 115, height: 115, borderRadius: "50%", background: "rgba(255,255,255,0.08)", pointerEvents: "none" }} />
              <div style={{ position: "absolute", bottom: -20, left: -20, width: 78, height: 78, borderRadius: "50%", background: "rgba(255,255,255,0.05)", pointerEvents: "none" }} />

              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                style={{
                  position: "absolute", top: 12, right: 12, zIndex: 2,
                  background: "rgba(255,255,255,0.18)", border: "none",
                  borderRadius: 8, width: 30, height: 30,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", cursor: "pointer",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.28)")}
                onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.18)")}
              >
                <X size={14} />
              </button>

              <div style={{ display: "flex", alignItems: "center", gap: 14, position: "relative", zIndex: 1 }}>
                <div style={{
                  width: 46, height: 46, borderRadius: 13,
                  background: "rgba(255,255,255,0.20)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <UserPlus size={21} color="#fff" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#fff", letterSpacing: -0.3 }}>
                    Tambah Kontak Klien
                  </h3>
                  <p style={{ margin: "3px 0 0", fontSize: 12, color: "rgba(255,255,255,0.75)", lineHeight: 1.4 }}>
                    Isi data profil pengiklan baru
                  </p>
                </div>
              </div>
            </div>

            {/* ── Form body ── */}
            <form onSubmit={handleSave} style={{ padding: "20px 22px 22px", display: "flex", flexDirection: "column", gap: 15 }}>

              {/* Nama Perusahaan */}
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 7 }}>
                  Nama Perusahaan <span style={{ color: "#D60000" }}>*</span>
                </label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)", pointerEvents: "none" }}>
                    <Building2 size={15} />
                  </span>
                  <input
                    value={company} onChange={e => setCompany(e.target.value)}
                    placeholder="Contoh: Pemkab Pamekasan" required
                    style={{ width: "100%", padding: "11px 13px 11px 40px", border: "1.5px solid var(--border)", borderRadius: 10, background: "var(--bg-subtle)", fontSize: 13, color: "var(--text-primary)", outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
                    onFocus={e => { e.target.style.borderColor = "#D60000"; e.target.style.boxShadow = "0 0 0 3px rgba(214,0,0,0.10)"; e.target.style.background = "var(--surface)"; }}
                    onBlur={e => { e.target.style.borderColor = "var(--border)"; e.target.style.boxShadow = "none"; e.target.style.background = "var(--bg-subtle)"; }}
                  />
                </div>
              </div>

              {/* Nama PIC */}
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 7 }}>
                  Nama PIC / Penghubung <span style={{ color: "#D60000" }}>*</span>
                </label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)", pointerEvents: "none" }}>
                    <User size={15} />
                  </span>
                  <input
                    value={picName} onChange={e => setPicName(e.target.value)}
                    placeholder="Contoh: Achmad Syafi'i" required
                    style={{ width: "100%", padding: "11px 13px 11px 40px", border: "1.5px solid var(--border)", borderRadius: 10, background: "var(--bg-subtle)", fontSize: 13, color: "var(--text-primary)", outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
                    onFocus={e => { e.target.style.borderColor = "#D60000"; e.target.style.boxShadow = "0 0 0 3px rgba(214,0,0,0.10)"; e.target.style.background = "var(--surface)"; }}
                    onBlur={e => { e.target.style.borderColor = "var(--border)"; e.target.style.boxShadow = "none"; e.target.style.background = "var(--bg-subtle)"; }}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 7 }}>
                  Alamat Email <span style={{ color: "#D60000" }}>*</span>
                </label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)", pointerEvents: "none" }}>
                    <AtSign size={15} />
                  </span>
                  <input
                    type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="Contoh: humas@pamekasankab.go.id" required
                    style={{ width: "100%", padding: "11px 13px 11px 40px", border: "1.5px solid var(--border)", borderRadius: 10, background: "var(--bg-subtle)", fontSize: 13, color: "var(--text-primary)", outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
                    onFocus={e => { e.target.style.borderColor = "#D60000"; e.target.style.boxShadow = "0 0 0 3px rgba(214,0,0,0.10)"; e.target.style.background = "var(--surface)"; }}
                    onBlur={e => { e.target.style.borderColor = "var(--border)"; e.target.style.boxShadow = "none"; e.target.style.background = "var(--bg-subtle)"; }}
                  />
                </div>
              </div>

              {/* WhatsApp */}
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 7 }}>
                  No. WhatsApp / Telepon
                </label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)", pointerEvents: "none" }}>
                    <Smartphone size={15} />
                  </span>
                  <input
                    value={phone} onChange={e => setPhone(e.target.value)}
                    placeholder="Contoh: 081234567890"
                    style={{ width: "100%", padding: "11px 13px 11px 40px", border: "1.5px solid var(--border)", borderRadius: 10, background: "var(--bg-subtle)", fontSize: 13, color: "var(--text-primary)", outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
                    onFocus={e => { e.target.style.borderColor = "#D60000"; e.target.style.boxShadow = "0 0 0 3px rgba(214,0,0,0.10)"; e.target.style.background = "var(--surface)"; }}
                    onBlur={e => { e.target.style.borderColor = "var(--border)"; e.target.style.boxShadow = "none"; e.target.style.background = "var(--bg-subtle)"; }}
                  />
                </div>
              </div>

              {/* Divider */}
              <div style={{ height: 1, background: "var(--border-subtle)" }} />

              {/* Buttons */}
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{ flex: 1, padding: "10px 16px", borderRadius: 10, border: "1.5px solid var(--border)", background: "transparent", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", cursor: "pointer" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "var(--bg-subtle)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  style={{
                    flex: 2, padding: "10px 16px", borderRadius: 10, border: "none",
                    background: createMutation.isPending ? "var(--text-tertiary)" : "linear-gradient(135deg, #D60000 0%, #8B0000 100%)",
                    fontSize: 13, fontWeight: 700, color: "#fff",
                    cursor: createMutation.isPending ? "not-allowed" : "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    boxShadow: createMutation.isPending ? "none" : "0 4px 14px rgba(214,0,0,0.28)",
                  }}
                  onMouseEnter={e => { if (!createMutation.isPending) e.currentTarget.style.opacity = "0.88"; }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
                >
                  {createMutation.isPending
                    ? <><Loader2 size={14} className="animate-spin" /> Menyimpan...</>
                    : <><UserPlus size={14} /> Simpan Kontak</>
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      , document.body)}
    </div>
  );
}

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../../../lib/adminApi";
import { useDialog } from "../../../context/DialogContext";
import { Plus, Search, Mail, Phone, Loader2, X, Trash2 } from "lucide-react";

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
  const { confirm, toast } = useDialog();
  
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
      toast("success", "Pengiklan baru berhasil ditambahkan!");
      setShowAddModal(false);
      // Reset form
      setCompany("");
      setPicName("");
      setEmail("");
      setPhone("");
    },
    onError: (err: any) => {
      toast("error", `Gagal menyimpan: ${err.response?.data?.message || err.message}`);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return adminApi.delete(`/api/ads/advertisers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "advertisers"] });
      toast("success", "Profil pengiklan berhasil dihapus!");
    },
    onError: (err: any) => {
      toast("error", `Gagal menghapus: ${err.message}`);
    }
  });

  const handleDelete = (id: string, name: string) => {
    confirm({
      title: "Hapus Pengiklan",
      message: `Apakah Anda yakin ingin menghapus profil pengiklan "${name}"? Seluruh kampanye terkait juga akan terhapus.`,
      confirmText: "Ya, Hapus",
      cancelText: "Batal",
      type: "danger",
      onConfirm: () => {
        deleteMutation.mutate(id);
      }
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim() || !picName.trim() || !email.trim()) {
      toast("warning", "Nama Perusahaan, Nama PIC, dan Email wajib diisi!");
      return;
    }
    createMutation.mutate({
      company,
      name: picName,
      email,
      phone
    });
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
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari nama perusahaan, PIC, atau email..."
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

      {/* Add Advertiser Modal */}
      {showAddModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
          padding: 16, boxSizing: "border-box"
        }} className="flex items-center justify-center">
          <div style={{
            background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16,
            width: "100%", maxWidth: 440, display: "flex", flexDirection: "column", overflow: "hidden",
            boxShadow: "var(--shadow-lg)"
          }}>
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border)", background: "var(--bg-subtle)" }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>Tambah Kontak Pengiklan</h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)" }}>
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Nama Perusahaan</label>
                <input value={company} onChange={e => setCompany(e.target.value)} placeholder="Contoh: Pemkab Pamekasan"
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: 8, background: "var(--surface)", fontSize: 13, color: "var(--text-primary)", outline: "none", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Nama PIC / Penghubung</label>
                <input value={picName} onChange={e => setPicName(e.target.value)} placeholder="Contoh: Achmad Syafi'i"
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: 8, background: "var(--surface)", fontSize: 13, color: "var(--text-primary)", outline: "none", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Alamat Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Contoh: humas@pamekasankab.go.id"
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: 8, background: "var(--surface)", fontSize: 13, color: "var(--text-primary)", outline: "none", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>No. WhatsApp / Telepon</label>
                <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Contoh: 081234567890"
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: 8, background: "var(--surface)", fontSize: 13, color: "var(--text-primary)", outline: "none", boxSizing: "border-box" }}
                />
              </div>

              {/* Submit Button */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 6 }}>
                <button type="button" onClick={() => setShowAddModal(false)}
                  style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid var(--border)", background: "none", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", cursor: "pointer" }}>
                  Batal
                </button>
                <button type="submit" disabled={createMutation.isPending}
                  style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "var(--brand)", fontSize: 13, fontWeight: 600, color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                  {createMutation.isPending && <Loader2 size={14} className="animate-spin" />}
                  Simpan Kontak
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../../../lib/adminApi";
import { useDialog } from "../../../context/DialogContext";
import { Calendar, User, Target, Loader2, Plus, Trash2 } from "lucide-react";

interface Advertiser {
  id: string;
  company: string;
  name: string;
}

interface Campaign {
  id: string;
  name: string;
  budget: number;
  startDate: string;
  endDate: string;
  status: string;
  advertiserId: string;
  advertiser: Advertiser;
  _count?: {
    ads: number;
  };
}

export default function CampaignsPage() {
  const queryClient = useQueryClient();
  const { showConfirm, showToast } = useDialog();

  // Form states
  const [name, setName] = useState("");
  const [advertiserId, setAdvertiserId] = useState("");
  const [budget, setBudget] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Query advertisers & campaigns
  const { data: advertisersRes } = useQuery<{ success: boolean; data: Advertiser[] }>({
    queryKey: ["admin", "advertisers"],
    queryFn: async () => {
      return adminApi.get<any>("/api/ads/advertisers");
    }
  });

  const { data: campaignsRes, isLoading } = useQuery<{ success: boolean; data: Campaign[] }>({
    queryKey: ["admin", "campaigns"],
    queryFn: async () => {
      return adminApi.get<any>("/api/ads/campaigns");
    }
  });

  const advertisers = advertisersRes?.data || [];
  const campaigns = campaignsRes?.data || [];

  // Default selection
  React.useEffect(() => {
    if (advertisers.length > 0 && !advertiserId) {
      setAdvertiserId(advertisers[0].id);
    }
  }, [advertisers, advertiserId]);

  // Mutations
  const createMutation = useMutation({
    mutationFn: async (newCamp: { name: string; budget: number; startDate: string; endDate: string; advertiserId: string }) => {
      return adminApi.post("/api/ads/campaigns", newCamp);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "campaigns"] });
      showToast("Kampanye iklan berhasil didaftarkan!");
      setName("");
      setBudget("");
      setStartDate("");
      setEndDate("");
    },
    onError: (err: any) => {
      showToast(`Gagal mendaftarkan kampanye: ${err.message}`, "error");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return adminApi.delete(`/api/ads/campaigns/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "campaigns"] });
      showToast("Kampanye berhasil dihapus!");
    },
    onError: (err: any) => {
      showToast(`Gagal menghapus: ${err.message}`, "error");
    }
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !advertiserId || !budget || !startDate || !endDate) {
      showToast("Semua kolom wajib diisi!", "warning");
      return;
    }
    createMutation.mutate({
      name,
      advertiserId,
      budget: parseFloat(budget),
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
    });
  };

  const handleDelete = (id: string, name: string) => {
    showConfirm(
      `Apakah Anda yakin ingin menghapus kampanye "${name}"? Seluruh iklan di dalam kampanye ini akan terputus hubungannya.`,
      () => { deleteMutation.mutate(id); },
      "Hapus Kampanye",
      { type: "danger", confirmText: "Ya, Hapus", cancelText: "Batal" }
    );
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val);
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  };

  return (
    <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 20 }} className="animate-fade-in">
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", margin: 0, letterSpacing: -0.5 }}>
          Ad Campaigns &amp; Contract Management
        </h1>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "4px 0 0" }}>
          Mulai kampanye iklan dan tentukan batasan anggaran serta durasi masa tayang (Database Terintegrasi)
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
                value={advertiserId} onChange={e => setAdvertiserId(e.target.value)}
                style={{
                  width: "100%", padding: "8px 12px 8px 32px", background: "var(--bg-subtle)",
                  border: "1px solid var(--border)", borderRadius: 8, fontSize: 13,
                  color: "var(--text-primary)", outline: "none", boxSizing: "border-box",
                  cursor: "pointer"
                }}
              >
                {advertisers.length === 0 ? (
                  <option value="">-- Daftarkan Pengiklan Terlebih Dahulu --</option>
                ) : (
                  advertisers.map(adv => (
                    <option key={adv.id} value={adv.id}>{adv.company} (PIC: {adv.name})</option>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* Budget */}
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Anggaran Iklan (IDR) *</label>
            <input
              type="number" value={budget} onChange={e => setBudget(e.target.value)}
              placeholder="Contoh: 15000000"
              style={{
                width: "100%", padding: "8px 12px", background: "var(--bg-subtle)",
                border: "1px solid var(--border)", borderRadius: 8, fontSize: 13,
                color: "var(--text-primary)", outline: "none", boxSizing: "border-box"
              }}
              required
            />
          </div>

          {/* Date range */}
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Masa Tayang Kontrak *</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                style={{
                  flex: 1, padding: "8px 12px", background: "var(--bg-subtle)",
                  border: "1px solid var(--border)", borderRadius: 8, fontSize: 12,
                  color: "var(--text-primary)", outline: "none", boxSizing: "border-box"
                }}
                required
              />
              <input
                type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                style={{
                  flex: 1, padding: "8px 12px", background: "var(--bg-subtle)",
                  border: "1px solid var(--border)", borderRadius: 8, fontSize: 12,
                  color: "var(--text-primary)", outline: "none", boxSizing: "border-box"
                }}
                required
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={createMutation.isPending || advertisers.length === 0}
            style={{
              width: "100%",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              padding: "11px 16px",
              background: (createMutation.isPending || advertisers.length === 0)
                ? "var(--text-tertiary)"
                : "linear-gradient(135deg, #D60000 0%, #8B0000 100%)",
              border: "none", borderRadius: 10,
              cursor: (createMutation.isPending || advertisers.length === 0) ? "not-allowed" : "pointer",
              color: "#fff", fontSize: 13, fontWeight: 700, marginTop: 8,
              boxShadow: (createMutation.isPending || advertisers.length === 0) ? "none" : "0 4px 14px rgba(214,0,0,0.25)",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={e => {
              if (!createMutation.isPending && advertisers.length > 0) {
                e.currentTarget.style.opacity = "0.9";
                e.currentTarget.style.transform = "translateY(-1px)";
              }
            }}
            onMouseLeave={e => {
              if (!createMutation.isPending && advertisers.length > 0) {
                e.currentTarget.style.opacity = "1";
                e.currentTarget.style.transform = "translateY(0)";
              }
            }}
          >
            {createMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Target size={14} />} 
            Daftarkan Kampanye
          </button>
        </form>

        {/* Campaign List */}
        <div style={{ flex: 1.2, minWidth: 320, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 20 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 12px" }}>
            Daftar Kampanye Aktif
          </h2>
          {isLoading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "20px 0", color: "var(--text-secondary)", fontSize: 12 }}>
              <Loader2 className="animate-spin" size={14} style={{ marginRight: 6 }} /> Memuat data...
            </div>
          ) : campaigns.length === 0 ? (
            <div style={{ fontSize: 12, color: "var(--text-secondary)", textAlign: "center", padding: 12 }}>
              Belum ada kampanye aktif.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {campaigns.map(c => (
                <div key={c.id} style={{
                  border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px",
                  display: "flex", justifyContent: "space-between", alignItems: "center"
                }}>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 3px" }}>{c.name}</p>
                    <p style={{ fontSize: 11, color: "var(--text-secondary)", margin: 0 }}>
                      Advertiser: <span style={{ fontWeight: 600 }}>{c.advertiser.company}</span>
                    </p>
                    <p style={{ fontSize: 11, color: "var(--text-tertiary)", margin: "2px 0 0" }}>
                      Anggaran: <span style={{ fontWeight: 600, color: "var(--text-secondary)" }}>{formatCurrency(c.budget)}</span> · {formatDate(c.startDate)} - {formatDate(c.endDate)}
                    </p>
                  </div>
                  
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: 4,
                      fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 20,
                      background: c.status === "ACTIVE" ? "var(--green-subtle)" : "var(--bg-muted)",
                      color: c.status === "ACTIVE" ? "var(--green)" : "var(--text-secondary)"
                    }}>
                      {c.status === "ACTIVE" ? "Aktif" : "Selesai"}
                    </span>
                    <button 
                      onClick={() => handleDelete(c.id, c.name)}
                      style={{
                        padding: "7px 10px", borderRadius: 8,
                        border: "1px solid rgba(214,0,0,0.15)",
                        background: "rgba(214,0,0,0.04)",
                        color: "#D60000", cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        transition: "all 0.2s ease"
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = "#D60000";
                        e.currentTarget.style.color = "#fff";
                        e.currentTarget.style.borderColor = "#D60000";
                        e.currentTarget.style.boxShadow = "0 2px 8px rgba(214,0,0,0.25)";
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = "rgba(214,0,0,0.04)";
                        e.currentTarget.style.color = "#D60000";
                        e.currentTarget.style.borderColor = "rgba(214,0,0,0.15)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

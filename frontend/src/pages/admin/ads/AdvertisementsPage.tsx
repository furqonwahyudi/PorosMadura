import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../../../lib/adminApi";
import { useDialog } from "../../../context/DialogContext";
import { Plus, Code, Image as ImageIcon, Link, Loader2, Trash2 } from "lucide-react";

interface AdSlot {
  id: string;
  name: string;
  size: string;
  slug: string;
}

interface Advertiser {
  id: string;
  company: string;
}

interface Campaign {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
}

interface Ad {
  id: string;
  name: string;
  title?: string;
  imageDesktop?: string;
  landingUrl: string;
  format: string;
  htmlCode?: string;
  status: string;
  startDate: string;
  endDate: string;
  slot: AdSlot;
  advertiser: Advertiser;
  campaign?: Campaign;
}

export default function AdvertisementsPage() {
  const queryClient = useQueryClient();
  const { showConfirm, showToast } = useDialog();

  // Form states
  const [name, setName] = useState("");
  const [format, setFormat] = useState<"IMAGE" | "HTML">("IMAGE");
  const [advertiserId, setAdvertiserId] = useState("");
  const [campaignId, setCampaignId] = useState("");
  const [slotId, setSlotId] = useState("");
  const [landingUrl, setLandingUrl] = useState("");
  const [htmlCode, setHtmlCode] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [uploading, setUploading] = useState(false);
  const [imageDesktop, setImageDesktop] = useState("");

  // Query options lists
  const { data: slotsRes } = useQuery<{ success: boolean; data: AdSlot[] }>({
    queryKey: ["admin", "ads", "slots"],
    queryFn: async () => adminApi.get<any>("/api/ads/slots")
  });

  const { data: advertisersRes } = useQuery<{ success: boolean; data: Advertiser[] }>({
    queryKey: ["admin", "advertisers"],
    queryFn: async () => adminApi.get<any>("/api/ads/advertisers")
  });

  const { data: campaignsRes } = useQuery<{ success: boolean; data: Campaign[] }>({
    queryKey: ["admin", "campaigns"],
    queryFn: async () => adminApi.get<any>("/api/ads/campaigns")
  });

  // Query actual Ads
  const { data: adsRes, isLoading } = useQuery<{ success: boolean; data: Ad[] }>({
    queryKey: ["admin", "ads"],
    queryFn: async () => adminApi.get<any>("/api/ads")
  });

  const slots = slotsRes?.data || [];
  const advertisers = advertisersRes?.data || [];
  const campaigns = campaignsRes?.data || [];
  const ads = adsRes?.data || [];

  // Find selected campaign to apply min/max limits
  const selectedCampaign = campaigns.find(c => c.id === campaignId);
  const minDate = selectedCampaign ? selectedCampaign.startDate.split("T")[0] : undefined;
  const maxDate = selectedCampaign ? selectedCampaign.endDate.split("T")[0] : undefined;

  // Default selections — campaign is optional, do not auto-select first campaign
  React.useEffect(() => {
    if (slots.length > 0 && !slotId) setSlotId(slots[0].id);
    if (advertisers.length > 0 && !advertiserId) setAdvertiserId(advertisers[0].id);
  }, [slots, advertisers, slotId, advertiserId]);

  // Mutations
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await adminApi.post<any>("/api/media/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setImageDesktop(res.data.url);
      showToast("Gambar banner berhasil diunggah!");
    } catch (err: any) {
      showToast(`Gagal mengunggah gambar: ${err.message}`, "error");
    } finally {
      setUploading(false);
    }
  };

  const createMutation = useMutation({
    mutationFn: async (newAd: any) => {
      return adminApi.post("/api/ads", newAd);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "ads"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "ads", "slots"] });
      showToast("Materi iklan berhasil disimpan!");
      
      // Reset form
      setName("");
      setLandingUrl("");
      setHtmlCode("");
      setImageDesktop("");
      setStartDate("");
      setEndDate("");
      setCampaignId("");
    },
    onError: (err: any) => {
      showToast(`Gagal menyimpan: ${err.message}`, "error");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return adminApi.delete(`/api/ads/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "ads"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "ads", "slots"] });
      showToast("Materi iklan berhasil dihapus!");
    },
    onError: (err: any) => {
      showToast(`Gagal menghapus: ${err.message}`, "error");
    }
  });

  const handleDelete = (id: string, name: string) => {
    showConfirm(
      `Apakah Anda yakin ingin menghapus materi iklan "${name}"? Iklan ini tidak akan ditayangkan lagi di portal.`,
      () => { deleteMutation.mutate(id); },
      "Hapus Materi Iklan",
      { type: "danger", confirmText: "Ya, Hapus", cancelText: "Batal" }
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !advertiserId || !slotId || !startDate || !endDate) {
      showToast("Mohon lengkapi semua kolom wajib!", "warning");
      return;
    }
    if (format === "IMAGE" && !imageDesktop) {
      showToast("Silakan unggah gambar banner terlebih dahulu!", "warning");
      return;
    }
    if (format === "HTML" && !htmlCode.trim()) {
      showToast("Kode Script programmatik wajib diisi!", "warning");
      return;
    }

    if (selectedCampaign) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const limitStart = new Date(selectedCampaign.startDate);
      const limitEnd = new Date(selectedCampaign.endDate);

      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);
      limitStart.setHours(0, 0, 0, 0);
      limitEnd.setHours(0, 0, 0, 0);

      if (start < limitStart || start > limitEnd || end < limitStart || end > limitEnd) {
        showToast(
          `Tanggal tayang iklan harus berada di dalam rentang waktu kampanye: ${limitStart.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })} sampai ${limitEnd.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}`,
          "warning"
        );
        return;
      }
    }

    createMutation.mutate({
      name,
      format,
      advertiserId,
      campaignId: campaignId || null,
      slotId,
      landingUrl: format === "IMAGE" ? landingUrl : "",
      imageDesktop: format === "IMAGE" ? imageDesktop : null,
      htmlCode: format === "HTML" ? htmlCode : null,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      status: "ACTIVE"
    });
  };

  return (
    <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 20 }} className="animate-fade-in">
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", margin: 0, letterSpacing: -0.5 }}>
          Master Banner &amp; Programmatic Scripts Repository
        </h1>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "4px 0 0" }}>
          Kelola aset kreatif iklan berupa gambar spanduk, tautan langsung, atau script programmatic (Database Terintegrasi)
        </p>
      </div>

      {/* Main form and list columns */}
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "flex-start" }}>
        
        {/* Creator Form */}
        <form onSubmit={handleSave} style={{
          flex: 1, minWidth: 320, background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: 12, padding: 20, display: "flex", flexDirection: "column", gap: 16,
        }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
            + Ad Creative Material Creator
          </h2>

          {/* Ad Name */}
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Nama Materi Iklan *</label>
            <input
              type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder="Contoh: Banner Promosi Event Batik 2026"
              style={{
                width: "100%", padding: "8px 12px", background: "var(--bg-subtle)",
                border: "1px solid var(--border)", borderRadius: 8, fontSize: 13,
                color: "var(--text-primary)", outline: "none", boxSizing: "border-box"
              }}
              required
            />
          </div>

          {/* Advertiser & Campaign Linkage */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 150 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Advertiser *</label>
              <select value={advertiserId} onChange={e => setAdvertiserId(e.target.value)}
                style={{ width: "100%", padding: "8px 12px", background: "var(--bg-subtle)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 13, color: "var(--text-primary)", cursor: "pointer", boxSizing: "border-box" }}>
                {advertisers.length === 0 ? (
                  <option value="">-- Daftarkan Pengiklan Dulu --</option>
                ) : (
                  advertisers.map(a => <option key={a.id} value={a.id}>{a.company}</option>)
                )}
              </select>
            </div>
            <div style={{ flex: 1, minWidth: 150 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Kampanye Kontrak</label>
              <select
                value={campaignId}
                onChange={e => {
                  const val = e.target.value;
                  setCampaignId(val);
                  const selected = campaigns.find(c => c.id === val);
                  if (selected) {
                    setStartDate(selected.startDate.split("T")[0]);
                    setEndDate(selected.endDate.split("T")[0]);
                  }
                }}
                style={{ width: "100%", padding: "8px 12px", background: "var(--bg-subtle)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 13, color: "var(--text-primary)", cursor: "pointer", boxSizing: "border-box" }}
              >
                <option value="">-- Tanpa Kontrak (Mandiri/Sponsor) --</option>
                {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          {/* Ad Slot Target */}
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Penempatan Slot Iklan *</label>
            <select value={slotId} onChange={e => setSlotId(e.target.value)}
              style={{ width: "100%", padding: "8px 12px", background: "var(--bg-subtle)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 13, color: "var(--text-primary)", cursor: "pointer", boxSizing: "border-box" }}>
              {slots.map(s => <option key={s.id} value={s.id}>{s.name} ({s.size})</option>)}
            </select>
          </div>

          {/* Ad Format Choice */}
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Format Materi Iklan *</label>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="button" onClick={() => setFormat("IMAGE")}
                style={{
                  flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  padding: "9px 0", borderRadius: 8, border: "1.5px solid",
                  borderColor: format === "IMAGE" ? "var(--brand)" : "var(--border)",
                  background: format === "IMAGE" ? "var(--brand-subtle)" : "transparent",
                  color: format === "IMAGE" ? "var(--brand)" : "var(--text-secondary)",
                  fontSize: 12, fontWeight: 600, cursor: "pointer",
                }}
              >
                <ImageIcon size={14} /> Direct Banner
              </button>
              <button
                type="button" onClick={() => setFormat("HTML")}
                style={{
                  flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  padding: "9px 0", borderRadius: 8, border: "1.5px solid",
                  borderColor: format === "HTML" ? "var(--brand)" : "var(--border)",
                  background: format === "HTML" ? "var(--brand-subtle)" : "transparent",
                  color: format === "HTML" ? "var(--brand)" : "var(--text-secondary)",
                  fontSize: 12, fontWeight: 600, cursor: "pointer",
                }}
              >
                <Code size={14} /> Script Programmatik
              </button>
            </div>
          </div>

          {/* Conditional Input */}
          {format === "IMAGE" ? (
            <>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Unggah Gambar Banner *</label>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading}
                    style={{ flex: 1, padding: "6px", background: "var(--bg-subtle)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12, color: "var(--text-primary)", outline: "none", boxSizing: "border-box" }}
                  />
                  {uploading && <Loader2 size={16} className="animate-spin text-slate-400" />}
                </div>
                {imageDesktop && (
                  <div style={{ marginTop: 8 }}>
                    <span style={{ fontSize: 11, color: "var(--green)", fontWeight: 600 }}>Gambar Siap: </span>
                    <a href={imageDesktop} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: "var(--brand)", textDecoration: "underline" }} className="truncate block max-w-xs">{imageDesktop}</a>
                  </div>
                )}
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Target URL Redirection Link *</label>
                <div style={{ position: "relative" }}>
                  <Link size={13} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)" }} />
                  <input
                    type="url" value={landingUrl} onChange={e => setLandingUrl(e.target.value)}
                    placeholder="https://..."
                    style={{
                      width: "100%", padding: "8px 12px 8px 32px", background: "var(--bg-subtle)",
                      border: "1px solid var(--border)", borderRadius: 8, fontSize: 13,
                      color: "var(--text-primary)", outline: "none", boxSizing: "border-box"
                    }}
                    required
                  />
                </div>
              </div>
            </>
          ) : (
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Programmatic Ad Network Script *</label>
              <textarea
                value={htmlCode} onChange={e => setHtmlCode(e.target.value)}
                rows={5} placeholder="Paste kode script tag Google AdSense/MGID di sini..."
                style={{
                  width: "100%", padding: "8px 12px", background: "var(--bg-subtle)",
                  border: "1px solid var(--border)", borderRadius: 8, fontSize: 12,
                  fontFamily: "monospace", color: "var(--text-primary)", outline: "none",
                  boxSizing: "border-box", resize: "none"
                }}
                required
              />
            </div>
          )}

          {/* Date range */}
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Masa Aktif Tayang Iklan *</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                min={minDate} max={maxDate}
                style={{ flex: 1, padding: "8px 12px", background: "var(--bg-subtle)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12, color: "var(--text-primary)", outline: "none", boxSizing: "border-box" }}
                required
              />
              <input
                type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                min={minDate} max={maxDate}
                style={{ flex: 1, padding: "8px 12px", background: "var(--bg-subtle)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12, color: "var(--text-primary)", outline: "none", boxSizing: "border-box" }}
                required
              />
            </div>
            {selectedCampaign && (
              <span style={{ display: "block", fontSize: 11, color: "var(--text-tertiary)", marginTop: 7, lineHeight: 1.4 }}>
                💡 Masa aktif iklan dibatasi oleh kontrak kampanye ({selectedCampaign.name}): <strong>{new Date(selectedCampaign.startDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</strong> s/d <strong>{new Date(selectedCampaign.endDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</strong>
              </span>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={createMutation.isPending || advertisers.length === 0}
            style={{
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
            {createMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} 
            Simpan Materi Iklan
          </button>
        </form>

        {/* Ad List */}
        <div style={{ flex: 1.2, minWidth: 320, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 20 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 12px" }}>
            Daftar Materi Kreatif
          </h2>
          {isLoading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "20px 0", color: "var(--text-secondary)", fontSize: 12 }}>
              <Loader2 className="animate-spin" size={14} style={{ marginRight: 6 }} /> Memuat data...
            </div>
          ) : ads.length === 0 ? (
            <div style={{ fontSize: 12, color: "var(--text-secondary)", textAlign: "center", padding: 12 }}>
              Belum ada materi iklan terdaftar.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {ads.map(item => (
                <div key={item.id} style={{
                  border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px",
                  display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 3px" }} className="truncate">{item.name}</p>
                    <p style={{ fontSize: 11, color: "var(--text-secondary)", margin: 0 }}>
                      Format: <span style={{ fontWeight: 600 }}>{item.format}</span> · Slot: <span style={{ fontWeight: 600 }}>{item.slot.name}</span>
                    </p>
                    <p style={{ fontSize: 11, color: "var(--text-tertiary)", margin: "2px 0 0" }}>
                      Klien: <span style={{ fontWeight: 600 }}>{item.advertiser.company}</span>
                    </p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {item.format === "IMAGE" ? (
                      <a href={item.imageDesktop} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: "var(--brand)", textDecoration: "underline", fontWeight: 600 }}>Banner Link</a>
                    ) : (
                      <span style={{ fontSize: 11, color: "var(--text-tertiary)", fontFamily: "monospace" }}>Script</span>
                    )}
                    <button 
                      onClick={() => handleDelete(item.id, item.name)}
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

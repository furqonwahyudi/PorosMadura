import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../../../lib/adminApi";
import { useDialog } from "../../../context/DialogContext";
import { Loader2, Eye, Pencil, Plus, X, Trash2, CheckCircle2 } from "lucide-react";

interface AdSlot {
  id: string;
  name: string;
  slug: string;
  size: string;
  type: string;
  page: string;
  isActive: boolean;
  createdAt?: string;
  _count?: {
    ads: number;
  };
}

export default function AdSlotsPage() {
  const queryClient = useQueryClient();
  const { confirm, toast } = useDialog();

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState<AdSlot | null>(null);
  const [viewingSlot, setViewingSlot] = useState<AdSlot | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [size, setSize] = useState("728x90");
  const [type, setType] = useState("DISPLAY");
  const [page, setPage] = useState("all");
  const [isActive, setIsActive] = useState(true);

  // Query for ad slots from database
  const { data: slotsRes, isLoading, error } = useQuery<{ success: boolean; data: AdSlot[] }>({
    queryKey: ["admin", "ads", "slots"],
    queryFn: async () => {
      return adminApi.get<any>("/api/ads/slots");
    }
  });

  const slots = slotsRes?.data || [];

  // Mutations
  const createMutation = useMutation({
    mutationFn: async (data: any) => adminApi.post("/api/ads/slots", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "ads", "slots"] });
      toast("success", "Slot iklan baru berhasil ditambahkan!");
      closeModals();
    },
    onError: (err: any) => toast("error", `Gagal menyimpan: ${err.message}`)
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => adminApi.put(`/api/ads/slots/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "ads", "slots"] });
      toast("success", "Slot iklan berhasil diperbarui!");
      closeModals();
    },
    onError: (err: any) => toast("error", `Gagal memperbarui: ${err.message}`)
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => adminApi.delete(`/api/ads/slots/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "ads", "slots"] });
      toast("success", "Slot iklan berhasil dihapus!");
    },
    onError: (err: any) => toast("error", `Gagal menghapus: ${err.message}`)
  });

  const closeModals = () => {
    setShowAddModal(false);
    setEditingSlot(null);
    setViewingSlot(null);
    setName("");
    setSlug("");
    setSize("728x90");
    setType("DISPLAY");
    setPage("all");
    setIsActive(true);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingSlot) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""));
    }
  };

  const handleOpenEdit = (slot: AdSlot) => {
    setEditingSlot(slot);
    setName(slot.name);
    setSlug(slot.slug);
    setSize(slot.size);
    setType(slot.type);
    setPage(slot.page || "all");
    setIsActive(slot.isActive);
  };

  const handleDelete = (slot: AdSlot) => {
    confirm({
      title: "Hapus Slot Iklan",
      message: `Apakah Anda yakin ingin menghapus slot "${slot.name}" (${slot.slug})?`,
      confirmText: "Ya, Hapus",
      cancelText: "Batal",
      type: "danger",
      onConfirm: () => deleteMutation.mutate(slot.id)
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim() || !size.trim()) {
      toast("warning", "Nama, Slug, dan Ukuran/Dimensi wajib diisi!");
      return;
    }

    const payload = {
      name,
      slug,
      size,
      type,
      page,
      isActive
    };

    if (editingSlot) {
      updateMutation.mutate({ id: editingSlot.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 20 }} className="animate-fade-in">
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", margin: 0, letterSpacing: -0.5 }}>
            Website Layout Ad Zones Configuration
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "4px 0 0" }}>
            Daftar zona penempatan dan ukuran media banner aktif di seluruh tata letak web (Database Terintegrasi)
          </p>
        </div>
        <button 
          onClick={() => { closeModals(); setShowAddModal(true); }}
          style={{
            display: "flex", alignItems: "center", gap: 7, padding: "8px 16px",
            background: "var(--brand)", border: "none", borderRadius: 8,
            cursor: "pointer", color: "#fff", fontSize: 13, fontWeight: 600,
            transition: "all 0.15s"
          }}
        >
          <Plus size={15} /> New Slot
        </button>
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
            display: "grid", gridTemplateColumns: "1.5fr 1.2fr 1fr 1fr 1.2fr 100px 100px 90px",
            gap: 12, padding: "10px 16px",
            background: "var(--bg-subtle)", borderBottom: "1px solid var(--border)",
          }}>
            {["Nama Zona Iklan", "Slug / Penanda", "Dimensi", "Tipe Slot", "Halaman", "Iklan Aktif", "Status", "Aksi"].map(h => (
              <span key={h} style={{ fontSize: 11, fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</span>
            ))}
          </div>

          {slots.map((s, i) => (
            <div key={s.id} style={{
              display: "grid", gridTemplateColumns: "1.5fr 1.2fr 1fr 1fr 1.2fr 100px 100px 90px",
              gap: 12, padding: "13px 16px", alignItems: "center",
              borderBottom: i < slots.length - 1 ? "1px solid var(--border)" : "none",
            }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{s.name}</span>
              <span style={{ fontSize: 12, fontFamily: "monospace", color: "var(--text-secondary)" }}>{s.slug}</span>
              <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text-primary)" }}>{s.size}</span>
              <span style={{ fontSize: 12, color: "var(--text-secondary)", textTransform: "capitalize" }}>{s.type.toLowerCase()}</span>
              <span style={{ fontSize: 12, color: "var(--text-secondary)", textTransform: "capitalize" }}>{s.page || "Semua"}</span>
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

              {/* Action */}
              <div style={{ display: "flex", gap: 6 }}>
                <button 
                  title="Lihat Detail" 
                  onClick={() => setViewingSlot(s)}
                  style={{
                    padding: "5px", borderRadius: 6, border: "1px solid var(--border)",
                    background: "var(--bg-subtle)", color: "var(--text-secondary)",
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center"
                  }}
                >
                  <Eye size={13} />
                </button>
                <button 
                  title="Edit Slot" 
                  onClick={() => handleOpenEdit(s)}
                  style={{
                    padding: "5px", borderRadius: 6, border: "1px solid var(--border)",
                    background: "var(--bg-subtle)", color: "var(--text-secondary)",
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center"
                  }}
                >
                  <Pencil size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Add / Edit Slot */}
      {(showAddModal || editingSlot) && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
          padding: 16, boxSizing: "border-box"
        }}>
          <div style={{
            background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16,
            width: "100%", maxWidth: 460, display: "flex", flexDirection: "column", overflow: "hidden",
            boxShadow: "var(--shadow-lg)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border)", background: "var(--bg-subtle)" }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>
                {editingSlot ? "Edit Slot Iklan" : "Tambah Slot Iklan Baru"}
              </h3>
              <button onClick={closeModals} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Nama Slot Iklan *</label>
                <input value={name} onChange={e => handleNameChange(e.target.value)} placeholder="Contoh: Header Top Leaderboard"
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: 8, background: "var(--surface)", fontSize: 13, color: "var(--text-primary)", outline: "none", boxSizing: "border-box" }} required
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Slug Penanda Unik *</label>
                <input value={slug} onChange={e => setSlug(e.target.value)} placeholder="header-top-leaderboard"
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: 8, background: "var(--surface)", fontSize: 12, fontFamily: "monospace", color: "var(--text-primary)", outline: "none", boxSizing: "border-box" }} required
                />
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Ukuran (W x H) *</label>
                  <input value={size} onChange={e => setSize(e.target.value)} placeholder="728x90"
                    style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: 8, background: "var(--surface)", fontSize: 13, color: "var(--text-primary)", outline: "none", boxSizing: "border-box" }} required
                  />
                </div>

                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Tipe Slot</label>
                  <select value={type} onChange={e => setType(e.target.value)}
                    style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: 8, background: "var(--surface)", fontSize: 13, color: "var(--text-primary)", outline: "none", boxSizing: "border-box", cursor: "pointer" }}>
                    <option value="DISPLAY">Display Banner</option>
                    <option value="NATIVE">Native Ad</option>
                    <option value="POPUP">Popup / Interstitial</option>
                    <option value="STICKY">Sticky Anchor</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Target Halaman Tayang</label>
                <select value={page} onChange={e => setPage(e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: 8, background: "var(--surface)", fontSize: 13, color: "var(--text-primary)", outline: "none", boxSizing: "border-box", cursor: "pointer" }}>
                  <option value="all">Semua Halaman (All)</option>
                  <option value="homepage">Homepage Beranda</option>
                  <option value="artikel">Single Article View</option>
                  <option value="kategori">Category Page</option>
                </select>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input type="checkbox" id="isActiveCheck" checked={isActive} onChange={e => setIsActive(e.target.checked)} style={{ cursor: "pointer" }} />
                <label htmlFor="isActiveCheck" style={{ fontSize: 13, color: "var(--text-primary)", cursor: "pointer" }}>Status Slot Aktif</label>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
                {editingSlot ? (
                  <button type="button" onClick={() => handleDelete(editingSlot)}
                    style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--red-subtle)", color: "var(--red)", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                    <Trash2 size={13} /> Hapus
                  </button>
                ) : <div />}
                
                <div style={{ display: "flex", gap: 8 }}>
                  <button type="button" onClick={closeModals} style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid var(--border)", background: "none", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", cursor: "pointer" }}>
                    Batal
                  </button>
                  <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "var(--brand)", fontSize: 13, fontWeight: 600, color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                    {(createMutation.isPending || updateMutation.isPending) && <Loader2 size={14} className="animate-spin" />}
                    Simpan Slot
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal View Slot Detail */}
      {viewingSlot && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
          padding: 16, boxSizing: "border-box"
        }}>
          <div style={{
            background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16,
            width: "100%", maxWidth: 440, display: "flex", flexDirection: "column", overflow: "hidden",
            boxShadow: "var(--shadow-lg)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border)", background: "var(--bg-subtle)" }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>Detail Slot Iklan</h3>
              <button onClick={closeModals} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)" }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <span style={{ fontSize: 11, color: "var(--text-tertiary)", textTransform: "uppercase", fontWeight: 700 }}>Nama Zona</span>
                <p style={{ margin: "2px 0 0", fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>{viewingSlot.name}</p>
              </div>

              <div style={{ display: "flex", gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 11, color: "var(--text-tertiary)", textTransform: "uppercase", fontWeight: 700 }}>Slug / Penanda</span>
                  <p style={{ margin: "2px 0 0", fontSize: 12, fontFamily: "monospace", color: "var(--brand)", fontWeight: 600 }}>{viewingSlot.slug}</p>
                </div>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 11, color: "var(--text-tertiary)", textTransform: "uppercase", fontWeight: 700 }}>Dimensi</span>
                  <p style={{ margin: "2px 0 0", fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{viewingSlot.size}</p>
                </div>
              </div>

              <div style={{ display: "flex", gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 11, color: "var(--text-tertiary)", textTransform: "uppercase", fontWeight: 700 }}>Tipe Display</span>
                  <p style={{ margin: "2px 0 0", fontSize: 13, color: "var(--text-secondary)" }}>{viewingSlot.type}</p>
                </div>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 11, color: "var(--text-tertiary)", textTransform: "uppercase", fontWeight: 700 }}>Target Halaman</span>
                  <p style={{ margin: "2px 0 0", fontSize: 13, color: "var(--text-secondary)", textTransform: "capitalize" }}>{viewingSlot.page || "Semua"}</p>
                </div>
              </div>

              <div style={{ display: "flex", gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 11, color: "var(--text-tertiary)", textTransform: "uppercase", fontWeight: 700 }}>Jumlah Iklan Aktif</span>
                  <p style={{ margin: "2px 0 0", fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{viewingSlot._count?.ads ?? 0} Iklan</p>
                </div>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 11, color: "var(--text-tertiary)", textTransform: "uppercase", fontWeight: 700 }}>Status Keaktifan</span>
                  <p style={{ margin: "2px 0 0", fontSize: 13, fontWeight: 700, color: viewingSlot.isActive ? "var(--green)" : "var(--red)" }}>
                    {viewingSlot.isActive ? "Aktif (Live)" : "Nonaktif"}
                  </p>
                </div>
              </div>
            </div>

            <div style={{ padding: "12px 20px", borderTop: "1px solid var(--border)", background: "var(--bg-subtle)", display: "flex", justifyContent: "flex-end" }}>
              <button onClick={closeModals} style={{ padding: "6px 16px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface)", fontSize: 12, fontWeight: 600, color: "var(--text-primary)", cursor: "pointer" }}>
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

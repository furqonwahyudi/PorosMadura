import React, { useState } from "react";
import { Plus, ArrowRight, Trash2, ShieldAlert, Image, Save, CheckCircle, RefreshCw } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../../../lib/adminApi";
import { useDialog } from "../../../context/DialogContext";

export default function SeoRedirectPage() {
  const { showToast } = useDialog();
  const queryClient = useQueryClient();

  const [oldUrl, setOldUrl] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [type, setType] = useState("301");
  const [fallbackImage, setFallbackImage] = useState<File | null>(null);

  // Load Redirect Rules
  const { data: redirects, isLoading: isLoadingRedirects } = useQuery({
    queryKey: ["admin", "seo", "redirects"],
    queryFn: async () => {
      const res = await adminApi.get<{ success: boolean; data: any[] }>("/api/seo/redirects");
      return res.data;
    }
  });

  // Load Dead Links
  const { data: deadLinks, isLoading: isLoadingDeadLinks } = useQuery({
    queryKey: ["admin", "seo", "dead-links"],
    queryFn: async () => {
      const res = await adminApi.get<{ success: boolean; data: any[] }>("/api/seo/dead-links");
      return res.data;
    }
  });

  // Add Redirect Mutation
  const addRedirectMutation = useMutation({
    mutationFn: async (payload: any) => {
      return adminApi.post("/api/seo/redirects", payload);
    },
    onSuccess: () => {
      showToast("Aturan redirect berhasil ditambahkan!", "success");
      setOldUrl("");
      setNewUrl("");
      queryClient.invalidateQueries({ queryKey: ["admin", "seo", "redirects"] });
    },
    onError: (err: any) => {
      showToast(err.message || "Gagal menambahkan aturan redirect.", "error");
    }
  });

  // Delete Redirect Mutation
  const deleteRedirectMutation = useMutation({
    mutationFn: async (id: string) => {
      return adminApi.delete(`/api/seo/redirects/${id}`);
    },
    onSuccess: () => {
      showToast("Aturan redirect berhasil dihapus!", "success");
      queryClient.invalidateQueries({ queryKey: ["admin", "seo", "redirects"] });
    },
    onError: (err: any) => {
      showToast(err.message || "Gagal menghapus aturan redirect.", "error");
    }
  });

  // Load SEO settings for fallback image
  const { data: seoData } = useQuery({
    queryKey: ["admin", "seo", "settings"],
    queryFn: async () => {
      const res = await adminApi.get<{ success: boolean; data: any }>("/api/seo/settings");
      return res.data;
    }
  });

  // Update Fallback Image Mutation
  const updateFallbackMutation = useMutation({
    mutationFn: async (url: string) => {
      return adminApi.put("/api/seo/settings", {
        ...seoData,
        fallbackImage: url
      });
    },
    onSuccess: () => {
      showToast("Gambar banner Open Graph berhasil diperbarui!", "success");
      queryClient.invalidateQueries({ queryKey: ["admin", "seo", "settings"] });
    },
    onError: (err: any) => {
      showToast(err.message || "Gagal memperbarui banner fallback.", "error");
    }
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldUrl.startsWith("/")) {
      showToast("Old URL harus diawali dengan slash (/)!", "error");
      return;
    }
    addRedirectMutation.mutate({ oldUrl, newUrl, type });
  };

  const handleRemove = (id: string) => {
    deleteRedirectMutation.mutate(id);
  };

  const handleSaveFallback = async () => {
    if (!fallbackImage) {
      showToast("Pilih file gambar terlebih dahulu", "error");
      return;
    }
    const formData = new FormData();
    formData.append("file", fallbackImage);
    try {
      const res = await adminApi.post<{ success: boolean; data: any }>("/api/media/upload?temp=false", formData);
      if (res.success && res.data) {
        updateFallbackMutation.mutate(res.data.url);
      }
    } catch (err: any) {
      showToast(err.message || "Gagal mengunggah berkas gambar", "error");
    }
  };

  if (isLoadingRedirects || isLoadingDeadLinks) {
    return (
      <div style={{ padding: "24px", display: "flex", justifyContent: "center", alignItems: "center", minHeight: "200px" }}>
        <RefreshCw className="animate-spin text-slate-400" size={24} />
      </div>
    );
  }

  return (
    <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 20 }} className="animate-fade-in">
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", margin: 0, letterSpacing: -0.5 }}>
          URL Redirection Engine &amp; Social Media Fallbacks
        </h1>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "4px 0 0" }}>
          Atur pengalihan tautan 301/302 broken link, pantau logs error 404, dan upload fallback open graph banner
        </p>
      </div>

      <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
        
        {/* Left: Redirection manager */}
        <div style={{ flex: 1.2, minWidth: 320, display: "flex", flexDirection: "column", gap: 16 }}>
          
          {/* Redirect form */}
          <form onSubmit={handleAdd} style={{
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: 12, padding: 20, display: "flex", flexDirection: "column", gap: 14
          }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
              301/302 URL Redirection Manager Matrix
            </h2>

            <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>Old URL (Broken)</label>
                <input
                  type="text" value={oldUrl} onChange={e => setOldUrl(e.target.value)}
                  placeholder="/kategori-lama"
                  style={{
                    width: "100%", padding: "8px 12px", background: "var(--bg-subtle)",
                    border: "1px solid var(--border)", borderRadius: 8, fontSize: 13,
                    color: "var(--text-primary)", outline: "none", boxSizing: "border-box"
                  }}
                  required
                />
              </div>

              <div style={{ display: "flex", alignItems: "center", height: 35 }}>
                <ArrowRight size={14} style={{ color: "var(--text-tertiary)" }} />
              </div>

              <div style={{ flex: 1 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>New Active URL</label>
                <input
                  type="text" value={newUrl} onChange={e => setNewUrl(e.target.value)}
                  placeholder="/kategori-baru"
                  style={{
                    width: "100%", padding: "8px 12px", background: "var(--bg-subtle)",
                    border: "1px solid var(--border)", borderRadius: 8, fontSize: 13,
                    color: "var(--text-primary)", outline: "none", boxSizing: "border-box"
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>Type</label>
                <select
                  value={type} onChange={e => setType(e.target.value)}
                  style={{
                    padding: "8px 10px", background: "var(--bg-subtle)",
                    border: "1px solid var(--border)", borderRadius: 8, fontSize: 13,
                    color: "var(--text-primary)", outline: "none", cursor: "pointer"
                  }}
                >
                  <option value="301">301 (Perm)</option>
                  <option value="302">302 (Temp)</option>
                </select>
              </div>

              <button type="submit" disabled={addRedirectMutation.isPending} style={{
                padding: "8px 14px", borderRadius: 8, border: "none",
                background: "var(--brand)", color: "#fff", fontSize: 13, fontWeight: 600, cursor: addRedirectMutation.isPending ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                opacity: addRedirectMutation.isPending ? 0.7 : 1
              }}>
                <Plus size={14} />
              </button>
            </div>
          </form>

          {/* Redirect list table */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
            <div style={{
              display: "grid", gridTemplateColumns: "1.2fr 1.2fr 80px 70px",
              gap: 12, padding: "10px 16px",
              background: "var(--bg-subtle)", borderBottom: "1px solid var(--border)",
            }}>
              {["Old URL Link", "New Redirect URL", "Redirection", "Aksi"].map(h => (
                <span key={h} style={{ fontSize: 11, fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</span>
              ))}
            </div>

            {!redirects || redirects.length === 0 ? (
              <div style={{ padding: 24, textAlign: "center", color: "var(--text-tertiary)", fontSize: 13 }}>
                Belum ada aturan redirect yang dibuat.
              </div>
            ) : (
              redirects.map((r: any) => (
                <div key={r.id} style={{
                  display: "grid", gridTemplateColumns: "1.2fr 1.2fr 80px 70px",
                  gap: 12, padding: "12px 16px", alignItems: "center",
                  borderBottom: "1px solid var(--border)"
                }}>
                  <span style={{ fontSize: 12, fontFamily: "monospace", color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.oldUrl}</span>
                  <span style={{ fontSize: 12, fontFamily: "monospace", color: "var(--brand)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.newUrl}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: r.type === "301" ? "var(--green)" : "var(--blue)" }}>{r.type}</span>
                  <button
                    disabled={deleteRedirectMutation.isPending}
                    onClick={() => handleRemove(r.id)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--red)", display: "flex", alignItems: "center" }}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))
            )}
          </div>

        </div>

        {/* Right: Dead Links & Social Open Graph */}
        <div style={{ flex: 1, minWidth: 320, display: "flex", flexDirection: "column", gap: 16 }}>
          
          {/* Dead Links 404 Monitor */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 20 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 12px", display: "flex", alignItems: "center", gap: 6 }}>
              <ShieldAlert size={15} style={{ color: "var(--red)" }} /> Dead Links 404 Interception Log Monitor
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {!deadLinks || deadLinks.length === 0 ? (
                <div style={{ padding: 12, textAlign: "center", color: "var(--text-tertiary)", fontSize: 12 }}>
                  Tidak terdeteksi 404 dead link. Bagus!
                </div>
              ) : (
                deadLinks.map((d: any, idx: number) => {
                  const lastSeen = new Date(d.lastSeenAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB";
                  return (
                    <div key={d.id} style={{
                      border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px",
                      display: "flex", justifyContent: "space-between", alignItems: "center"
                    }}>
                      <div style={{ overflow: "hidden", textOverflow: "ellipsis", marginRight: 8 }}>
                        <span style={{ fontSize: 12, fontFamily: "monospace", color: "var(--text-secondary)", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 180 }}>{d.url}</span>
                        <span style={{ fontSize: 10, color: "var(--text-tertiary)" }}>Last seen: {lastSeen}</span>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: "var(--red)" }}>{d.count} hit</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Social Open Graph Media Fallback */}
          <div style={{
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: 12, padding: 20, display: "flex", flexDirection: "column", gap: 12
          }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", margin: 0, display: "flex", alignItems: "center", gap: 6 }}>
              <Image size={15} style={{ color: "var(--brand)" }} /> Social Open Graph Media Fallback
            </h2>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0 }}>
              Banner fallback standar ukuran 1200×630 px jika artikel tidak memiliki gambar utama.
            </p>

            {seoData?.fallbackImage && (
              <div style={{ width: "100%", borderRadius: 8, overflow: "hidden", border: "1px solid var(--border)" }}>
                <img src={seoData.fallbackImage} alt="Social Fallback" style={{ width: "100%", display: "block", maxHeight: 150, objectFit: "cover" }} />
              </div>
            )}

            <input
              type="file" accept="image/*"
              onChange={e => setFallbackImage(e.target.files?.[0] || null)}
              style={{
                width: "100%", padding: "6px", background: "var(--bg-subtle)",
                border: "1px solid var(--border)", borderRadius: 8, fontSize: 12,
                color: "var(--text-primary)", outline: "none", boxSizing: "border-box"
              }}
            />

            <button
              onClick={handleSaveFallback} disabled={updateFallbackMutation.isPending}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                padding: "8px 0", borderRadius: 8, border: "none", background: "var(--brand)",
                color: "#fff", fontSize: 12, fontWeight: 600, cursor: updateFallbackMutation.isPending ? "not-allowed" : "pointer",
                opacity: updateFallbackMutation.isPending ? 0.7 : 1
              }}
            >
              <Save size={13} /> {updateFallbackMutation.isPending ? "Updating..." : "Update Fallback Image"}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { Shield, Save, CheckCircle, HelpCircle, Plus, Edit2, Trash2, X, Info } from "lucide-react";
import { useDialog } from "../../../context/DialogContext";
import { adminApi } from "../../../lib/adminApi";

interface RoleItem {
  id: string;
  key: string;
  name: string;
  description: string;
  isSystem: boolean;
  permissions: string[];
}

type Permission = "create_post" | "publish_post" | "edit_others_post" | "delete_post" | "manage_comments" | "manage_ads" | "manage_seo" | "manage_settings";

const PERMISSION_LABELS: Record<Permission, { label: string; desc: string }> = {
  create_post: { label: "Create Post", desc: "Membuat draf tulisan berita baru" },
  publish_post: { label: "Publish Post", desc: "Menerbitkan draf langsung ke portal publik" },
  edit_others_post: { label: "Edit Others Post", desc: "Mengubah tulisan milik jurnalis lain" },
  delete_post: { label: "Delete Post", desc: "Memindahkan artikel ke tempat sampah" },
  manage_comments: { label: "Manage Comments", desc: "Menyetujui, menghapus, atau menandai spam komentar pembaca" },
  manage_ads: { label: "Manage Ads", desc: "Mengatur kampanye iklan, slot iklan, dan rate card" },
  manage_seo: { label: "Manage SEO", desc: "Mengonfigurasi sitemap XML, robots.txt, dan redireksi 301/302" },
  manage_settings: { label: "Manage Settings", desc: "Mengubah identitas portal berita, kontak, dan logo" }
};

export default function RolesPage() {
  const { showToast, showConfirm } = useDialog();
  const [activeTab, setActiveTab] = useState<"matrix" | "roles">("matrix");
  
  // State for Roles and Matrix list
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [matrix, setMatrix] = useState<Record<string, Record<Permission, boolean>>>({});
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleItem | null>(null);
  
  // Form states
  const [roleName, setRoleName] = useState("");
  const [roleDesc, setRoleDesc] = useState("");

  const [saved, setSaved] = useState(false);

  // Fetch roles on mount
  const fetchRoles = async () => {
    try {
      setLoading(true);
      const res: any = await adminApi.get("/api/rbac");
      if (res?.success) {
        const data = res.data;

        // Sort: SUPER_ADMIN first, then other system roles alphabetically, then custom roles
        data.sort((a: any, b: any) => {
          if (a.key === 'SUPER_ADMIN') return -1;
          if (b.key === 'SUPER_ADMIN') return 1;
          if (a.isSystem && !b.isSystem) return -1;
          if (!a.isSystem && b.isSystem) return 1;
          return a.name.localeCompare(b.name, 'id');
        });

        setRoles(data);

        // Build matrix object
        const matrixObj: Record<string, Record<Permission, boolean>> = {};
        data.forEach((r: any) => {
          const row: Record<Permission, boolean> = {
            create_post: false, publish_post: false, edit_others_post: false, delete_post: false,
            manage_comments: false, manage_ads: false, manage_seo: false, manage_settings: false
          };
          
          if (Array.isArray(r.permissions)) {
            r.permissions.forEach((p: string) => {
              if (p in row) {
                row[p as Permission] = true;
              }
            });
          }
          matrixObj[r.key] = row;
        });
        setMatrix(matrixObj);
      }
    } catch (err: any) {
      showToast(err.message || "Gagal memuat daftar peran dari database", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const togglePermission = (roleKey: string, perm: Permission) => {
    if (roleKey === "SUPER_ADMIN") return; // Super Admin permissions cannot be modified
    const updatedMatrix = {
      ...matrix,
      [roleKey]: {
        ...matrix[roleKey],
        [perm]: !matrix[roleKey]?.[perm]
      }
    };
    setMatrix(updatedMatrix);
  };

  const handleSaveMatrix = async () => {
    try {
      setSaved(true);
      const res: any = await adminApi.post("/api/rbac/matrix", { matrix });
      if (res?.success) {
        showToast("Matriks otorisasi berhasil disimpan ke database!", "success");
        fetchRoles();
      }
    } catch (err: any) {
      showToast(err.message || "Gagal menyimpan matriks otorisasi", "error");
    } finally {
      setTimeout(() => setSaved(false), 2000);
    }
  };

  // Add Role
  const handleAddRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName.trim()) {
      showToast("Nama peran tidak boleh kosong!", "error");
      return;
    }

    try {
      const res: any = await adminApi.post("/api/rbac", {
        name: roleName.trim(),
        description: roleDesc.trim()
      });
      if (res?.success) {
        showToast(`Peran "${roleName}" berhasil ditambahkan ke database!`, "success");
        fetchRoles();
        setRoleName("");
        setRoleDesc("");
        setShowAddModal(false);
      }
    } catch (err: any) {
      showToast(err.message || "Gagal menambahkan peran baru", "error");
    }
  };

  // Open Edit Modal
  const openEditModal = (role: RoleItem) => {
    setEditingRole(role);
    setRoleName(role.name);
    setRoleDesc(role.description);
    setShowEditModal(true);
  };

  // Save Edit Role
  const handleEditRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRole) return;
    if (!roleName.trim()) {
      showToast("Nama peran tidak boleh kosong!", "error");
      return;
    }

    try {
      const res: any = await adminApi.put(`/api/rbac/${editingRole.id}`, {
        name: roleName.trim(),
        description: roleDesc.trim()
      });
      if (res?.success) {
        showToast(`Peran "${roleName}" berhasil diperbarui!`, "success");
        fetchRoles();
        setShowEditModal(false);
        setEditingRole(null);
      }
    } catch (err: any) {
      showToast(err.message || "Gagal memperbarui peran", "error");
    }
  };

  // Delete Role
  const handleDeleteRole = (role: RoleItem) => {
    if (role.isSystem) {
      showToast("Peran sistem tidak boleh dihapus!", "error");
      return;
    }

    showConfirm(`Apakah Anda yakin ingin menghapus peran "${role.name}"? Pengguna dengan peran ini akan kehilangan akses.`, async () => {
      try {
        const res: any = await adminApi.delete(`/api/rbac/${role.id}`);
        if (res?.success) {
          showToast(`Peran "${role.name}" telah dihapus dari database.`, "success");
          fetchRoles();
        }
      } catch (err: any) {
        showToast(err.message || "Gagal menghapus peran", "error");
      }
    });
  };

  const permissions: Permission[] = ["create_post", "publish_post", "edit_others_post", "delete_post", "manage_comments", "manage_ads", "manage_seo", "manage_settings"];

  return (
    <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 20 }} className="animate-fade-in">
      
      {/* Header & Tabs */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", margin: 0, letterSpacing: -0.5 }}>
            Role-Based Access Control (RBAC) Settings
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "4px 0 0" }}>
            Atur dan konfigurasikan tingkat otorisasi hak izin akses tindakan sistem untuk peran CMS secara langsung di database
          </p>
        </div>

        {/* Tab Buttons */}
        <div style={{ display: "flex", gap: 8, background: "var(--bg-subtle)", padding: 4, borderRadius: 8, border: "1px solid var(--border)" }}>
          <button
            onClick={() => setActiveTab("matrix")}
            style={{
              padding: "6px 16px", borderRadius: 6, fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer",
              background: activeTab === "matrix" ? "var(--surface)" : "transparent",
              color: activeTab === "matrix" ? "var(--text-primary)" : "var(--text-secondary)",
              boxShadow: activeTab === "matrix" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
              transition: "all 0.2s"
            }}
          >
            Matriks Izin Akses
          </button>
          <button
            onClick={() => setActiveTab("roles")}
            style={{
              padding: "6px 16px", borderRadius: 6, fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer",
              background: activeTab === "roles" ? "var(--surface)" : "transparent",
              color: activeTab === "roles" ? "var(--text-primary)" : "var(--text-secondary)",
              boxShadow: activeTab === "roles" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
              transition: "all 0.2s"
            }}
          >
            Kelola Peran (Roles)
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: "40px", textAlign: "center", color: "var(--text-secondary)" }}>
          Memuat data otorisasi dari database...
        </div>
      ) : (
        <>
          {/* TAB 1: RBAC MATRIX */}
          {activeTab === "matrix" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 6 }}>
                  <Info size={16} /> Klik tombol simpan setelah mengubah status centang izin akses peran.
                </span>
                <button
                  onClick={handleSaveMatrix}
                  style={{
                    display: "flex", alignItems: "center", gap: 7, padding: "8px 16px",
                    background: saved ? "var(--green)" : "var(--brand)", border: "none", borderRadius: 8,
                    cursor: "pointer", color: "#fff", fontSize: 13, fontWeight: 600,
                    transition: "background 0.3s"
                  }}
                >
                  {saved ? <><CheckCircle size={15} /> Tersimpan!</> : <><Save size={15} /> Simpan RBAC Matrix</>}
                </button>
              </div>

              {/* Grid Matrix Table */}
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, overflowX: "auto" }}>
                <div style={{ minWidth: 1000 }}>
                  {/* Table header */}
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "220px repeat(8, 1fr)",
                    gap: 12, padding: "12px 16px",
                    background: "var(--bg-subtle)", borderBottom: "1px solid var(--border)",
                    alignItems: "center"
                  }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      CMS Roles
                    </span>
                    {permissions.map(perm => (
                      <span
                        key={perm}
                        style={{
                          fontSize: 10, fontWeight: 700, color: "var(--text-tertiary)",
                          textTransform: "uppercase", letterSpacing: "0.04em",
                          textAlign: "center", cursor: "help"
                        }}
                        title={PERMISSION_LABELS[perm].desc}
                      >
                        {PERMISSION_LABELS[perm].label}
                      </span>
                    ))}
                  </div>

                  {/* Roles rows */}
                  {roles.map((role, rIdx) => (
                    <div
                      key={role.key}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "220px repeat(8, 1fr)",
                        gap: 12, padding: "16px 16px",
                        borderBottom: rIdx < roles.length - 1 ? "1px solid var(--border)" : "none",
                        alignItems: "center",
                        background: role.isSystem ? "transparent" : "var(--bg-subtle-hover)"
                      }}
                    >
                      {/* Role Header */}
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{role.name}</span>
                          {!role.isSystem && (
                            <span style={{ fontSize: 9, padding: "1px 5px", borderRadius: 4, background: "var(--brand-subtle)", color: "var(--brand)", fontWeight: 700 }}>
                              Kustom
                            </span>
                          )}
                        </div>
                        <p style={{ fontSize: 11, color: "var(--text-secondary)", margin: "2px 0 0" }}>
                          {role.description}
                        </p>
                      </div>

                      {/* Permission columns */}
                      {permissions.map(perm => {
                        const active = matrix[role.key]?.[perm] || false;
                        const isSuper = role.key === "SUPER_ADMIN";
                        return (
                          <div key={perm} style={{ display: "flex", justifyContent: "center" }}>
                            <div
                              onClick={() => togglePermission(role.key, perm)}
                              style={{
                                width: 40, height: 22, borderRadius: 99,
                                background: active ? "var(--brand)" : "var(--bg-muted)",
                                position: "relative", transition: "background 0.2s",
                                cursor: isSuper ? "not-allowed" : "pointer",
                                opacity: isSuper ? 0.7 : 1
                              }}
                            >
                              <div style={{
                                position: "absolute", top: 3, left: active ? 21 : 3,
                                width: 16, height: 16, borderRadius: "50%",
                                background: "#fff", transition: "left 0.2s",
                                boxShadow: "0 1px 4px rgba(0,0,0,0.25)"
                              }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>

              {/* Explanations Card */}
              <div style={{
                background: "var(--bg-subtle)", border: "1px solid var(--border)",
                borderRadius: 10, padding: 16, display: "flex", flexDirection: "column", gap: 12
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <HelpCircle size={15} style={{ color: "var(--text-secondary)" }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>Daftar Penjelasan Hak Akses</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="mobile-one-col">
                  {permissions.map(perm => (
                    <div key={perm} style={{ fontSize: 12 }}>
                      <strong style={{ color: "var(--text-primary)" }}>{PERMISSION_LABELS[perm].label}</strong>
                      <p style={{ color: "var(--text-secondary)", margin: "2px 0 0" }}>{PERMISSION_LABELS[perm].desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ROLE MANAGEMENT LIST */}
          {activeTab === "roles" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                  Daftar Peran yang terdaftar pada sistem (Role bawaan sistem tidak dapat dihapus).
                </span>
                <button
                  onClick={() => setShowAddModal(true)}
                  style={{
                    display: "flex", alignItems: "center", gap: 6, padding: "8px 16px",
                    background: "var(--brand)", border: "none", borderRadius: 8,
                    cursor: "pointer", color: "#fff", fontSize: 13, fontWeight: 600
                  }}
                >
                  <Plus size={15} /> Tambah Peran Baru
                </button>
              </div>

              {/* Roles Table */}
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                  <thead>
                    <tr style={{ background: "var(--bg-subtle)", borderBottom: "1px solid var(--border)", fontSize: 11, fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase" }}>
                      <th style={{ padding: "12px 16px" }}>Nama Peran</th>
                      <th style={{ padding: "12px 16px" }}>Kode / Key</th>
                      <th style={{ padding: "12px 16px" }}>Deskripsi</th>
                      <th style={{ padding: "12px 16px" }}>Jenis Peran</th>
                      <th style={{ padding: "12px 16px", textAlign: "center" }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roles.map(role => (
                      <tr key={role.key} style={{ borderBottom: "1px solid var(--border)", fontSize: 13, color: "var(--text-primary)" }}>
                        <td style={{ padding: "16px", fontWeight: 700 }}>{role.name}</td>
                        <td style={{ padding: "16px" }}>
                          <code style={{ fontSize: 11, background: "var(--bg-subtle)", padding: "2px 6px", borderRadius: 4, fontFamily: "monospace" }}>
                            {role.key}
                          </code>
                        </td>
                        <td style={{ padding: "16px", color: "var(--text-secondary)" }}>{role.description}</td>
                        <td style={{ padding: "16px" }}>
                          {role.isSystem ? (
                            <span style={{ fontSize: 11, color: "var(--text-tertiary)", display: "inline-flex", alignItems: "center", gap: 4 }}>
                              <Shield size={12} /> Bawaan Sistem
                            </span>
                          ) : (
                            <span style={{ fontSize: 11, color: "var(--brand)", fontWeight: 600 }}>
                              Kustom (Admin)
                            </span>
                          )}
                        </td>
                        <td style={{ padding: "16px", textAlign: "center" }}>
                          <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                            <button
                              onClick={() => openEditModal(role)}
                              style={{
                                padding: 6, borderRadius: 6, border: "1px solid var(--border)", cursor: "pointer",
                                background: "var(--surface)", color: "var(--text-secondary)", display: "flex", alignItems: "center", justifyContent: "center"
                              }}
                              title="Edit Peran"
                            >
                              <Edit2 size={13} />
                            </button>
                            {!role.isSystem ? (
                              <button
                                onClick={() => handleDeleteRole(role)}
                                style={{
                                  padding: 6, borderRadius: 6, border: "1px solid var(--border)", cursor: "pointer",
                                  background: "var(--surface)", color: "var(--red)", display: "flex", alignItems: "center", justifyContent: "center"
                                }}
                                title="Hapus Peran"
                              >
                                <Trash2 size={13} />
                              </button>
                            ) : (
                              <button
                                disabled
                                style={{
                                  padding: 6, borderRadius: 6, border: "1px solid var(--border)", cursor: "not-allowed",
                                  background: "var(--bg-muted)", color: "var(--text-tertiary)", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.5
                                }}
                                title="Peran bawaan tidak bisa dihapus"
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* MODAL 1: ADD ROLE */}
      {showAddModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 999,
          display: "flex", alignItems: "center", justifyContent: "center", padding: 16
        }}>
          <div style={{
            background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12,
            width: "100%", maxWidth: 450, overflow: "hidden", display: "flex", flexDirection: "column",
            boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border)", background: "var(--bg-subtle)" }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>Tambah Peran (Role) Baru</span>
              <button onClick={() => setShowAddModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)" }}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddRole} style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Nama Peran *</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Redaktur Utama / Sales"
                  value={roleName}
                  onChange={e => setRoleName(e.target.value)}
                  style={{
                    width: "100%", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: 8,
                    background: "var(--surface)", fontSize: 13, color: "var(--text-primary)", outline: "none", boxSizing: "border-box"
                  }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Deskripsi Peran</label>
                <textarea
                  placeholder="Penjelasan singkat mengenai peran dan tugas khusus ini"
                  value={roleDesc}
                  onChange={e => setRoleDesc(e.target.value)}
                  style={{
                    width: "100%", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: 8,
                    background: "var(--surface)", fontSize: 13, color: "var(--text-primary)", outline: "none", boxSizing: "border-box",
                    minHeight: 80, resize: "vertical"
                  }}
                />
              </div>
              <div style={{ display: "flex", justifyContent: "end", gap: 10, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid var(--border)", cursor: "pointer", background: "var(--surface)", color: "var(--text-secondary)", fontSize: 13, fontWeight: 600 }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  style={{ padding: "8px 16px", borderRadius: 8, border: "none", cursor: "pointer", background: "var(--brand)", color: "#fff", fontSize: 13, fontWeight: 600 }}
                >
                  Tambah Peran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT ROLE */}
      {showEditModal && editingRole && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 999,
          display: "flex", alignItems: "center", justifyContent: "center", padding: 16
        }}>
          <div style={{
            background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12,
            width: "100%", maxWidth: 450, overflow: "hidden", display: "flex", flexDirection: "column",
            boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border)", background: "var(--bg-subtle)" }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>Edit Peran (Role)</span>
              <button onClick={() => setShowEditModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)" }}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleEditRole} style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Nama Peran *</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Redaktur Utama / Sales"
                  value={roleName}
                  onChange={e => setRoleName(e.target.value)}
                  style={{
                    width: "100%", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: 8,
                    background: "var(--surface)", fontSize: 13, color: "var(--text-primary)", outline: "none", boxSizing: "border-box"
                  }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>Deskripsi Peran</label>
                <textarea
                  placeholder="Penjelasan singkat mengenai peran dan tugas khusus ini"
                  value={roleDesc}
                  onChange={e => setRoleDesc(e.target.value)}
                  style={{
                    width: "100%", padding: "8px 12px", border: "1px solid var(--border)", borderRadius: 8,
                    background: "var(--surface)", fontSize: 13, color: "var(--text-primary)", outline: "none", boxSizing: "border-box",
                    minHeight: 80, resize: "vertical"
                  }}
                />
              </div>
              <div style={{ display: "flex", justifyContent: "end", gap: 10, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid var(--border)", cursor: "pointer", background: "var(--surface)", color: "var(--text-secondary)", fontSize: 13, fontWeight: 600 }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  style={{ padding: "8px 16px", borderRadius: 8, border: "none", cursor: "pointer", background: "var(--brand)", color: "#fff", fontSize: 13, fontWeight: 600 }}
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

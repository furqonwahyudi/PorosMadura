import React, { useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../../../lib/adminApi";
import { useDialog } from "../../../context/DialogContext";
import { Search, UserPlus, ShieldCheck, Clock, Edit2, UserX, Trash2, Loader2, X, Key, User, Mail, Shield } from "lucide-react";

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "ADMIN" | "EDITOR" | "REPORTER" | "CONTRIBUTOR";
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  _count?: {
    articles: number;
  };
}

const ROLE_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  "SUPER_ADMIN": { label: "Super Admin", color: "var(--red)", bg: "var(--red-subtle)" },
  "ADMIN": { label: "Administrator", color: "var(--purple)", bg: "var(--purple-subtle)" },
  "EDITOR": { label: "Editor", color: "var(--blue)", bg: "var(--blue-subtle)" },
  "REPORTER": { label: "Reporter", color: "var(--green)", bg: "var(--green-subtle)" },
  "CONTRIBUTOR": { label: "Kontributor", color: "var(--orange)", bg: "var(--orange-subtle)" },
};

export default function AllUsersPage() {
  const queryClient = useQueryClient();
  const { confirm, toast } = useDialog();

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);

  // Edit Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<string>("REPORTER");

  // Query for users
  const { data: usersRes, isLoading } = useQuery<{ success: boolean; data: UserItem[] }>({
    queryKey: ["admin", "users"],
    queryFn: async () => adminApi.get<any>("/api/users")
  });

  const users = usersRes?.data || [];

  // Mutations
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => adminApi.put(`/api/users/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast("success", "Profil pengguna berhasil diperbarui!");
      closeModal();
    },
    onError: (err: any) => toast("error", `Gagal memperbarui: ${err.message}`)
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => adminApi.delete(`/api/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast("success", "Pengguna berhasil dihapus!");
    },
    onError: (err: any) => toast("error", `Gagal menghapus: ${err.message}`)
  });

  const closeModal = () => {
    setEditingUser(null);
    setName("");
    setEmail("");
    setPassword("");
    setRole("REPORTER");
  };

  const handleOpenEdit = (u: UserItem) => {
    setEditingUser(u);
    setName(u.name);
    setEmail(u.email);
    setRole(u.role);
    setPassword("");
  };

  const handleToggleStatus = (u: UserItem) => {
    const nextStatus = !u.isActive;
    confirm({
      title: nextStatus ? "Aktifkan Akun" : "Nonaktifkan / Suspend Akun",
      message: `Apakah Anda yakin ingin ${nextStatus ? "mengaktifkan kembali" : "menonaktifkan"} akun "${u.name}"?`,
      confirmText: nextStatus ? "Ya, Aktifkan" : "Ya, Suspend",
      cancelText: "Batal",
      type: nextStatus ? "confirm" : "danger",
      onConfirm: () => {
        updateMutation.mutate({ id: u.id, data: { isActive: nextStatus } });
      }
    });
  };

  const handleDelete = (u: UserItem) => {
    confirm({
      title: "Hapus Akun Pengguna",
      message: `Apakah Anda yakin ingin menghapus akun "${u.name}" (${u.email}) secara permanen?`,
      confirmText: "Ya, Hapus Permanen",
      cancelText: "Batal",
      type: "danger",
      onConfirm: () => {
        deleteMutation.mutate(u.id);
      }
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast("warning", "Nama dan Email wajib diisi!");
      return;
    }

    if (!editingUser) return;

    const payload: any = {
      name,
      email,
      role
    };
    if (password) payload.password = password;

    updateMutation.mutate({ id: editingUser.id, data: payload });
  };

  const filtered = users.filter(u => {
    if (roleFilter !== "all" && u.role !== roleFilter) return false;
    if (search && !u.name.toLowerCase().includes(search.toLowerCase()) && !u.email.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 20 }} className="animate-fade-in">
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", margin: 0, letterSpacing: -0.5 }}>
            CMS User Directory &amp; Activity Accounts
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "4px 0 0" }}>
            {users.length} akun terdaftar di database PostgreSQL
          </p>
        </div>
        <Link 
          to="/admin/users/create"
          style={{
            display: "flex", alignItems: "center", gap: 7, padding: "9px 18px",
            background: "var(--brand)", border: "none", borderRadius: 10,
            cursor: "pointer", color: "#fff", fontSize: 13, fontWeight: 700, textDecoration: "none",
            boxShadow: "0 2px 8px rgba(215, 25, 32, 0.25)"
          }}
        >
          <UserPlus size={16} /> Tambah User Baru
        </Link>
      </div>

      {/* Role stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10 }}>
        {Object.entries(ROLE_LABELS).map(([rKey, cfg]) => {
          const count = users.filter(u => u.role === rKey).length;
          return (
            <div key={rKey} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: cfg.color, flexShrink: 0 }} />
                <span style={{ fontSize: 10, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.04em" }}>{cfg.label}</span>
              </div>
              <p style={{ fontSize: 22, fontWeight: 700, color: cfg.color, margin: 0 }}>{count}</p>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <Search size={13} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)" }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari nama atau email..."
            style={{ width: "100%", padding: "8px 10px 8px 32px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 13, color: "var(--text-primary)", outline: "none" }}
          />
        </div>
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          {["all", "SUPER_ADMIN", "ADMIN", "EDITOR", "REPORTER", "CONTRIBUTOR"].map(r => (
            <button key={r} onClick={() => setRoleFilter(r)}
              style={{
                padding: "6px 11px", borderRadius: 7, border: "1px solid",
                fontSize: 12, fontWeight: 500, cursor: "pointer",
                borderColor: roleFilter === r ? "var(--brand)" : "var(--border)",
                background: roleFilter === r ? "var(--brand-subtle)" : "transparent",
                color: roleFilter === r ? "var(--brand)" : "var(--text-secondary)",
              }}
            >{r === "all" ? "Semua Role" : ROLE_LABELS[r]?.label || r}</button>
          ))}
        </div>
      </div>

      {/* Users table */}
      {isLoading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "40px 0", color: "var(--text-secondary)", fontSize: 13, alignItems: "center" }}>
          <Loader2 className="animate-spin" size={16} style={{ marginRight: 8 }} />
          Memuat akun pengguna dari database...
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: 24, textAlign: "center", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, color: "var(--text-secondary)", fontSize: 13 }}>
          Tidak ada pengguna terdaftar di database.
        </div>
      ) : (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
          <div style={{
            display: "grid", gridTemplateColumns: "200px 1fr 120px 100px 130px 90px",
            gap: 12, padding: "10px 16px",
            background: "var(--bg-subtle)", borderBottom: "1px solid var(--border)",
          }}>
            {["Nama Pengguna", "Email", "Role Otorisasi", "Status", "Tanggal Daftar", "Aksi"].map(h => (
              <span key={h} style={{ fontSize: 11, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</span>
            ))}
          </div>

          {filtered.map((u, i) => {
            const rc = ROLE_LABELS[u.role] || { label: u.role, color: "var(--text-primary)", bg: "var(--bg-subtle)" };
            const initials = u.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();

            return (
              <div key={u.id} style={{
                display: "grid", gridTemplateColumns: "200px 1fr 120px 100px 130px 90px",
                gap: 12, padding: "13px 16px", alignItems: "center",
                borderBottom: i < filtered.length - 1 ? "1px solid var(--border)" : "none",
              }}>
                {/* Avatar + name */}
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
                    background: rc.bg,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, fontWeight: 700, color: rc.color,
                  }}>
                    {initials}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{u.name}</span>
                </div>

                <span style={{ fontSize: 12, color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.email}</span>

                {/* Role badge */}
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 4,
                  fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 20,
                  background: rc.bg, color: rc.color, width: "fit-content"
                }}>
                  <ShieldCheck size={10} /> {rc.label}
                </span>

                {/* Status */}
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 4,
                  fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 20,
                  background: u.isActive ? "var(--green-subtle)" : "var(--red-subtle)",
                  color: u.isActive ? "var(--green)" : "var(--red)", width: "fit-content"
                }}>
                  <div style={{ width: 5, height: 5, borderRadius: "50%", background: "currentColor" }} />
                  {u.isActive ? "Aktif" : "Suspended"}
                </span>

                {/* Created Date */}
                <span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>
                  {new Date(u.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                </span>

                {/* Actions */}
                <div style={{ display: "flex", gap: 5 }}>
                  <button 
                    title="Edit User" 
                    onClick={() => handleOpenEdit(u)}
                    style={{ padding: "5px 8px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--bg-subtle)", color: "var(--text-secondary)", cursor: "pointer" }}
                  >
                    <Edit2 size={12} />
                  </button>
                  <button 
                    title={u.isActive ? "Suspend Akun" : "Aktifkan Akun"} 
                    onClick={() => handleToggleStatus(u)}
                    style={{ padding: "5px 8px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--bg-subtle)", color: u.isActive ? "var(--orange)" : "var(--green)", cursor: "pointer" }}
                  >
                    <UserX size={12} />
                  </button>
                  <button 
                    title="Hapus Permanent" 
                    onClick={() => handleDelete(u)}
                    style={{ padding: "5px 8px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--bg-subtle)", color: "var(--red)", cursor: "pointer" }}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit User Modal (rendered in Portal to cover topbar cleanly) */}
      {editingUser && createPortal(
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(15, 23, 42, 0.65)", backdropFilter: "blur(6px)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 99999,
          padding: 16, boxSizing: "border-box"
        }}>
          <div style={{
            background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20,
            width: "100%", maxWidth: 460, display: "flex", flexDirection: "column", overflow: "hidden",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)"
          }} className="animate-scale-in">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 24px", borderBottom: "1px solid var(--border)", background: "var(--bg-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <User size={16} style={{ color: "var(--brand)" }} />
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>
                  Edit Profil Pengguna: {editingUser.name}
                </h3>
              </div>
              <button onClick={closeModal} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 6 }}>Nama Lengkap *</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Contoh: Achmad Syafi'i"
                  style={{ width: "100%", padding: "10px 14px", border: "1px solid var(--border)", borderRadius: 10, background: "var(--surface)", fontSize: 13, color: "var(--text-primary)", outline: "none", boxSizing: "border-box" }} required
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 6 }}>Alamat Email *</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="syafii@porosmadura.com"
                  style={{ width: "100%", padding: "10px 14px", border: "1px solid var(--border)", borderRadius: 10, background: "var(--surface)", fontSize: 13, color: "var(--text-primary)", outline: "none", boxSizing: "border-box" }} required
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 6 }}>Role Hak Otorisasi *</label>
                <select value={role} onChange={e => setRole(e.target.value)}
                  style={{ width: "100%", padding: "10px 14px", border: "1px solid var(--border)", borderRadius: 10, background: "var(--surface)", fontSize: 13, color: "var(--text-primary)", outline: "none", boxSizing: "border-box", cursor: "pointer" }}>
                  <option value="SUPER_ADMIN">Super Admin</option>
                  <option value="ADMIN">Administrator</option>
                  <option value="EDITOR">Editor / Redaktur</option>
                  <option value="REPORTER">Reporter / Jurnalis</option>
                  <option value="CONTRIBUTOR">Kontributor Khusus</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 6 }}>
                  Password Baru (Kosongkan jika tidak ingin mengubah)
                </label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                  style={{ width: "100%", padding: "10px 14px", border: "1px solid var(--border)", borderRadius: 10, background: "var(--surface)", fontSize: 13, color: "var(--text-primary)", outline: "none", boxSizing: "border-box" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
                <button type="button" onClick={closeModal} style={{ padding: "9px 18px", borderRadius: 10, border: "1px solid var(--border)", background: "none", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", cursor: "pointer" }}>
                  Batal
                </button>
                <button type="submit" disabled={updateMutation.isPending} style={{ padding: "9px 20px", borderRadius: 10, border: "none", background: "var(--brand)", fontSize: 13, fontWeight: 700, color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, boxShadow: "0 2px 8px rgba(215, 25, 32, 0.25)" }}>
                  {updateMutation.isPending && <Loader2 size={14} className="animate-spin" />}
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

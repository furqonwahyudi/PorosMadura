import React, { useState } from "react";
import { Search, UserPlus, MoreHorizontal, Activity, ShieldCheck, Clock, Globe, Edit2, UserX } from "lucide-react";

type Role = "Super Admin" | "Pemimpin Redaksi" | "Editor" | "Reporter" | "Kontributor" | "Sales";

const ROLE_CONFIG: Record<Role, { color: string; bg: string }> = {
  "Super Admin": { color: "var(--red)", bg: "var(--red-subtle)" },
  "Pemimpin Redaksi": { color: "var(--purple)", bg: "var(--purple-subtle)" },
  "Editor": { color: "var(--blue)", bg: "var(--blue-subtle)" },
  "Reporter": { color: "var(--green)", bg: "var(--green-subtle)" },
  "Kontributor": { color: "var(--orange)", bg: "var(--orange-subtle)" },
  "Sales": { color: "#e91e8c", bg: "#e91e8c18" },
};

const MOCK_USERS = [
  { id: "1", username: "superadmin", name: "Muhamad Furqon", email: "furqon@porosmadura.com", role: "Super Admin" as Role, articles: 0, status: "active", lastLogin: "Baru saja", lastIp: "192.168.1.1", avatar: "MF" },
  { id: "2", username: "pimred_ali", name: "H. Ali Masyhuri", email: "ali@porosmadura.com", role: "Pemimpin Redaksi" as Role, articles: 12, status: "active", lastLogin: "2 jam lalu", lastIp: "114.122.80.5", avatar: "AM" },
  { id: "3", username: "editor_siti", name: "Siti Rahmah", email: "siti@porosmadura.com", role: "Editor" as Role, articles: 47, status: "active", lastLogin: "1 jam lalu", lastIp: "36.77.200.10", avatar: "SR" },
  { id: "4", username: "reporter_ahmad", name: "Ahmad Syafi'i", email: "ahmad@porosmadura.com", role: "Reporter" as Role, articles: 312, status: "active", lastLogin: "30 menit lalu", lastIp: "202.93.4.22", avatar: "AS" },
  { id: "5", username: "reporter_dewi", name: "Dewi Puspita", email: "dewi@porosmadura.com", role: "Reporter" as Role, articles: 156, status: "active", lastLogin: "Kemarin", lastIp: "36.77.4.82", avatar: "DP" },
  { id: "6", username: "kontributor_hasan", name: "Hasan Basri", email: "hasan@gmail.com", role: "Kontributor" as Role, articles: 23, status: "suspended", lastLogin: "3 hari lalu", lastIp: "180.244.3.90", avatar: "HB" },
  { id: "7", username: "sales_rina", name: "Rina Maulida", email: "rina@porosmadura.com", role: "Sales" as Role, articles: 0, status: "active", lastLogin: "4 jam lalu", lastIp: "202.93.10.8", avatar: "RM" },
];

export default function AllUsersPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role | "all">("all");

  const filtered = MOCK_USERS.filter(u => {
    if (roleFilter !== "all" && u.role !== roleFilter) return false;
    if (search && !u.name.toLowerCase().includes(search.toLowerCase()) && !u.username.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const roles: (Role | "all")[] = ["all", "Super Admin", "Pemimpin Redaksi", "Editor", "Reporter", "Kontributor", "Sales"];

  return (
    <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 20 }} className="animate-fade-in">
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", margin: 0, letterSpacing: -0.5 }}>
            CMS User Directory &amp; Activity Accounts
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "4px 0 0" }}>
            {MOCK_USERS.length} akun terdaftar
          </p>
        </div>
        <a href="/admin/users/add" style={{
          display: "flex", alignItems: "center", gap: 7, padding: "8px 16px",
          background: "var(--brand)", border: "none", borderRadius: 8,
          cursor: "pointer", color: "#fff", fontSize: 13, fontWeight: 600, textDecoration: "none",
        }}>
          <UserPlus size={15} /> Tambah User
        </a>
      </div>

      {/* Role stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10 }}>
        {Object.entries(ROLE_CONFIG).map(([role, cfg]) => {
          const count = MOCK_USERS.filter(u => u.role === role).length;
          return (
            <div key={role} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: cfg.color, flexShrink: 0 }} />
                <span style={{ fontSize: 10, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.04em" }}>{role}</span>
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
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari nama atau username..."
            style={{ width: "100%", padding: "8px 10px 8px 32px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 13, color: "var(--text-primary)", outline: "none" }}
          />
        </div>
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          {roles.map(r => (
            <button key={r} onClick={() => setRoleFilter(r)}
              style={{
                padding: "6px 11px", borderRadius: 7, border: "1px solid",
                fontSize: 12, fontWeight: 500, cursor: "pointer",
                borderColor: roleFilter === r ? "var(--brand)" : "var(--border)",
                background: roleFilter === r ? "var(--brand-subtle)" : "transparent",
                color: roleFilter === r ? "var(--brand)" : "var(--text-secondary)",
              }}
            >{r === "all" ? "Semua Role" : r}</button>
          ))}
        </div>
      </div>

      {/* Users table */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
        <div style={{
          display: "grid", gridTemplateColumns: "200px 1fr 120px 80px 100px 130px 90px",
          gap: 12, padding: "10px 16px",
          background: "var(--bg-subtle)", borderBottom: "1px solid var(--border)",
        }}>
          {["Pengguna", "Email", "Role", "Artikel", "Status", "Login Terakhir", "Aksi"].map(h => (
            <span key={h} style={{ fontSize: 11, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</span>
          ))}
        </div>

        {filtered.map((u, i) => {
          const rc = ROLE_CONFIG[u.role];
          return (
            <div key={u.id} style={{
              display: "grid", gridTemplateColumns: "200px 1fr 120px 80px 100px 130px 90px",
              gap: 12, padding: "13px 16px", alignItems: "center",
              borderBottom: i < filtered.length - 1 ? "1px solid var(--border)" : "none",
            }}>
              {/* Avatar + name */}
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                  background: rc.bg,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, fontWeight: 700, color: rc.color,
                }}>
                  {u.avatar}
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>{u.name}</p>
                  <p style={{ fontSize: 11, color: "var(--text-tertiary)", margin: 0 }}>@{u.username}</p>
                </div>
              </div>

              <span style={{ fontSize: 12, color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.email}</span>

              {/* Role badge */}
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 20,
                background: rc.bg, color: rc.color,
              }}>
                <ShieldCheck size={10} /> {u.role}
              </span>

              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{u.articles.toLocaleString()}</span>

              {/* Status */}
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 20,
                background: u.status === "active" ? "var(--green-subtle)" : "var(--red-subtle)",
                color: u.status === "active" ? "var(--green)" : "var(--red)",
              }}>
                <div style={{ width: 5, height: 5, borderRadius: "50%", background: "currentColor" }} />
                {u.status === "active" ? "Aktif" : "Suspended"}
              </span>

              {/* Last login */}
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <Clock size={10} style={{ color: "var(--text-tertiary)" }} />
                  <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{u.lastLogin}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <Globe size={10} style={{ color: "var(--text-tertiary)" }} />
                  <span style={{ fontSize: 11, fontFamily: "monospace", color: "var(--text-tertiary)" }}>{u.lastIp}</span>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: 5 }}>
                <button style={{ padding: "5px 8px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--bg-subtle)", color: "var(--text-secondary)", cursor: "pointer" }}>
                  <Edit2 size={12} />
                </button>
                <button style={{ padding: "5px 8px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--bg-subtle)", color: u.status === "active" ? "var(--red)" : "var(--green)", cursor: "pointer" }}>
                  <UserX size={12} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

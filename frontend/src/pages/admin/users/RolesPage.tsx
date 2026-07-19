import React, { useState } from "react";
import { Shield, Save, CheckCircle, HelpCircle } from "lucide-react";

type Role = "Super Admin" | "Pemimpin Redaksi" | "Editor" | "Reporter" | "Kontributor" | "Sales";
type Permission = "create_post" | "publish_post" | "edit_others_post" | "delete_post" | "manage_comments" | "manage_ads" | "manage_seo" | "manage_settings";

const INITIAL_MATRIX: Record<Role, Record<Permission, boolean>> = {
  "Super Admin": {
    create_post: true, publish_post: true, edit_others_post: true, delete_post: true,
    manage_comments: true, manage_ads: true, manage_seo: true, manage_settings: true
  },
  "Pemimpin Redaksi": {
    create_post: true, publish_post: true, edit_others_post: true, delete_post: true,
    manage_comments: true, manage_ads: false, manage_seo: true, manage_settings: true
  },
  "Editor": {
    create_post: true, publish_post: true, edit_others_post: true, delete_post: false,
    manage_comments: true, manage_ads: false, manage_seo: false, manage_settings: false
  },
  "Reporter": {
    create_post: true, publish_post: false, edit_others_post: false, delete_post: false,
    manage_comments: false, manage_ads: false, manage_seo: false, manage_settings: false
  },
  "Kontributor": {
    create_post: true, publish_post: false, edit_others_post: false, delete_post: false,
    manage_comments: false, manage_ads: false, manage_seo: false, manage_settings: false
  },
  "Sales": {
    create_post: false, publish_post: false, edit_others_post: false, delete_post: false,
    manage_comments: false, manage_ads: true, manage_seo: false, manage_settings: false
  }
};

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
  const [matrix, setMatrix] = useState<Record<Role, Record<Permission, boolean>>>(INITIAL_MATRIX);
  const [saved, setSaved] = useState(false);

  const togglePermission = (role: Role, perm: Permission) => {
    if (role === "Super Admin") return; // Super Admin permissions cannot be modified
    setMatrix(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        [perm]: !prev[role][perm]
      }
    }));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const roles: Role[] = ["Super Admin", "Pemimpin Redaksi", "Editor", "Reporter", "Kontributor", "Sales"];
  const permissions: Permission[] = ["create_post", "publish_post", "edit_others_post", "delete_post", "manage_comments", "manage_ads", "manage_seo", "manage_settings"];

  return (
    <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 20 }} className="animate-fade-in">
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", margin: 0, letterSpacing: -0.5 }}>
            Role-Based Access Control (RBAC) Matrices
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "4px 0 0" }}>
            Atur tingkat otorisasi hak izin akses tindakan sistem untuk setiap tingkatan role CMS
          </p>
        </div>
        <button
          onClick={handleSave}
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
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
        {/* Table header */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "180px repeat(8, 1fr)",
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
            key={role}
            style={{
              display: "grid",
              gridTemplateColumns: "180px repeat(8, 1fr)",
              gap: 12, padding: "16px 16px",
              borderBottom: rIdx < roles.length - 1 ? "1px solid var(--border)" : "none",
              alignItems: "center"
            }}
          >
            {/* Role Header */}
            <div>
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{role}</span>
              <p style={{ fontSize: 11, color: "var(--text-secondary)", margin: "2px 0 0" }}>
                {role === "Super Admin" ? "Akses sistem penuh tanpa batas" : `Otorisasi kustom untuk ${role}`}
              </p>
            </div>

            {/* Permission columns */}
            {permissions.map(perm => {
              const active = matrix[role][perm];
              const isSuper = role === "Super Admin";
              return (
                <div key={perm} style={{ display: "flex", justifyContent: "center" }}>
                  <div
                    onClick={() => togglePermission(role, perm)}
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

      {/* Permission Explanations / Help list */}
      <div style={{
        background: "var(--bg-subtle)", border: "1px solid var(--border)",
        borderRadius: 10, padding: 16, display: "flex", flexDirection: "column", gap: 12
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <HelpCircle size={15} style={{ color: "var(--text-secondary)" }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>Daftar Penjelasan Hak Akses</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {permissions.map(perm => (
            <div key={perm} style={{ fontSize: 12 }}>
              <strong style={{ color: "var(--text-primary)" }}>{PERMISSION_LABELS[perm].label}</strong>
              <p style={{ color: "var(--text-secondary)", margin: "2px 0 0" }}>{PERMISSION_LABELS[perm].desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

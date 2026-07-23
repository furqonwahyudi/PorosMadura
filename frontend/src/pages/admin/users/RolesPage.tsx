import React from "react";
import { Shield, HelpCircle, Info, Check, X } from "lucide-react";

type Role = "SUPER_ADMIN" | "ADMIN" | "EDITOR" | "REPORTER" | "CONTRIBUTOR";
type Permission = "create_post" | "publish_post" | "edit_others_post" | "delete_post" | "manage_comments" | "manage_ads" | "manage_seo" | "manage_settings";

interface RoleInfo {
  name: string;
  desc: string;
}

const ROLE_DETAILS: Record<Role, RoleInfo> = {
  SUPER_ADMIN: { name: "Super Admin", desc: "Akses sistem penuh tanpa batasan (Otoritas Tertinggi)" },
  ADMIN: { name: "Admin", desc: "Mengelola konten, iklan, komentar, optimasi SEO, dan konfigurasi portal" },
  EDITOR: { name: "Editor", desc: "Menulis, mengedit tulisan jurnalis lain, mengelola komentar, dan menerbitkan berita" },
  REPORTER: { name: "Reporter", desc: "Menulis draf berita secara mandiri (butuh persetujuan Editor untuk publish)" },
  CONTRIBUTOR: { name: "Kontributor", desc: "Menyumbang draf artikel/opini dari luar redaksi" }
};

const STATIC_MATRIX: Record<Role, Record<Permission, boolean>> = {
  SUPER_ADMIN: {
    create_post: true, publish_post: true, edit_others_post: true, delete_post: true,
    manage_comments: true, manage_ads: true, manage_seo: true, manage_settings: true
  },
  ADMIN: {
    create_post: true, publish_post: true, edit_others_post: true, delete_post: true,
    manage_comments: true, manage_ads: true, manage_seo: true, manage_settings: true
  },
  EDITOR: {
    create_post: true, publish_post: true, edit_others_post: true, delete_post: false,
    manage_comments: true, manage_ads: false, manage_seo: false, manage_settings: false
  },
  REPORTER: {
    create_post: true, publish_post: false, edit_others_post: false, delete_post: false,
    manage_comments: false, manage_ads: false, manage_seo: false, manage_settings: false
  },
  CONTRIBUTOR: {
    create_post: true, publish_post: false, edit_others_post: false, delete_post: false,
    manage_comments: false, manage_ads: false, manage_seo: false, manage_settings: false
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
  const roles: Role[] = ["SUPER_ADMIN", "ADMIN", "EDITOR", "REPORTER", "CONTRIBUTOR"];
  const permissions: Permission[] = ["create_post", "publish_post", "edit_others_post", "delete_post", "manage_comments", "manage_ads", "manage_seo", "manage_settings"];

  return (
    <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 20 }} className="animate-fade-in">
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", margin: 0, letterSpacing: -0.5 }}>
          Role-Based Access Control (RBAC) Matrices
        </h1>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "4px 0 0" }}>
          Panduan otorisasi hak izin akses tindakan sistem untuk setiap tingkatan Peran (Role) di Poros Madura
        </p>
      </div>

      {/* Info Alert Box */}
      <div style={{
        display: "flex", gap: 12, padding: "12px 16px", background: "var(--blue-subtle)",
        border: "1px solid var(--blue-border)", borderRadius: 10, alignItems: "center"
      }}>
        <Info size={18} style={{ color: "var(--blue)", flexShrink: 0 }} />
        <span style={{ fontSize: 12.5, color: "var(--blue)", fontWeight: 500 }}>
          Informasi: Matriks di bawah ini bersifat tetap (Read-only) sesuai konfigurasi sistem keamanan server Poros Madura untuk menjaga stabilitas hak akses redaksi.
        </span>
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
              key={role}
              style={{
                display: "grid",
                gridTemplateColumns: "220px repeat(8, 1fr)",
                gap: 12, padding: "16px 16px",
                borderBottom: rIdx < roles.length - 1 ? "1px solid var(--border)" : "none",
                alignItems: "center"
              }}
            >
              {/* Role Header */}
              <div>
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>
                  {ROLE_DETAILS[role].name}
                </span>
                <p style={{ fontSize: 11, color: "var(--text-secondary)", margin: "2px 0 0" }}>
                  {ROLE_DETAILS[role].desc}
                </p>
              </div>

              {/* Permission columns */}
              {permissions.map(perm => {
                const active = STATIC_MATRIX[role][perm];
                return (
                  <div key={perm} style={{ display: "flex", justifyContent: "center" }}>
                    {active ? (
                      <div style={{
                        display: "flex", alignItems: "center", justifyContent: "center",
                        width: 22, height: 22, borderRadius: "50%", background: "var(--green-subtle)", color: "var(--green)"
                      }}>
                        <Check size={14} strokeWidth={3} />
                      </div>
                    ) : (
                      <div style={{
                        display: "flex", alignItems: "center", justifyContent: "center",
                        width: 22, height: 22, borderRadius: "50%", background: "var(--red-subtle)", color: "var(--red)"
                      }}>
                        <X size={14} strokeWidth={3} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Permission Explanations / Help list */}
      <div style={{
        background: "var(--bg-subtle)", border: "1px solid var(--border)",
        borderRadius: 10, padding: 16, display: "flex", flexDirection: "column", gap: 12
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <HelpCircle size={15} style={{ color: "var(--text-secondary)" }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>Daftar Penjelasan Hak Izin Akses</span>
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
  );
}

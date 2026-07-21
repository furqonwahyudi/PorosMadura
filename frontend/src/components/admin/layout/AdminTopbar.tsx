import React, { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import {
  Search, Bell, Moon, Sun, Command, ChevronRight,
  Settings, LogOut, User, HelpCircle, Menu
} from "lucide-react";
import { useAdminAuth } from "../../../context/AdminAuthContext";

interface AdminTopbarProps {
  onToggleSidebar: () => void;
  onOpenSearch: () => void;
  darkMode: boolean;
  onToggleDark: () => void;
}

const NOTIFICATIONS = [
  { id: 1, type: "comment", text: "Ahmad Fauzi mengomentari \"Jembatan Suramadu\"", time: "2 menit lalu", unread: true },
  { id: 2, type: "publish", text: "Artikel terjadwal berhasil diterbitkan otomatis", time: "14 menit lalu", unread: true },
  { id: 3, type: "user", text: "Jurnalis baru Siti Rahayu telah mendaftar", time: "1 jam lalu", unread: true },
  { id: 4, type: "system", text: "Google Indexing API: 24 URL terkirim", time: "2 jam lalu", unread: false },
];

const PATH_LABELS: Record<string, string> = {
  admin: "Portal Admin",
  dashboard: "Dashboard",
  analytics: "Analytics",
  visitor: "Visitors",
  posts: "Post Management",
  create: "Create Article",
  published: "Published",
  draft: "Draft",
  scheduled: "Scheduled",
  recommendation: "Recommendation",
  breaking: "Breaking News",
  trash: "Trash",
  taxonomies: "Taxonomies",
  categories: "Categories",
  tags: "Tags",
  media: "Media Library",
  upload: "Upload",
  images: "Images",
  videos: "Videos",
  documents: "Documents",
  optimization: "Optimization",
  comments: "Comments",
  moderation: "Moderation",
  spam: "Spam",
  blacklist: "Blacklist",
  reports: "User Reports",
  users: "User Management",
  roles: "Roles & Permissions",
  ads: "Advertisement",
  seo: "SEO Settings",
  market: "Market Widget",
  settings: "Website Settings",
};

export default function AdminTopbar({ onToggleSidebar, onOpenSearch, darkMode, onToggleDark }: AdminTopbarProps) {
  const { user, logout } = useAdminAuth();
  const location = useLocation();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  // Generate breadcrumbs from path
  const paths = location.pathname.split("/").filter(Boolean);
  const crumbs = paths.map((path, idx) => {
    if ((path === "create" || path === "add") && paths[idx - 1] === "users") {
      return "Create User";
    }
    return PATH_LABELS[path] || path.charAt(0).toUpperCase() + path.slice(1).replace("-", " ");
  });
  const unreadCount = NOTIFICATIONS.filter(n => n.unread).length;

  return (
    <header
      style={{
        height: "var(--header-height)",
        background: "var(--surface)",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        padding: "0 20px",
        gap: 12,
        position: "sticky",
        top: 0,
        zIndex: 20,
        flexShrink: 0,
      }}
    >
      {/* Mobile Menu Toggle */}
      <button
        onClick={onToggleSidebar}
        className="lg:hidden p-1.5 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-muted)]"
        style={{ border: "none", background: "transparent", cursor: "pointer" }}
      >
        <Menu size={20} />
      </button>

      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 4, flex: 1, minWidth: 0 }}>
        {crumbs.map((crumb, i) => (
          <span key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {i > 0 && <ChevronRight size={12} style={{ color: "var(--text-tertiary)" }} />}
            <span style={{
              fontSize: 13,
              color: i === crumbs.length - 1 ? "var(--text-primary)" : "var(--text-tertiary)",
              fontWeight: i === crumbs.length - 1 ? 600 : 400,
              whiteSpace: "nowrap",
            }}>
              {crumb}
            </span>
          </span>
        ))}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        {/* Search trigger */}
        <button
          onClick={onOpenSearch}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "5px 10px",
            background: "var(--bg-subtle)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            cursor: "pointer",
            color: "var(--text-tertiary)",
            fontSize: 12,
            transition: "all 0.1s",
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = "var(--text-secondary)"}
          onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
        >
          <Search size={13} />
          <span className="hidden sm:inline">Search...</span>
          <span style={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            padding: "1px 5px",
            background: "var(--bg-muted)",
            borderRadius: 4,
            fontSize: 11,
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            <Command size={10} /><span>K</span>
          </span>
        </button>

        {/* Dark mode */}
        <button
          onClick={onToggleDark}
          style={{
            width: 32, height: 32, borderRadius: 8, border: "none", background: "transparent",
            cursor: "pointer", color: "var(--text-secondary)",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "background 0.1s",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "var(--bg-subtle)"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        >
          {darkMode ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Notifications */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => { setShowNotifs(!showNotifs); setShowProfile(false); }}
            style={{
              width: 32, height: 32, borderRadius: 8, border: "none", background: "transparent",
              cursor: "pointer", color: "var(--text-secondary)",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "background 0.1s",
              position: "relative",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "var(--bg-subtle)"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span style={{
                position: "absolute", top: 4, right: 4, width: 8, height: 8,
                background: "var(--brand)", borderRadius: "50%",
                border: "2px solid var(--surface)",
              }} />
            )}
          </button>

          {showNotifs && (
            <>
              <div style={{ position: "fixed", inset: 0, zIndex: 30 }} onClick={() => setShowNotifs(false)} />
              <div
                className="animate-fade-in"
                style={{
                  position: "absolute", right: 0, marginTop: 6, width: 320,
                  background: "var(--surface)", border: "1px solid var(--border)",
                  borderRadius: 12, boxShadow: "var(--shadow-lg)", overflow: "hidden", zIndex: 40,
                }}
              >
                <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>Notifikasi</span>
                  <span style={{ fontSize: 11, color: "var(--brand)", fontWeight: 600, cursor: "pointer" }}>Mark all read</span>
                </div>
                <div style={{ maxHeight: 280, overflowY: "auto" }}>
                  {NOTIFICATIONS.map(n => (
                    <div
                      key={n.id}
                      style={{
                        padding: "10px 16px", borderBottom: "1px solid var(--border)",
                        background: n.unread ? "var(--brand-subtle)" : "transparent",
                        display: "flex", gap: 10, alignItems: "flex-start",
                        cursor: "pointer", fontSize: 12.5,
                      }}
                    >
                      <div style={{ flex: 1, color: "var(--text-primary)" }}>{n.text}</div>
                      <div style={{ fontSize: 10, color: "var(--text-tertiary)", whiteSpace: "nowrap" }}>{n.time}</div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Profile Menu */}
        {user && (
          <div style={{ position: "relative" }}>
            <button
              onClick={() => { setShowProfile(!showProfile); setShowNotifs(false); }}
              style={{
                display: "flex", alignItems: "center", gap: 8, padding: "2px 6px",
                background: "transparent", border: "none", borderRadius: 8, cursor: "pointer",
                transition: "background 0.1s",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "var(--bg-subtle)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <div className="w-7 h-7 rounded-full bg-[var(--brand)] text-white flex items-center justify-center font-bold text-xs">
                {user.name.charAt(0).toUpperCase()}
              </div>
            </button>

            {showProfile && (
              <>
                <div style={{ position: "fixed", inset: 0, zIndex: 30 }} onClick={() => setShowProfile(false)} />
                <div
                  className="animate-fade-in"
                  style={{
                    position: "absolute", right: 0, marginTop: 6, width: 220,
                    background: "var(--surface)", border: "1px solid var(--border)",
                    borderRadius: 12, boxShadow: "var(--shadow-lg)", overflow: "hidden", zIndex: 40,
                  }}
                >
                  {/* Account Header */}
                  <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{user.name}</div>
                    <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 2 }}>{user.email}</div>
                  </div>

                  {/* Links */}
                  <div style={{ padding: "6px" }}>
                    <Link
                      to="/admin/settings"
                      onClick={() => setShowProfile(false)}
                      style={{
                        display: "flex", alignItems: "center", gap: 8, padding: "8px 10px",
                        borderRadius: 8, color: "var(--text-secondary)", fontSize: 13, textDecoration: "none",
                      }}
                      className="hover:bg-[var(--bg-muted)] hover:text-[var(--text-primary)]"
                    >
                      <User size={14} /> Profile
                    </Link>
                    <Link
                      to="/admin/settings"
                      onClick={() => setShowProfile(false)}
                      style={{
                        display: "flex", alignItems: "center", gap: 8, padding: "8px 10px",
                        borderRadius: 8, color: "var(--text-secondary)", fontSize: 13, textDecoration: "none",
                      }}
                      className="hover:bg-[var(--bg-muted)] hover:text-[var(--text-primary)]"
                    >
                      <Settings size={14} /> Settings
                    </Link>
                  </div>

                  {/* Logout */}
                  <div style={{ borderTop: "1px solid var(--border)", padding: "6px" }}>
                    <button
                      onClick={() => { logout(); setShowProfile(false); }}
                      style={{
                        display: "flex", alignItems: "center", gap: 8, padding: "8px 10px",
                        width: "100%", border: "none", background: "transparent", cursor: "pointer",
                        borderRadius: 8, color: "var(--red)", fontSize: 13, fontWeight: 500,
                        textAlign: "left",
                      }}
                      className="hover:bg-[var(--red-subtle)]"
                    >
                      <LogOut size={14} /> Log Out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

import React, { useState } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, BarChart2, Users, FileText, PenSquare, CheckCircle,
  FileEdit, Clock, Star, Zap, Trash2, FolderOpen, Tag, Image, Upload,
  ImageIcon, Video, FileBox, Minimize2, MessageSquare, AlertTriangle,
  Shield, Flag, UserCog, UserPlus, Key, Megaphone, TrendingUp, Grid3x3,
  Newspaper, Briefcase, DollarSign, CalendarClock, FileBarChart, Settings,
  Search as SearchOpt, Map, ArrowLeftRight, Globe, ChevronLeft, ChevronDown,
  ChevronRight, BarChart3, Gauge, ShoppingCart, Layers
} from "lucide-react";
import { useAdminAuth } from "../../../context/AdminAuthContext";

type NavItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
  path?: string;
  badge?: string | number;
  badgeColor?: string;
  children?: NavItem[];
};

const NAV: NavItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard size={16} />,
    children: [
      { id: "overview", label: "Overview", icon: <Gauge size={14} />, path: "/admin/dashboard" },
      { id: "analytics", label: "Analytics", icon: <BarChart2 size={14} />, path: "/admin/dashboard/analytics" },
      { id: "visitors", label: "Visitors", icon: <Users size={14} />, path: "/admin/dashboard/visitor" },
    ],
  },
  {
    id: "posts",
    label: "Post Management",
    icon: <FileText size={16} />,
    children: [
      { id: "all-articles", label: "All Articles", icon: <FileText size={14} />, path: "/admin/posts", badge: 247 },
      { id: "create-article", label: "Create Article", icon: <PenSquare size={14} />, path: "/admin/posts/create" },
      { id: "recommendation", label: "Recommendation", icon: <Star size={14} />, path: "/admin/posts/recommendation" },
      { id: "breaking", label: "Breaking News", icon: <Zap size={14} />, path: "/admin/posts/breaking", badge: 2, badgeColor: "red" },
      { id: "trash", label: "Trash", icon: <Trash2 size={14} />, path: "/admin/posts/trash" },
    ],
  },
  {
    id: "taxonomies",
    label: "Taxonomies",
    icon: <FolderOpen size={16} />,
    children: [
      { id: "categories", label: "Categories", icon: <FolderOpen size={14} />, path: "/admin/taxonomies/categories", badge: 18 },
      { id: "tags", label: "Tags", icon: <Tag size={14} />, path: "/admin/taxonomies/tags", badge: 94 },
    ],
  },
  {
    id: "media",
    label: "Media",
    icon: <Image size={16} />,
    children: [
      { id: "gallery", label: "Gallery", icon: <Grid3x3 size={14} />, path: "/admin/media" },
      { id: "upload", label: "Upload", icon: <Upload size={14} />, path: "/admin/media/upload" },
      { id: "images", label: "Images", icon: <ImageIcon size={14} />, path: "/admin/media/images" },
      { id: "videos", label: "Videos", icon: <Video size={14} />, path: "/admin/media/videos" },
      { id: "documents", label: "Documents", icon: <FileBox size={14} />, path: "/admin/media/documents" },
      { id: "optimization", label: "Optimization", icon: <Minimize2 size={14} />, path: "/admin/media/optimization" },
    ],
  },
  {
    id: "comments",
    label: "Comments",
    icon: <MessageSquare size={16} />,
    children: [
      { id: "moderation", label: "Moderation", icon: <MessageSquare size={14} />, path: "/admin/comments/moderation", badge: 28, badgeColor: "orange" },
      { id: "spam", label: "Spam", icon: <AlertTriangle size={14} />, path: "/admin/comments/spam", badge: 7, badgeColor: "red" },
      { id: "blacklist", label: "Blacklist", icon: <Shield size={14} />, path: "/admin/comments/blacklist" },
      { id: "user-reports", label: "User Reports", icon: <Flag size={14} />, path: "/admin/comments/reports", badge: 3, badgeColor: "red" },
    ],
  },
  {
    id: "users",
    label: "User Management",
    icon: <UserCog size={16} />,
    children: [
      { id: "all-users", label: "All Users", icon: <Users size={14} />, path: "/admin/users", badge: 52 },
      { id: "add-user", label: "Add User", icon: <UserPlus size={14} />, path: "/admin/users/create" },
      { id: "roles", label: "Roles & Permissions", icon: <Key size={14} />, path: "/admin/users/roles" },
    ],
  },
  {
    id: "ads",
    label: "Advertisement",
    icon: <Megaphone size={16} />,
    children: [
      { id: "ads-overview", label: "Overview", icon: <Gauge size={14} />, path: "/admin/ads" },
      { id: "ads-analytics", label: "Analytics", icon: <TrendingUp size={14} />, path: "/admin/ads/analytics" },
      { id: "ad-slots", label: "Ad Slots", icon: <Layers size={14} />, path: "/admin/ads/slots" },
      { id: "advertisements", label: "Advertisements", icon: <Megaphone size={14} />, path: "/admin/ads/advertisements" },
      { id: "campaigns", label: "Campaigns", icon: <Briefcase size={14} />, path: "/admin/ads/campaigns" },
      { id: "advertisers", label: "Advertisers", icon: <Users size={14} />, path: "/admin/ads/advertisers" },
      { id: "pricing", label: "Pricing Setup", icon: <DollarSign size={14} />, path: "/admin/ads/pricing" },
      { id: "scheduled-ads", label: "Scheduled Ads", icon: <CalendarClock size={14} />, path: "/admin/ads/scheduled" },
      { id: "ad-reports", label: "Reports", icon: <FileBarChart size={14} />, path: "/admin/ads/reports" },
      { id: "global-settings", label: "Global Settings", icon: <Settings size={14} />, path: "/admin/ads/settings" },
    ],
  },
  {
    id: "seo",
    label: "SEO",
    icon: <SearchOpt size={16} />,
    children: [
      { id: "seo-analytics", label: "Analytics", icon: <BarChart3 size={14} />, path: "/admin/seo/analytics" },
      { id: "seo-settings", label: "General Settings", icon: <Settings size={14} />, path: "/admin/seo/settings" },
      { id: "indexing", label: "Indexing", icon: <Map size={14} />, path: "/admin/seo/indexing" },
      { id: "redirects", label: "Redirects", icon: <ArrowLeftRight size={14} />, path: "/admin/seo/redirect" },
    ],
  },
  {
    id: "market-widget",
    label: "Market Widget",
    icon: <ShoppingCart size={16} />,
    path: "/admin/market",
  },
  {
    id: "website-settings",
    label: "Website Settings",
    icon: <Globe size={16} />,
    children: [
      { id: "site-general", label: "General", icon: <Settings size={14} />, path: "/admin/settings/general" },
      { id: "static-pages", label: "Static Pages", icon: <Newspaper size={14} />, path: "/admin/settings/pages" },
    ],
  },
];

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export default function AdminSidebar({ isOpen, onClose, collapsed, onToggleCollapse }: AdminSidebarProps) {
  const { user } = useAdminAuth();
  const location = useLocation();

  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    NAV.forEach(section => {
      if (section.children) {
        const isActive = section.children.some(child => child.path && (
          child.id === "all-articles" ? location.pathname === "/admin/posts" : location.pathname.startsWith(child.path)
        ));
        if (isActive) {
          init[section.id] = true;
        }
      }
    });
    return init;
  });

  const toggleSection = (id: string) => {
    setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const badgeStyle = (color?: string) => {
    if (color === "red") return { background: "var(--red-subtle)", color: "var(--red)" };
    if (color === "orange") return { background: "var(--orange-subtle)", color: "var(--orange)" };
    return { background: "var(--bg-muted)", color: "var(--text-secondary)" };
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full bg-[var(--surface)] border-r border-[var(--border)] z-40 flex flex-col transition-all duration-200
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static lg:z-auto`}
        style={{
          width: collapsed ? "var(--sidebar-collapsed)" : "var(--sidebar-width)",
          height: "100vh",
          position: "sticky",
          top: 0,
        }}
      >
        {/* Logo */}
        <div
          style={{
            height: "var(--header-height)",
            display: "flex",
            alignItems: "center",
            padding: collapsed ? "0 18px" : "0 16px",
            borderBottom: "1px solid var(--border)",
            gap: 10,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: "var(--brand)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <span style={{ color: "#fff", fontWeight: 800, fontSize: 13, letterSpacing: -0.5 }}>P</span>
          </div>
          {!collapsed && (
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: "var(--text-primary)", lineHeight: 1.2, whiteSpace: "nowrap" }}>
                Poros Madura
              </div>
              <div style={{ fontSize: 11, color: "var(--text-tertiary)", lineHeight: 1 }}>CMS Admin</div>
            </div>
          )}
        </div>

        {/* Nav scroll area */}
        <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: "8px 0" }} className="scrollbar-thin">
          {NAV.map(section => {
            const hasChildren = section.children && section.children.length > 0;
            const isSectionOpen = !!openSections[section.id];

            if (!hasChildren && section.path) {
              const active = location.pathname === section.path;
              return (
                <NavLink
                  key={section.id}
                  to={section.path}
                  onClick={onClose}
                  title={collapsed ? section.label : undefined}
                  className="flex items-center gap-2.5 w-full hover:bg-[var(--bg-muted)] transition-colors"
                  style={{
                    padding: collapsed ? "12px 22px" : "10px 12px 6px 12px",
                    background: active ? "var(--brand-subtle)" : "transparent",
                    color: active ? "var(--brand)" : "#6B7280",
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    whiteSpace: "nowrap",
                    marginTop: 8,
                  }}
                >
                  <span style={{ flexShrink: 0, opacity: active ? 1 : 0.75 }}>{section.icon}</span>
                  {!collapsed && <span style={{ flex: 1 }}>{section.label}</span>}
                </NavLink>
              );
            }

            return (
              <div key={section.id}>
                <button
                  onClick={() => { if (!collapsed) toggleSection(section.id); }}
                  title={collapsed ? section.label : undefined}
                  className="flex items-center gap-2.5 w-full hover:text-[var(--text-secondary)] transition-colors text-left"
                  style={{
                    padding: collapsed ? "12px 22px" : "10px 12px 6px 12px",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    color: "#6B7280",
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    whiteSpace: "nowrap",
                    marginTop: 8,
                  }}
                >
                  <span style={{ flexShrink: 0, opacity: 0.75 }}>{section.icon}</span>
                  {!collapsed && (
                    <>
                      <span style={{ flex: 1 }}>{section.label}</span>
                      {isSectionOpen ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
                    </>
                  )}
                </button>

                {!collapsed && isSectionOpen && (
                  <div className="animate-fade-in space-y-0.5 mt-1">
                    {section.children!.map(child => {
                      const isCreateEdit = child.id === "create-article" && location.pathname.startsWith("/admin/posts/edit/");
                      return (
                        <NavLink
                          key={child.id}
                          to={child.path ?? "#"}
                          onClick={onClose}
                          end
                          className={({ isActive }) => 
                            `flex items-center gap-2.5 w-full hover:bg-[var(--bg-muted)] transition-colors ${isActive || isCreateEdit ? "is-active-item" : ""}`
                          }
                          style={({ isActive }) => {
                            const isCurrentActive = isActive || isCreateEdit;
                            return {
                              padding: "8px 12px 8px 24px",
                              background: isCurrentActive ? "var(--brand-subtle)" : "transparent",
                              color: isCurrentActive ? "var(--brand)" : "#4B5563",
                              fontSize: 13,
                              fontWeight: isCurrentActive ? 500 : 400,
                              whiteSpace: "nowrap",
                            };
                          }}
                        >
                          <span style={{ flexShrink: 0, opacity: (location.pathname === child.path || isCreateEdit) ? 1 : 0.75 }}>{child.icon}</span>
                          <span style={{ flex: 1 }}>{child.label}</span>
                          {child.badge !== undefined && (
                            <span style={{
                              fontSize: 11,
                              fontWeight: 600,
                              padding: "1px 6px",
                              borderRadius: 99,
                              fontFamily: "'JetBrains Mono', monospace",
                              ...badgeStyle(child.badgeColor),
                            }}>
                              {child.badge}
                            </span>
                          )}
                        </NavLink>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* User profile section */}
        {user && !collapsed && (
          <div style={{ borderTop: "1px solid var(--border)", padding: "12px 16px", flexShrink: 0 }}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[var(--brand)] text-white flex items-center justify-center font-bold text-sm">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-[var(--text-primary)] truncate">{user.name}</p>
                <p className="text-[10px] text-[var(--text-tertiary)] truncate capitalize">
                  {user.role.toLowerCase().replace("_", " ")}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Collapse toggle */}
        <div style={{ borderTop: "1px solid var(--border)", padding: "8px", flexShrink: 0 }}>
          <button
            onClick={onToggleCollapse}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: collapsed ? "center" : "flex-end",
              width: "100%",
              padding: "6px",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "var(--text-tertiary)",
              borderRadius: 6,
              transition: "background 0.1s, color 0.1s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "var(--bg-muted)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-tertiary)"; }}
          >
            {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
          </button>
        </div>
      </aside>
    </>
  );
}

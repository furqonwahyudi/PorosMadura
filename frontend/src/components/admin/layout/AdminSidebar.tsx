import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Tags,
  Image,
  MessageSquare,
  Users,
  Megaphone,
  Search,
  TrendingUp,
  Settings,
  ChevronDown,
  ChevronRight,
  Newspaper,
  X,
} from "lucide-react";
import { useAdminAuth } from "../../../context/AdminAuthContext";

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path?: string;
  children?: { label: string; path: string }[];
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    icon: <LayoutDashboard size={18} />,
    children: [
      { label: "Overview", path: "/admin/dashboard" },
      { label: "Analytics", path: "/admin/dashboard/analytics" },
      { label: "Visitor", path: "/admin/dashboard/visitor" },
    ],
  },
  {
    label: "Post Management",
    icon: <FileText size={18} />,
    children: [
      { label: "Semua Artikel", path: "/admin/posts" },
      { label: "Tulis Artikel", path: "/admin/posts/create" },
      { label: "Published", path: "/admin/posts/published" },
      { label: "Draft", path: "/admin/posts/draft" },
      { label: "Terjadwal", path: "/admin/posts/scheduled" },
      { label: "Rekomendasi", path: "/admin/posts/recommendation" },
      { label: "Breaking News", path: "/admin/posts/breaking" },
      { label: "Trash", path: "/admin/posts/trash" },
    ],
  },
  {
    label: "Taxonomies",
    icon: <Tags size={18} />,
    children: [
      { label: "Kategori", path: "/admin/taxonomies/categories" },
      { label: "Tag", path: "/admin/taxonomies/tags" },
    ],
  },
  {
    label: "Media",
    icon: <Image size={18} />,
    children: [
      { label: "Gallery", path: "/admin/media" },
      { label: "Upload", path: "/admin/media/upload" },
      { label: "Images", path: "/admin/media/images" },
      { label: "Videos", path: "/admin/media/videos" },
      { label: "Dokumen", path: "/admin/media/documents" },
      { label: "Optimasi", path: "/admin/media/optimization" },
    ],
  },
  {
    label: "Komentar",
    icon: <MessageSquare size={18} />,
    children: [
      { label: "Moderasi", path: "/admin/comments/moderation" },
      { label: "Spam", path: "/admin/comments/spam" },
      { label: "Blacklist", path: "/admin/comments/blacklist" },
      { label: "User Reports", path: "/admin/comments/reports" },
    ],
  },
  {
    label: "User Management",
    icon: <Users size={18} />,
    children: [
      { label: "Semua User", path: "/admin/users" },
      { label: "Tambah User", path: "/admin/users/create" },
      { label: "Roles & Permissions", path: "/admin/users/roles" },
    ],
  },
  {
    label: "Ad Management",
    icon: <Megaphone size={18} />,
    children: [
      { label: "Overview", path: "/admin/ads" },
      { label: "Analytics", path: "/admin/ads/analytics" },
      { label: "Ad Slots", path: "/admin/ads/slots" },
      { label: "Iklan", path: "/admin/ads/advertisements" },
      { label: "Kampanye", path: "/admin/ads/campaigns" },
      { label: "Pengiklan", path: "/admin/ads/advertisers" },
      { label: "Harga", path: "/admin/ads/pricing" },
      { label: "Terjadwal", path: "/admin/ads/scheduled" },
      { label: "Laporan & Export", path: "/admin/ads/reports" },
      { label: "Pengaturan Global", path: "/admin/ads/settings" },
    ],
  },
  {
    label: "SEO",
    icon: <Search size={18} />,
    children: [
      { label: "Analytics", path: "/admin/seo/analytics" },
      { label: "Pengaturan Umum", path: "/admin/seo/settings" },
      { label: "Indexing", path: "/admin/seo/indexing" },
      { label: "Redirect & Sosial", path: "/admin/seo/redirect" },
    ],
  },
  {
    label: "Market Widget",
    icon: <TrendingUp size={18} />,
    path: "/admin/market",
  },
  {
    label: "Pengaturan Web",
    icon: <Settings size={18} />,
    children: [
      { label: "Umum", path: "/admin/settings/general" },
      { label: "Halaman Statis", path: "/admin/settings/pages" },
    ],
  },
];

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const location = useLocation();
  const { user } = useAdminAuth();

  // Track which parent menus are expanded
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    NAV_ITEMS.forEach((item) => {
      if (item.children) {
        const isActive = item.children.some((c) =>
          location.pathname.startsWith(c.path)
        );
        init[item.label] = isActive;
      }
    });
    return init;
  });

  const toggle = (label: string) => {
    setExpanded((prev) => ({ ...prev, [label]: !prev[label] }));
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

      {/* Sidebar panel */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-[#0D2B5C] z-40 flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static lg:z-auto
        `}
      >
        {/* Logo area */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#D71920] rounded-lg flex items-center justify-center shadow-lg">
              <Newspaper size={16} className="text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-none font-['Poppins']">
                Poros Madura
              </p>
              <p className="text-white/50 text-[10px] mt-0.5 font-medium tracking-wide uppercase">
                CMS Admin
              </p>
            </div>
          </div>
          {/* Close button — mobile only */}
          <button
            onClick={onClose}
            className="lg:hidden text-white/60 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5 scrollbar-thin">
          {NAV_ITEMS.map((item) => {
            const hasChildren = !!item.children;
            const isExpanded = expanded[item.label];
            const isParentActive =
              hasChildren &&
              item.children!.some((c) => location.pathname.startsWith(c.path));

            if (!hasChildren && item.path) {
              return (
                <NavLink
                  key={item.label}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                      isActive
                        ? "bg-white/15 text-white"
                        : "text-white/65 hover:bg-white/8 hover:text-white"
                    }`
                  }
                >
                  <span className="shrink-0">{item.icon}</span>
                  {item.label}
                </NavLink>
              );
            }

            return (
              <div key={item.label}>
                {/* Parent button */}
                <button
                  onClick={() => toggle(item.label)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                    isParentActive
                      ? "bg-white/10 text-white"
                      : "text-white/65 hover:bg-white/8 hover:text-white"
                  }`}
                >
                  <span className="shrink-0">{item.icon}</span>
                  <span className="flex-1 text-left">{item.label}</span>
                  <span className="shrink-0 transition-transform duration-200">
                    {isExpanded ? (
                      <ChevronDown size={14} />
                    ) : (
                      <ChevronRight size={14} />
                    )}
                  </span>
                </button>

                {/* Children */}
                {isExpanded && (
                  <div className="ml-4 mt-0.5 space-y-0.5 border-l border-white/10 pl-3">
                    {item.children!.map((child) => (
                      <NavLink
                        key={child.path}
                        to={child.path}
                        end
                        onClick={onClose}
                        className={({ isActive }) =>
                          `flex items-center gap-2 px-2.5 py-2 rounded-md text-xs font-medium transition-all duration-150 ${
                            isActive
                              ? "bg-[#D71920]/80 text-white"
                              : "text-white/55 hover:bg-white/8 hover:text-white"
                          }`
                        }
                      >
                        <span className="w-1 h-1 rounded-full bg-current opacity-60 shrink-0" />
                        {child.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* User badge at bottom */}
        {user && (
          <div className="px-4 py-3 border-t border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#D71920] flex items-center justify-center text-white text-xs font-bold shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-white text-xs font-semibold truncate">
                  {user.name}
                </p>
                <p className="text-white/50 text-[10px] truncate capitalize">
                  {user.role.toLowerCase().replace("_", " ")}
                </p>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}

import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";

/** Map route path prefix ke judul halaman */
const PAGE_TITLES: Record<string, string> = {
  "/admin/dashboard/analytics": "Real-time Content Performance Analytics",
  "/admin/dashboard/visitor": "Visitor Demographics & Tech Stack Logs",
  "/admin/dashboard": "Editorial & System Overview",
  "/admin/posts/create": "Tulis & Publikasi Artikel Baru",
  "/admin/posts/published": "Arsip Artikel Terpublikasi",
  "/admin/posts/draft": "Draft & Artikel Belum Diajukan",
  "/admin/posts/scheduled": "Antrian Terjadwal & Pipeline Konten",
  "/admin/posts/recommendation": "Konten Rekomendasi & Editor's Picks",
  "/admin/posts/breaking": "Breaking News Ticker & Flash Settings",
  "/admin/posts/trash": "Recycle Bin — Artikel Dihapus",
  "/admin/posts": "Master Article Repository",
  "/admin/taxonomies/categories": "Hierarki Kategori Artikel",
  "/admin/taxonomies/tags": "Manajemen Tag & Keywords Cloud",
  "/admin/media/upload": "Bulk Media Upload Zone",
  "/admin/media/images": "Image Asset Management",
  "/admin/media/videos": "Video Asset Management",
  "/admin/media/documents": "Document Attachments & Press Releases",
  "/admin/media/optimization": "Automated Media Optimization Settings",
  "/admin/media": "Central Media Library",
  "/admin/comments/moderation": "Comment Moderation & Approval Queue",
  "/admin/comments/spam": "Spam Comments Box",
  "/admin/comments/blacklist": "Forbidden Keywords & User Ban Lists",
  "/admin/comments/reports": "Flagged Comments & Community Reports",
  "/admin/users/create": "Buat Akun Administratif Baru",
  "/admin/users/roles": "Role-Based Access Control (RBAC) Matrices",
  "/admin/users": "CMS User Directory",
  "/admin/ads/analytics": "Granular Advertising Performance Analytics",
  "/admin/ads/slots": "Website Layout Ad Zones Configuration",
  "/admin/ads/advertisements": "Master Banner & Scripts Repository",
  "/admin/ads/campaigns": "Ad Campaigns & Contract Management",
  "/admin/ads/advertisers": "Client & Advertiser CRM Profiles",
  "/admin/ads/pricing": "Ad Inventory Pricing Models (Rate Cards)",
  "/admin/ads/scheduled": "Automated Ad Publication Scheduler",
  "/admin/ads/reports": "Exportable Advertising Performance Reports",
  "/admin/ads/settings": "Global Advertising Controls",
  "/admin/ads": "Advertising Dashboard & Inventory Overview",
  "/admin/seo/analytics": "Organic Search Performance Metrics",
  "/admin/seo/settings": "SEO Global Core Foundations",
  "/admin/seo/indexing": "Search Engine Crawl Control & Sitemaps",
  "/admin/seo/redirect": "URL Redirection Engine & Social Media",
  "/admin/market": "Financial & Market Live Ticker Feed Settings",
  "/admin/settings/general": "Core System & News Portal Identity",
  "/admin/settings/pages": "Core Static Pages Manager",
};

function getPageTitle(pathname: string): string {
  // Find longest matching prefix
  const match = Object.keys(PAGE_TITLES)
    .filter((key) => pathname.startsWith(key))
    .sort((a, b) => b.length - a.length)[0];
  return match ? PAGE_TITLES[match] : "CMS Admin Panel";
}

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const pageTitle = getPageTitle(location.pathname);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Topbar */}
        <AdminTopbar
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          pageTitle={pageTitle}
        />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

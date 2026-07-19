import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { DialogProvider } from "./context/DialogContext";
import { AdminAuthProvider } from "./context/AdminAuthContext";

// Portal
import PortalLayout from "./layouts/PortalLayout";
import HomePage from "./pages/portal/HomePage";
import CategoryPage from "./pages/portal/CategoryPage";
import ArticlePage from "./pages/portal/ArticlePage";
import SearchPage from "./pages/portal/SearchPage";

// Admin
import AdminGuard from "./components/admin/layout/AdminGuard";
import AdminLayout from "./components/admin/layout/AdminLayout";
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import DashboardPage from "./pages/admin/DashboardPage";
import OverviewPage from "./pages/admin/dashboard/OverviewPage";
import AnalyticsPage from "./pages/admin/dashboard/AnalyticsPage";
import VisitorPage from "./pages/admin/dashboard/VisitorPage";

// Post Management Pages
import AllArticlesPage from "./pages/admin/posts/AllArticlesPage";
import CreateArticlePage from "./pages/admin/posts/CreateArticlePage";
import RecommendationPage from "./pages/admin/posts/RecommendationPage";
import BreakingNewsPage from "./pages/admin/posts/BreakingNewsPage";

// Taxonomies Pages
import AdminCategoryPage from "./pages/admin/taxonomies/CategoryPage";
import AdminTagPage from "./pages/admin/taxonomies/TagPage";

// Media Pages
import MediaGalleryPage from "./pages/admin/media/GalleryPage";
import MediaUploadPage from "./pages/admin/media/UploadPage";
import MediaImagesPage from "./pages/admin/media/ImagesPage";
import MediaVideosPage from "./pages/admin/media/VideosPage";
import MediaDocumentsPage from "./pages/admin/media/DocumentsPage";
import MediaOptimizationPage from "./pages/admin/media/OptimizationPage";

// Comments Pages
import CommentModerationPage from "./pages/admin/comments/ModerationPage";
import CommentSpamPage from "./pages/admin/comments/SpamPage";
import CommentBlacklistPage from "./pages/admin/comments/BlacklistPage";
import CommentReportsPage from "./pages/admin/comments/ReportsPage";

// User Management Pages
import AllUsersPage from "./pages/admin/users/AllUsersPage";
import AddUserPage from "./pages/admin/users/AddUserPage";
import RolesPage from "./pages/admin/users/RolesPage";

// Ad Management Pages
import AdsOverviewPage from "./pages/admin/ads/AdsOverviewPage";
import AdsAnalyticsPage from "./pages/admin/ads/AdsAnalyticsPage";
import AdSlotsPage from "./pages/admin/ads/AdSlotsPage";
import AdvertisementsPage from "./pages/admin/ads/AdvertisementsPage";
import CampaignsPage from "./pages/admin/ads/CampaignsPage";
import AdvertisersPage from "./pages/admin/ads/AdvertisersPage";
import PricingPage from "./pages/admin/ads/PricingPage";
import ScheduledAdsPage from "./pages/admin/ads/ScheduledAdsPage";
import AdsReportsPage from "./pages/admin/ads/AdsReportsPage";
import AdsSettingsPage from "./pages/admin/ads/AdsSettingsPage";

// SEO Pages
import SeoAnalyticsPage from "./pages/admin/seo/SeoAnalyticsPage";
import SeoSettingsPage from "./pages/admin/seo/SeoSettingsPage";
import SeoIndexingPage from "./pages/admin/seo/SeoIndexingPage";
import SeoRedirectPage from "./pages/admin/seo/SeoRedirectPage";

// Market & Settings
import MarketWidgetPage from "./pages/admin/market/MarketWidgetPage";
import WebsiteGeneralPage from "./pages/admin/settings/WebsiteGeneralPage";
import WebsitePagesPage from "./pages/admin/settings/WebsitePagesPage";

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AdminAuthProvider>
        <DialogProvider>
          <Routes>
            {/* ── Portal Routes ── */}
            <Route path="/" element={<PortalLayout />}>
              <Route index element={<HomePage />} />
              <Route path="search" element={<SearchPage />} />
              <Route path=":categorySlug/:slug" element={<ArticlePage />} />
              <Route path=":categorySlug" element={<CategoryPage />} />
            </Route>

            {/* ── Admin Login (public) ── */}
            <Route path="/admin/login" element={<AdminLoginPage />} />

            {/* ── Admin Protected Routes ── */}
            <Route element={<AdminGuard />}>
              <Route element={<AdminLayout />}>
                {/* Redirect /admin → /admin/dashboard */}
                <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="/admin/dashboard" element={<OverviewPage />} />
                <Route path="/admin/dashboard/analytics" element={<AnalyticsPage />} />
                <Route path="/admin/dashboard/visitor" element={<VisitorPage />} />

                {/* Post Management */}
                <Route path="/admin/posts" element={<AllArticlesPage defaultStatus="all" />} />
                <Route path="/admin/posts/create" element={<CreateArticlePage />} />
                <Route path="/admin/posts/edit/:id" element={<CreateArticlePage />} />
                <Route path="/admin/posts/recommendation" element={<RecommendationPage />} />
                <Route path="/admin/posts/breaking" element={<BreakingNewsPage />} />
                <Route path="/admin/posts/trash" element={<AllArticlesPage defaultStatus="ARCHIVED" />} />

                {/* Taxonomies */}
                <Route path="/admin/taxonomies/categories" element={<AdminCategoryPage />} />
                <Route path="/admin/taxonomies/tags" element={<AdminTagPage />} />

                {/* Media Management */}
                <Route path="/admin/media" element={<MediaGalleryPage />} />
                <Route path="/admin/media/upload" element={<MediaUploadPage />} />
                <Route path="/admin/media/images" element={<MediaImagesPage />} />
                <Route path="/admin/media/videos" element={<MediaVideosPage />} />
                <Route path="/admin/media/documents" element={<MediaDocumentsPage />} />
                <Route path="/admin/media/optimization" element={<MediaOptimizationPage />} />

                {/* Comments Management */}
                <Route path="/admin/comments/moderation" element={<CommentModerationPage />} />
                <Route path="/admin/comments/spam" element={<CommentSpamPage />} />
                <Route path="/admin/comments/blacklist" element={<CommentBlacklistPage />} />
                <Route path="/admin/comments/reports" element={<CommentReportsPage />} />

                {/* User Management */}
                <Route path="/admin/users" element={<AllUsersPage />} />
                <Route path="/admin/users/create" element={<AddUserPage />} />
                <Route path="/admin/users/roles" element={<RolesPage />} />

                {/* Ads Management */}
                <Route path="/admin/ads" element={<AdsOverviewPage />} />
                <Route path="/admin/ads/analytics" element={<AdsAnalyticsPage />} />
                <Route path="/admin/ads/slots" element={<AdSlotsPage />} />
                <Route path="/admin/ads/advertisements" element={<AdvertisementsPage />} />
                <Route path="/admin/ads/campaigns" element={<CampaignsPage />} />
                <Route path="/admin/ads/advertisers" element={<AdvertisersPage />} />
                <Route path="/admin/ads/pricing" element={<PricingPage />} />
                <Route path="/admin/ads/scheduled" element={<ScheduledAdsPage />} />
                <Route path="/admin/ads/reports" element={<AdsReportsPage />} />
                <Route path="/admin/ads/settings" element={<AdsSettingsPage />} />

                {/* SEO Management */}
                <Route path="/admin/seo/analytics" element={<SeoAnalyticsPage />} />
                <Route path="/admin/seo/settings" element={<SeoSettingsPage />} />
                <Route path="/admin/seo/indexing" element={<SeoIndexingPage />} />
                <Route path="/admin/seo/redirect" element={<SeoRedirectPage />} />

                {/* Market Widget */}
                <Route path="/admin/market" element={<MarketWidgetPage />} />

                {/* Website Settings */}
                <Route path="/admin/settings/general" element={<WebsiteGeneralPage />} />
                <Route path="/admin/settings/pages" element={<WebsitePagesPage />} />
              </Route>
            </Route>
          </Routes>
        </DialogProvider>
      </AdminAuthProvider>
    </QueryClientProvider>
  );
}

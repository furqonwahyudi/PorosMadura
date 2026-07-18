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
                <Route path="/admin/dashboard" element={<DashboardPage />} />
                <Route path="/admin/dashboard/analytics" element={<DashboardPage />} />
                <Route path="/admin/dashboard/visitor" element={<DashboardPage />} />
                {/* Placeholder routes — akan diisi per tahap */}
                <Route path="/admin/posts/*" element={<DashboardPage />} />
                <Route path="/admin/taxonomies/*" element={<DashboardPage />} />
                <Route path="/admin/media/*" element={<DashboardPage />} />
                <Route path="/admin/comments/*" element={<DashboardPage />} />
                <Route path="/admin/users/*" element={<DashboardPage />} />
                <Route path="/admin/ads/*" element={<DashboardPage />} />
                <Route path="/admin/seo/*" element={<DashboardPage />} />
                <Route path="/admin/market" element={<DashboardPage />} />
                <Route path="/admin/settings/*" element={<DashboardPage />} />
              </Route>
            </Route>
          </Routes>
        </DialogProvider>
      </AdminAuthProvider>
    </QueryClientProvider>
  );
}

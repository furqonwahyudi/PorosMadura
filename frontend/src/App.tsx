import React from "react";
import { Routes, Route } from "react-router-dom";
import { DialogProvider } from "./context/DialogContext";
import PortalLayout from "./layouts/PortalLayout";
import HomePage from "./pages/portal/HomePage";
import CategoryPage from "./pages/portal/CategoryPage";
import ArticlePage from "./pages/portal/ArticlePage";
import SearchPage from "./pages/portal/SearchPage";

export default function App() {
  return (
    <DialogProvider>
      <Routes>
        <Route path="/" element={<PortalLayout />}>
          <Route index element={<HomePage />} />
          <Route path="search" element={<SearchPage />} />
          {/* Article Page Route: categorySlug/articleSlug */}
          <Route path=":categorySlug/:slug" element={<ArticlePage />} />

          {/* Category Page Route: categorySlug */}
          <Route path=":categorySlug" element={<CategoryPage />} />
        </Route>
      </Routes>
    </DialogProvider>
  );
}

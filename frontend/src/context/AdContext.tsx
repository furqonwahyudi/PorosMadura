import React, { createContext, useState, useEffect, useContext } from "react";
import { Ad, AdSlot, AdSettings, Advertiser, Campaign, AdCategory, AdPricing, AdMediaFile } from "../types";

interface AdContextProps {
  ads: Ad[];
  adSlots: AdSlot[];
  adSettings: AdSettings;
  advertisers: Advertiser[];
  campaigns: Campaign[];
  adCategories: AdCategory[];
  adPricing: AdPricing[];
  adMediaLibrary: AdMediaFile[];
  loading: boolean;
  loadAdSystemData: () => Promise<void>;
  trackImpression: (adId: string) => void;
  trackClick: (adId: string) => void;
  getAdForSlot: (
    slotSlug: string,
    currentPage: string,
    category?: string | null
  ) => Ad | null;
}

const AdContext = createContext<AdContextProps | undefined>(undefined);

export const AdProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [adSlots, setAdSlots] = useState<AdSlot[]>([]);
  const [adSettings, setAdSettings] = useState<AdSettings>({});
  const [advertisers, setAdvertisers] = useState<Advertiser[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [adCategories, setAdCategories] = useState<AdCategory[]>([]);
  const [adPricing, setAdPricing] = useState<AdPricing[]>([]);
  const [adMediaLibrary, setAdMediaLibrary] = useState<AdMediaFile[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAdSystemData = async () => {
    setLoading(true);
    try {
      const apiOrigin = import.meta.env.VITE_API_URL || "";
      const [slotsRes, adsRes] = await Promise.all([
        fetch(`${apiOrigin}/api/ads/slots/public`).then(r => r.json()),
        fetch(`${apiOrigin}/api/ads/active`).then(r => r.json())
      ]);

      if (slotsRes && slotsRes.success) {
        setAdSlots(slotsRes.data);
      }
      if (adsRes && adsRes.success) {
        setAds(adsRes.data);
      }
    } catch (err) {
      console.error("Gagal memuat data sistem iklan secara dinamis, menggunakan fallback static:", err);
      // Provide mock active slots as fallback so placeholders render on frontend
      setAdSlots([
        { id: "1", slug: "header-banner", name: "Header Banner", size: "468x60", type: "display", page: "all", isActive: true, priority: 1, lazyLoad: false, sticky: false, floating: false, closeButton: false, responsive: true },
        { id: "2", slug: "top-leaderboard", name: "Top Leaderboard", size: "970x90", type: "display", page: "all", isActive: true, priority: 1, lazyLoad: false, sticky: false, floating: false, closeButton: false, responsive: true },
        { id: "3", slug: "article-top-leaderboard", name: "Article Top", size: "728x90", type: "display", page: "all", isActive: true, priority: 1, lazyLoad: false, sticky: false, floating: false, closeButton: false, responsive: true },
        { id: "4", slug: "sidebar-rectangle-1", name: "Sidebar 1", size: "300x250", type: "display", page: "all", isActive: true, priority: 1, lazyLoad: true, sticky: true, floating: false, closeButton: false, responsive: true },
        { id: "5", slug: "sidebar-rectangle-2", name: "Sidebar 2", size: "300x250", type: "display", page: "all", isActive: true, priority: 1, lazyLoad: true, sticky: false, floating: false, closeButton: false, responsive: true },
        { id: "6", slug: "article-bottom-leaderboard", name: "Article Bottom", size: "728x90", type: "display", page: "all", isActive: true, priority: 1, lazyLoad: true, sticky: false, floating: false, closeButton: false, responsive: true },
        { id: "7", slug: "floating-left-skyscraper", name: "Floating Left", size: "160x600", type: "floating", page: "all", isActive: true, priority: 1, lazyLoad: false, sticky: true, floating: true, closeButton: false, responsive: true, isPremium: true, reserveLayout: true },
        { id: "8", slug: "floating-right-skyscraper", name: "Floating Right", size: "160x600", type: "floating", page: "all", isActive: true, priority: 1, lazyLoad: false, sticky: true, floating: true, closeButton: false, responsive: true, isPremium: true, reserveLayout: true },
        { id: "9", slug: "category-banner", name: "Category Banner", size: "970x90", type: "display", page: "all", isActive: true, priority: 1 },
        { id: "10", slug: "sidebar-top", name: "Sidebar Top", size: "300x250", type: "display", page: "all", isActive: true, priority: 1 },
        { id: "11", slug: "sidebar-middle", name: "Sidebar Middle", size: "300x250", type: "display", page: "all", isActive: true, priority: 1 },
        { id: "12", slug: "sidebar-bottom", name: "Sidebar Bottom", size: "300x250", type: "display", page: "all", isActive: true, priority: 1 },
        { id: "13", slug: "sidebar-sticky", name: "Sidebar Sticky", size: "300x600", type: "display", page: "all", isActive: true, priority: 1, sticky: true },
        { id: "14", slug: "in-feed-1", name: "In Feed 1", size: "300x250", type: "display", page: "all", isActive: true, priority: 1 },
        { id: "15", slug: "in-feed-2", name: "In Feed 2", size: "300x250", type: "display", page: "all", isActive: true, priority: 1 },
        { id: "16", slug: "homepage-banner-atas", name: "Homepage Banner Atas", size: "970x90", type: "display", page: "all", isActive: true, priority: 1 },
        { id: "17", slug: "hero-banner", name: "Hero Banner", size: "728x90", type: "display", page: "all", isActive: true, priority: 1 },
        { id: "18", slug: "homepage-banner-tengah", name: "Homepage Banner Tengah", size: "728x250", type: "display", page: "all", isActive: true, priority: 1 },
        { id: "19", slug: "mobile-in-feed-banner", name: "Mobile In Feed Banner", size: "320x100", type: "display", page: "all", isActive: true, priority: 1 },
        { id: "20", slug: "in-feed-3", name: "In Feed 3", size: "728x90", type: "display", page: "all", isActive: true, priority: 1 },
        { id: "21", slug: "in-feed-4", name: "In Feed 4", size: "728x90", type: "display", page: "all", isActive: true, priority: 1 },
        { id: "22", slug: "homepage-banner-bawah", name: "Homepage Banner Bawah", size: "970x90", type: "display", page: "all", isActive: true, priority: 1 },
        { id: "23", slug: "breaking-news-banner", name: "Breaking News Banner", size: "728x90", type: "display", page: "all", isActive: true, priority: 1 },
        { id: "24", slug: "in-article-1", name: "In Article 1", size: "728x90", type: "display", page: "all", isActive: true, priority: 1 },
        { id: "25", slug: "in-article-2", name: "In Article 2", size: "728x90", type: "display", page: "all", isActive: true, priority: 1 },
        { id: "26", slug: "in-article-3", name: "In Article 3", size: "728x90", type: "display", page: "all", isActive: true, priority: 1 },
        { id: "27", slug: "in-article-4", name: "In Article 4", size: "728x90", type: "display", page: "all", isActive: true, priority: 1 },
        { id: "28", slug: "video-banner", name: "Video Banner", size: "300x250", type: "display", page: "all", isActive: true, priority: 1 },
        { id: "29", slug: "related-news-banner", name: "Related News Banner", size: "300x250", type: "display", page: "all", isActive: true, priority: 1 },
        { id: "30", slug: "footer-billboard", name: "Footer Billboard", size: "970x250", type: "display", page: "all", isActive: true, priority: 1 },
        { id: "31", slug: "footer-banner", name: "Footer Banner", size: "970x90", type: "display", page: "all", isActive: true, priority: 1 },
        { id: "32", slug: "top-billboard", name: "Top Billboard", size: "970x250", type: "display", page: "all", isActive: true, priority: 1 },
        { id: "33", slug: "popup-interstitial", name: "Popup Interstitial", size: "300x250", type: "popup", page: "all", isActive: true, priority: 1 },
        { id: "34", slug: "mobile-anchor-banner", name: "Mobile Anchor Banner", size: "320x50", type: "display", page: "all", isActive: true, priority: 1, sticky: true }
      ] as any[]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdSystemData();
  }, []);

  const trackImpression = (adId: string) => {
    // Mock
  };

  const trackClick = (adId: string) => {
    // Mock
  };

  const getAdForSlot = (
    slotSlug: string,
    currentPage: string,
    category?: string | null
  ): Ad | null => {
    // 0. Verify slot exists, is active, and configured for this page
    const slot = adSlots.find(s => s.slug === slotSlug);
    if (!slot || slot.isActive === false) return null;
    if (slot.page) {
      const allowedSlotPages = slot.page.split(",").map(p => p.trim().toLowerCase());
      const currentPageNorm = currentPage.trim().toLowerCase();
      const slotPageAllowed =
        allowedSlotPages.includes("all") ||
        allowedSlotPages.includes(currentPageNorm);
      if (!slotPageAllowed) return null;
    }

    const activeAds = ads.filter(ad => {
      // 1. Match slot slug
      if (ad.slotSlug !== slotSlug) return false;

      // 2. Must be active status
      if (ad.status !== "active") return false;

      // 3. Page Penargetan check (ad-level — may differ from slot-level)
      const targetPages = ad.targetPages || [];
      // If targetPages is empty or contains "all", allow any page
      if (targetPages.length > 0 && !targetPages.includes("all")) {
        const currentPageNorm = currentPage.trim().toLowerCase();
        const adPageAllowed = targetPages.some(p => p.trim().toLowerCase() === currentPageNorm);
        if (!adPageAllowed) return false;
      }

      // 4. Device detection check
      const width = window.innerWidth;
      const device = ad.targetDevice || "all";
      if (device !== "all") {
        if (device === "mobile" && width >= 768) return false;
        if (device === "tablet" && (width < 768 || width >= 1024)) return false;
        if (device === "laptop" && (width < 1024 || width >= 1280)) return false;
        if (device === "desktop" && width < 1024) return false;
      }

      // 5. Date Scheduling check
      const now = new Date();
      const todayStr = now.toISOString().split("T")[0];
      if (ad.startDate && todayStr < ad.startDate) return false;
      if (ad.endDate && todayStr > ad.endDate) return false;

      // 6. Time & Hour Scheduling check (schedule contains array of hours)
      const currentHour = now.getHours();
      const currentDay = now.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
      if (ad.schedule) {
        if (ad.schedule.hours && ad.schedule.hours.length > 0 && !ad.schedule.hours.includes(currentHour)) {
          return false;
        }
        if (ad.schedule.days && ad.schedule.days.length > 0 && !ad.schedule.days.map(d => d.toLowerCase()).includes(currentDay)) {
          return false;
        }
      }

      return true;
    });

    if (activeAds.length === 0) return null;

    // Sort by priority (1 is highest, then 2, 3, 4)
    activeAds.sort((a, b) => (a.priority || 4) - (b.priority || 4));

    return activeAds[0];
  };


  return (
    <AdContext.Provider
      value={{
        ads,
        adSlots,
        adSettings,
        advertisers,
        campaigns,
        adCategories,
        adPricing,
        adMediaLibrary,
        loading,
        loadAdSystemData,
        trackImpression,
        trackClick,
        getAdForSlot
      }}
    >
      {children}
    </AdContext.Provider>
  );
};

export const useAdSystem = () => {
  const context = useContext(AdContext);
  if (context === undefined) {
    throw new Error("useAdSystem must be used within an AdProvider");
  }
  return context;
};

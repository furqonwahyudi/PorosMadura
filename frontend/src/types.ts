export interface Reply {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  likes: number;
  dislikes: number;
}

export interface Comment {
  id: string;
  articleSlug?: string;
  author: string;
  content: string;
  timestamp: string;
  likes: number;
  dislikes: number;
  replies?: Reply[];
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  category: string;
  subCategory?: string;
  content: string;
  excerpt?: string;
  imageCaption?: string;
  tags: string[];
  image: string;
  author: string;
  reporter?: string;
  editor?: string;
  publishDate: string;
  status: "draft" | "published" | "scheduled";
  views: number;
  reads: number;
  shares: number;
  isBreaking: boolean;
  isHeadline: boolean;
  isEditorChoice: boolean;
  isTrending: boolean;
  videoUrl?: string;
  audioUrl?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  canonicalUrl?: string;
}

export interface AdSlotFloatingConfig {
  width: number;
  height: number;
  topOffset: number;
  leftGap: number;
  rightGap: number;
  scrollOffset: number;
  overlay: false;         // ALWAYS false — layout-based, never overlay
  closable: false;        // ALWAYS false — premium slot cannot be closed
  collapsible: boolean;
  autoHide: boolean;
  sticky: boolean;
  reserveLayout: boolean; // reserves CSS Grid column — shifts content
}

export interface AdSlot {
  id: string;
  name: string;
  slug: string;
  size: string;
  type: "display" | "native" | "video" | "popup" | "interstitial" | "floating";
  page: string;
  status: "active" | "inactive";
  priority: number;
  lazyLoad: boolean;
  sticky: boolean;
  floating: boolean;
  closeButton: boolean;
  responsive: boolean;
  schedule?: any;
  targetDevice?: string;
  // Premium floating slot fields
  isPremium?: boolean;
  alwaysVisible?: boolean;
  closable?: boolean;
  collapsible?: boolean;
  desktopOnly?: boolean;
  autoHideSmall?: boolean;
  reserveLayout?: boolean;
  floatingConfig?: AdSlotFloatingConfig;
}

export interface Advertiser {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: "active" | "inactive";
}

export interface Campaign {
  id: string;
  name: string;
  advertiserId: string;
  budget: number;
  startDate: string;
  endDate: string;
  status: "active" | "completed" | "paused";
}

export interface Ad {
  id: string;
  name: string;
  title: string;
  advertiserId: string;
  campaignId: string;
  slotSlug: string;
  landingUrl: string;
  targetBlank: boolean;
  imageDesktop: string;
  imageMobile: string;
  altText: string;
  priority: 1 | 2 | 3 | 4;
  status: "active" | "inactive" | "pending" | "draft" | "expired";
  startDate: string;
  endDate: string;
  schedule?: {
    hours?: number[];
    days?: string[];
    dates?: string[];
    months?: number[];
    years?: number[];
    timezone?: string;
  };
  targetDevice: "all" | "desktop" | "laptop" | "tablet" | "mobile";
  targetPages: string[];
  format: "image" | "html" | "adsense" | "gam" | "javascript" | "iframe" | "embed" | "video" | "native";
  htmlCode?: string;
  scriptCode?: string;
  impressions: number;
  clicks: number;
  revenue: number;
  viewability: number;
}

export interface AdCategory {
  id: string;
  name: string;
  slug: string;
}

export interface AdPricing {
  id: string;
  slotSlug: string;
  pricePerDay: number;
  pricePerImpression?: number;
  pricePerClick?: number;
}

export interface AdMediaFile {
  id: string;
  name: string;
  url: string;
  tags: string[];
  uploadedAt: string;
}

export interface AdSettings {
  adsensePublisherId?: string;
  googleAdManagerId?: string;
  inFeedGap?: number;
  inArticleParagraphs?: number[];
  interstitialFrequency?: number;
}

export interface WebsiteSettings {
  siteName: string;
  tagline: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  socials: {
    facebook: string;
    instagram: string;
    twitter: string;
    tiktok: string;
    youtube: string;
    linkedin: string;
  };
}

export interface VisitorLog {
  date: string;
  visits: number;
  pageviews: number;
}

export interface SearchTerm {
  term: string;
  count: number;
}

export interface BrowserOrDeviceBreakdown {
  name: string;
  value: number;
}

export interface VisitorAnalytics {
  totalViews: number;
  totalReads: number;
  totalShares: number;
  subscribersCount: number;
  articlesCount: number;
  visitors: VisitorLog[];
  searchAnalytics: SearchTerm[];
  deviceBreakdown: BrowserOrDeviceBreakdown[];
  browserBreakdown: BrowserOrDeviceBreakdown[];
  activeRealtimeVisitors: number;
}

export interface AuditLog {
  timestamp: string;
  user: string;
  role: string;
  action: string;
}

import { Article } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const res = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });
  
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Gagal mengambil data dari API' }));
    throw new Error(err.message || 'Gagal mengambil data dari API');
  }
  
  return res.json();
}

export function mapBackendArticleToFrontend(art: any): Article {
  if (!art) return {} as Article;
  return {
    id: art.id,
    title: art.title,
    slug: art.slug,
    content: art.content,
    excerpt: art.excerpt || '',
    image: art.image || 'https://picsum.photos/seed/news/800/600',
    imageCaption: art.imageCaption || '',
    status: (art.status?.toLowerCase() as any) || 'published',
    publishDate: art.publishedAt || art.createdAt,
    views: art.views || 0,
    reads: art.reads || 0,
    shares: art.shares || 0,
    isBreaking: art.isBreaking || false,
    isHeadline: art.isHeadline || false,
    isEditorChoice: art.isEditorChoice || false,
    isTrending: art.isTrending || false,
    videoUrl: art.videoUrl || undefined,
    audioUrl: art.audioUrl || undefined,
    metaDescription: art.metaDescription || '',
    metaKeywords: art.metaKeywords || [],
    canonicalUrl: art.canonicalUrl || undefined,
    // Map category hierarchies
    category: art.category?.parent ? art.category.parent.name : (art.category?.name || ''),
    subCategory: art.category?.parent ? art.category.name : undefined,
    author: art.author?.name || 'Redaksi Poros Madura',
    reporter: art.reporter?.name || undefined,
    editor: art.editor?.name || undefined,
    tags: art.tags?.map((t: any) => t.tag?.name || '') || [],
  };
}

export const api = {
  // Articles
  async getArticles(params: { category?: string; subCategory?: string; page?: number; limit?: number; isEditorChoice?: boolean } = {}) {
    const searchParams = new URLSearchParams();
    if (params.category) searchParams.append('category', params.category);
    if (params.subCategory) searchParams.append('subCategory', params.subCategory);
    if (params.page) searchParams.append('page', String(params.page));
    if (params.limit) searchParams.append('limit', String(params.limit));
    if (params.isEditorChoice !== undefined) searchParams.append('isEditorChoice', String(params.isEditorChoice));

    const res = await fetchAPI(`/api/articles?${searchParams.toString()}`);
    return {
      articles: (res.data || []).map(mapBackendArticleToFrontend),
      pagination: res.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 },
    };
  },

  async getArticleBySlug(slug: string): Promise<Article> {
    const res = await fetchAPI(`/api/articles/${slug}`);
    return mapBackendArticleToFrontend(res.data);
  },

  async getBreakingNews(limit = 5): Promise<Article[]> {
    const res = await fetchAPI(`/api/articles/breaking?limit=${limit}`);
    return (res.data || []).map(mapBackendArticleToFrontend);
  },

  async getHeadlines(limit = 5): Promise<Article[]> {
    const res = await fetchAPI(`/api/articles/headline?limit=${limit}`);
    return (res.data || []).map(mapBackendArticleToFrontend);
  },

  async getTrending(limit = 5): Promise<Article[]> {
    const res = await fetchAPI(`/api/articles/trending?limit=${limit}`);
    return (res.data || []).map(mapBackendArticleToFrontend);
  },

  async getEditorChoice(limit = 5): Promise<Article[]> {
    const res = await fetchAPI(`/api/articles/editor-choice?limit=${limit}`);
    return (res.data || []).map(mapBackendArticleToFrontend);
  },

  async incrementView(slug: string): Promise<void> {
    await fetchAPI(`/api/articles/${slug}/view`, { method: 'POST' }).catch(() => {});
  },

  async incrementRead(slug: string): Promise<void> {
    await fetchAPI(`/api/articles/${slug}/read`, { method: 'POST' }).catch(() => {});
  },

  async incrementShare(slug: string): Promise<void> {
    await fetchAPI(`/api/articles/${slug}/share`, { method: 'POST' }).catch(() => {});
  },

  // Categories
  async getCategories() {
    const res = await fetchAPI('/api/categories');
    return res.data || [];
  },

  // Search
  async search(query: string, page = 1, limit = 10) {
    const res = await fetchAPI(`/api/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
    return {
      articles: (res.data || []).map(mapBackendArticleToFrontend),
      pagination: res.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 },
    };
  },

  // Ads
  async getAdForSlot(slotSlug: string, page = 'all', device = 'all') {
    const res = await fetchAPI(`/api/ads/slot/${slotSlug}?page=${page}&device=${device}`);
    return res.data || null;
  },

  async recordAdImpression(adId: string): Promise<void> {
    await fetchAPI(`/api/ads/${adId}/impression`, { method: 'POST' }).catch(() => {});
  },

  async recordAdClick(adId: string): Promise<void> {
    await fetchAPI(`/api/ads/${adId}/click`, { method: 'POST' }).catch(() => {});
  },

  // Comments
  async getComments(articleSlug: string) {
    const res = await fetchAPI(`/api/comments/${articleSlug}`);
    return res.data || [];
  },

  async postComment(articleSlug: string, data: { author: string; email?: string; content: string; parentId?: string }) {
    const res = await fetchAPI(`/api/comments/${articleSlug}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.data;
  },

  // Market & Financial Rates
  async getMarketRates() {
    const res = await fetchAPI('/api/market/rates');
    return res.data;
  },

  async getMarketSettings() {
    const res = await fetchAPI('/api/market/settings');
    return res.data;
  },
};

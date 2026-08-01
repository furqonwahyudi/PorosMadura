import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import rateLimit from 'express-rate-limit';
import { prisma } from './config/database';
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';
import authRoutes from './modules/auth/auth.routes';
import articleRoutes from './modules/articles/article.routes';
import categoryRoutes from './modules/categories/category.routes';
import userRoutes from './modules/users/user.routes';
import adRoutes from './modules/ads/ad.routes';
import mediaRoutes from './modules/media/media.routes';
import analyticsRoutes from './modules/analytics/analytics.routes';
import settingsRoutes from './modules/settings/settings.routes';
import commentRoutes from './modules/comments/comment.routes';
import searchRoutes from './modules/search/search.routes';
import tagRoutes from './modules/tags/tag.routes';
import marketRoutes from './modules/market/market.routes';
import rbacRoutes from './modules/rbac/rbac.routes';
import seoRoutes from './modules/seo/seo.routes';
import fs from 'fs';

// Pastikan direktori uploads dan subfoldernya sudah dibuat agar upload gambar tidak error
const requiredDirs = [
  path.join(process.cwd(), 'uploads'),
  path.join(process.cwd(), 'uploads', 'images')
];
requiredDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const app = express();

// =============================================
// Security & Core Middleware
// =============================================
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

app.use(cors({
  origin: process.env.CORS_ORIGIN 
    ? process.env.CORS_ORIGIN.split(',') 
    : ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Dedicated Rate Limiter for Login (to prevent brute force)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 30, // 30 attempts per 15 mins for login
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Terlalu banyak percobaan login, coba lagi setelah 15 menit.' },
});
app.use('/api/auth/login', loginLimiter);

// General Rate Limiter for API
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  max: parseInt(process.env.RATE_LIMIT_MAX || '5000'),
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'development',
  message: { success: false, message: 'Terlalu banyak permintaan, coba lagi nanti.' },
});
app.use('/api', limiter);

app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files as static
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// =============================================
// Health Check
// =============================================
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', app: 'Poros Madura API', timestamp: new Date().toISOString() });
});

// =============================================
// API Routes
// =============================================
app.use('/api/auth', authRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ads', adRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/rbac', rbacRoutes);
app.use('/api/seo', seoRoutes);

// Middleware untuk Pengalihan Tautan 301/302 Redirect Dinamis dari Database
app.use(async (req: Request, res: Response, next: NextFunction) => {
  // Hanya intercept request GET untuk halaman (bukan /api, /uploads, dll)
  if (req.method !== 'GET' || req.path.startsWith('/api') || req.path.startsWith('/uploads') || req.path.includes('.')) {
    return next();
  }
  try {
    const redirect = await prisma.redirect.findUnique({
      where: { oldUrl: req.path }
    });
    if (redirect) {
      const code = redirect.type === '302' ? 302 : 301;
      return res.redirect(code, redirect.newUrl);
    }
  } catch (err) {
    // Abaikan error database agar web utama tidak terganggu
  }
  next();
});

// Helper untuk mengambil URL absolut website terpusat
async function getSiteUrl(req: Request): Promise<string> {
  try {
    const seoSettings = await prisma.seoSettings.findUnique({ where: { id: 'singleton' } });
    if (seoSettings?.siteUrl) {
      return seoSettings.siteUrl.replace(/\/$/, ''); // Buang slash akhir jika ada
    }
  } catch (e) {
    // Abaikan error database
  }
  const host = req.get('host') || 'youdie.my.id';
  const protocol = (host.includes('localhost') || host.includes('127.0.0.1')) ? 'http' : 'https';
  return `${protocol}://${host}`;
}

// Helper to generate RSS XML dengan Media Content & Category Tags
async function generateRssXml(title: string, description: string, link: string, feedUrl: string, categoryIds?: string[]) {
  const whereClause: any = { status: 'PUBLISHED' };
  if (categoryIds && categoryIds.length > 0) {
    whereClause.categoryId = { in: categoryIds };
  }

  const articles = await prisma.article.findMany({
    where: whereClause,
    orderBy: { publishedAt: 'desc' },
    take: 20,
    include: { category: true }
  });

  const rssItems = articles.map(art => {
    const pubDate = art.publishedAt ? new Date(art.publishedAt).toUTCString() : new Date(art.createdAt).toUTCString();
    const articleUrl = `${link}/${art.category.slug}/${art.slug}`;
    const escapedTitle = art.title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const escapedExcerpt = (art.excerpt || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    
    // Tag media untuk gambar utama berita
    let mediaTag = '';
    if (art.image) {
      const fullImageUrl = art.image.startsWith('http') ? art.image : `${link}${art.image}`;
      mediaTag = `<media:content url="${fullImageUrl}" medium="image" type="image/jpeg" />`;
    }

    return `
    <item>
      <title>${escapedTitle}</title>
      <link>${articleUrl}</link>
      <guid isPermaLink="true">${articleUrl}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapedExcerpt}</description>
      <category>${art.category.name}</category>
      ${mediaTag}
    </item>`;
  }).join('');

  return `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/">
<channel>
  <title>${title}</title>
  <link>${link}</link>
  <description>${description}</description>
  <language>id-ID</language>
  <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
  <atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />
  ${rssItems}
</channel>
</rss>`;
}

// ── RSS Feed Utama ──
app.get(['/api/rss', '/feed'], async (req: Request, res: Response, next: NextFunction) => {
  try {
    const siteUrl = await getSiteUrl(req);
    const feedUrl = `${siteUrl}/feed`;
    const xml = await generateRssXml(
      "Poros Madura",
      "Portal Berita Terpercaya &amp; Aktual Madura",
      siteUrl,
      feedUrl
    );
    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (err) {
    next(err);
  }
});

// ── RSS Feed Kategori ──
app.get('/category/:slug/feed', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const slug = req.params.slug as string;
    const category = await prisma.category.findUnique({ where: { slug } });
    if (!category) {
      res.status(404).send('Category not found');
      return;
    }

    const subCats = await prisma.category.findMany({ where: { parentId: category.id }, select: { id: true } });
    const catIds = [category.id, ...subCats.map(c => c.id)];

    const siteUrl = await getSiteUrl(req);
    const feedUrl = `${siteUrl}/category/${slug}/feed`;
    const categoryUrl = `${siteUrl}/${category.slug}`;

    const xml = await generateRssXml(
      `Poros Madura - ${category.name}`,
      `Sindikasi Berita Kategori ${category.name} - Poros Madura`,
      categoryUrl,
      feedUrl,
      catIds
    );
    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (err) {
    next(err);
  }
});

// ── Standard XML Sitemap Generator ──
app.get('/sitemap.xml', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const siteUrl = await getSiteUrl(req);
    
    // Ambil semua artikel terbit
    const articles = await prisma.article.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { updatedAt: 'desc' },
      select: { slug: true, updatedAt: true, category: { select: { slug: true } } }
    });

    // Ambil semua kategori
    const categories = await prisma.category.findMany({
      select: { slug: true }
    });

    const sitemapUrls = [
      // Homepage
      `  <url>
    <loc>${siteUrl}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`,
      // Kategori
      ...categories.map(c => `  <url>
    <loc>${siteUrl}/${c.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`),
      // Artikel
      ...articles.map(art => `  <url>
    <loc>${siteUrl}/${art.category.slug}/${art.slug}</loc>
    <lastmod>${new Date(art.updatedAt).toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`)
    ].join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls}
</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (err) {
    next(err);
  }
});

// ── Google News XML Sitemap Generator (Terbit 48 Jam Terakhir) ──
app.get(['/news-sitemap.xml', '/sitemap-news.xml'], async (req: Request, res: Response, next: NextFunction) => {
  try {
    const siteUrl = await getSiteUrl(req);
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

    const articles = await prisma.article.findMany({
      where: {
        status: 'PUBLISHED',
        publishedAt: { gte: fortyEightHoursAgo }
      },
      orderBy: { publishedAt: 'desc' },
      select: { title: true, slug: true, publishedAt: true, category: { select: { slug: true } } }
    });

    const websiteSettings = await prisma.websiteSettings.findUnique({ where: { id: 'singleton' } });
    const siteName = websiteSettings?.siteName || 'Poros Madura';

    const newsUrls = articles.map(art => {
      const pubDate = art.publishedAt ? new Date(art.publishedAt).toISOString() : new Date().toISOString();
      const escapedTitle = art.title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      return `  <url>
    <loc>${siteUrl}/${art.category.slug}/${art.slug}</loc>
    <news:news>
      <news:publication>
        <news:name>${siteName}</news:name>
        <news:language>id</news:language>
      </news:publication>
      <news:publication_date>${pubDate}</news:publication_date>
      <news:title>${escapedTitle}</news:title>
    </news:news>
  </url>`;
    }).join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${newsUrls}
</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (err) {
    next(err);
  }
});

// ── robots.txt Dinamis dari Database ──
app.get('/robots.txt', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const siteUrl = await getSiteUrl(req);
    const seoSettings = await prisma.seoSettings.findUnique({ where: { id: 'singleton' } });
    
    let robotsTxt = seoSettings?.robotsTxt;
    if (!robotsTxt) {
      robotsTxt = `User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/\n\nSitemap: ${siteUrl}/sitemap.xml\nSitemap: ${siteUrl}/news-sitemap.xml`;
    } else {
      // Pastikan sitemap URL dinamis ter-update jika domain berubah di robots.txt
      robotsTxt = robotsTxt.replace(/https:\/\/youdie.my.id/g, siteUrl).replace(/https:\/\/porosmadura.com/g, siteUrl);
    }

    res.header('Content-Type', 'text/plain');
    res.send(robotsTxt);
  } catch (err) {
    next(err);
  }
});

// =============================================
// Error Handling
// =============================================
app.use(notFound);
app.use(errorHandler);

export default app;

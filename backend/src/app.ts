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

// Helper to generate RSS XML
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

  const frontendUrl = process.env.CORS_ORIGIN || "http://localhost:5173";

  const rssItems = articles.map(art => {
    const pubDate = art.publishedAt ? new Date(art.publishedAt).toUTCString() : new Date(art.createdAt).toUTCString();
    const articleUrl = `${frontendUrl}/${art.category.slug}/${art.slug}`;
    const escapedTitle = art.title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const escapedExcerpt = (art.excerpt || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return `
    <item>
      <title>${escapedTitle}</title>
      <link>${articleUrl}</link>
      <guid isPermaLink="true">${articleUrl}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapedExcerpt}</description>
    </item>`;
  }).join('');

  return `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
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
    const frontendUrl = process.env.CORS_ORIGIN || "http://localhost:5173";
    const feedUrl = `${req.protocol}://${req.get('host')}/feed`;
    const xml = await generateRssXml(
      "Poros Madura",
      "Portal Berita Terpercaya &amp; Aktual Madura",
      frontendUrl,
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
    const { slug } = req.params;
    const category = await prisma.category.findUnique({ where: { slug } });
    if (!category) {
      res.status(404).send('Category not found');
      return;
    }

    const subCats = await prisma.category.findMany({ where: { parentId: category.id }, select: { id: true } });
    const catIds = [category.id, ...subCats.map(c => c.id)];

    const frontendUrl = process.env.CORS_ORIGIN || "http://localhost:5173";
    const feedUrl = `${req.protocol}://${req.get('host')}/category/${slug}/feed`;
    const categoryUrl = `${frontendUrl}/${category.slug}`;

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

// =============================================
// Error Handling
// =============================================
app.use(notFound);
app.use(errorHandler);

export default app;

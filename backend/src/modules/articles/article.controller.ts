import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import { AuthRequest } from '../../middleware/auth';
import { z } from 'zod';
import slugify from '../../utils/slugify';

const articleSchema = z.object({
  title: z.string().min(5, 'Judul minimal 5 karakter'),
  content: z.string().min(50, 'Konten minimal 50 karakter'),
  categoryId: z.string().uuid('ID kategori tidak valid'),
  excerpt: z.string().optional(),
  image: z.string().optional(),
  imageCaption: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'SCHEDULED', 'ARCHIVED']).optional(),
  scheduledAt: z.union([z.string().datetime(), z.literal(''), z.null()]).optional().nullable(),
  isBreaking: z.boolean().optional(),
  isHeadline: z.boolean().optional(),
  isEditorChoice: z.boolean().optional(),
  isTrending: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.array(z.string()).optional(),
  videoUrl: z.string().url().optional().nullable(),
  audioUrl: z.string().url().optional().nullable(),
  editorId: z.string().uuid().optional().nullable(),
  reporterId: z.string().uuid().optional().nullable(),
});

// Helper: build article select fields
const articleSelect = {
  id: true,
  title: true,
  slug: true,
  excerpt: true,
  image: true,
  imageCaption: true,
  status: true,
  publishedAt: true,
  isBreaking: true,
  isHeadline: true,
  isEditorChoice: true,
  isTrending: true,
  views: true,
  reads: true,
  shares: true,
  metaTitle: true,
  metaDescription: true,
  metaKeywords: true,
  videoUrl: true,
  audioUrl: true,
  createdAt: true,
  updatedAt: true,
  category: { select: { id: true, name: true, slug: true, parentId: true, parent: { select: { name: true, slug: true } } } },
  author: { select: { id: true, name: true, avatar: true } },
  editor: { select: { id: true, name: true } },
  reporter: { select: { id: true, name: true } },
  tags: { include: { tag: { select: { id: true, name: true, slug: true } } } },
};

export async function getArticles(req: Request, res: Response, next: NextFunction) {
  try {
    // Auto-clean expired trash/archived articles
    try {
      const settings = await prisma.websiteSettings.findUnique({ where: { id: 'singleton' } });
      const retention = settings?.trashRetention || '30d'; // default 30 days
      let days = 30;
      if (retention === '1d') days = 1;
      else if (retention === '7d') days = 7;
      else if (retention === '30d') days = 30;

      const threshold = new Date();
      threshold.setDate(threshold.getDate() - days);

      await prisma.article.deleteMany({
        where: {
          status: 'ARCHIVED',
          updatedAt: { lt: threshold }
        }
      });
    } catch (e: any) {
      console.warn('Failed to auto-clean trash articles:', e.message);
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const category = req.query.category as string;
    const subCategory = req.query.subCategory as string;
    const status = req.query.status as string || 'PUBLISHED';
    const sort = req.query.sort as string || (status === 'DRAFT' || status === 'all' || status === 'ALL' ? 'createdAt' : 'publishedAt');
    const q = req.query.q as string;

    const where: any = {};
    if (status !== 'ALL' && status !== 'all') {
      where.status = status as any;
    }
    if (req.query.isEditorChoice === 'true') {
      where.isEditorChoice = true;
    }
    if (req.query.isBreaking === 'true') {
      where.isBreaking = true;
    }
    if (req.query.isHeadline === 'true') {
      where.isHeadline = true;
    }
    if (req.query.isTrending === 'true') {
      where.isTrending = true;
    }
    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { excerpt: { contains: q, mode: 'insensitive' } },
        { content: { contains: q, mode: 'insensitive' } },
      ];
    }

    if (category) {
      const cat = await prisma.category.findFirst({ where: { slug: category } });
      if (cat) {
        where.categoryId = cat.parentId ? cat.id : { in: [cat.id, ...(await prisma.category.findMany({ where: { parentId: cat.id }, select: { id: true } })).map(c => c.id)] };
      }
    }
    if (subCategory) {
      const sub = await prisma.category.findFirst({ where: { slug: subCategory } });
      if (sub) where.categoryId = sub.id;
    }

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        select: articleSelect,
        orderBy: { [sort]: 'desc' },
        skip,
        take: limit,
      }),
      prisma.article.count({ where }),
    ]);

    res.json({
      success: true,
      data: articles,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
}

export async function getArticleBySlug(req: Request, res: Response, next: NextFunction) {
  try {
    const article = await prisma.article.findFirst({
      where: { slug: req.params.slug, status: 'PUBLISHED' },
      include: {
        category: { include: { parent: true } },
        author: { select: { id: true, name: true, avatar: true, bio: true } },
        editor: { select: { id: true, name: true } },
        reporter: { select: { id: true, name: true } },
        tags: { include: { tag: true } },
        comments: {
          where: { isApproved: true, parentId: null },
          include: { replies: { where: { isApproved: true }, take: 5 } },
          take: 20,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!article) throw new AppError('Artikel tidak ditemukan', 404);

    res.json({ success: true, data: article });
  } catch (error) {
    next(error);
  }
}

export async function getArticleById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const article = await prisma.article.findUnique({
      where: { id },
      include: {
        category: true,
        author: { select: { id: true, name: true } },
        editor: { select: { id: true, name: true } },
        reporter: { select: { id: true, name: true } },
        tags: { include: { tag: true } },
      },
    });

    if (!article) throw new AppError('Artikel tidak ditemukan', 404);

    res.json({ success: true, data: article });
  } catch (error) {
    next(error);
  }
}

export async function getBreakingNews(req: Request, res: Response, next: NextFunction) {
  try {
    const limit = parseInt(req.query.limit as string) || 5;
    const articles = await prisma.article.findMany({
      where: { isBreaking: true, status: 'PUBLISHED' },
      select: articleSelect,
      orderBy: { publishedAt: 'desc' },
      take: limit,
    });
    res.json({ success: true, data: articles });
  } catch (error) {
    next(error);
  }
}

export async function getHeadlines(req: Request, res: Response, next: NextFunction) {
  try {
    const limit = parseInt(req.query.limit as string) || 5;
    const articles = await prisma.article.findMany({
      where: { isHeadline: true, status: 'PUBLISHED' },
      select: articleSelect,
      orderBy: { publishedAt: 'desc' },
      take: limit,
    });
    res.json({ success: true, data: articles });
  } catch (error) {
    next(error);
  }
}

export async function getTrending(req: Request, res: Response, next: NextFunction) {
  try {
    const limit = parseInt(req.query.limit as string) || 5;
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    let articles = await prisma.article.findMany({
      where: {
        status: 'PUBLISHED',
        publishedAt: { gte: sevenDaysAgo }
      },
      select: articleSelect,
      orderBy: { views: 'desc' },
      take: limit,
    });

    // Fallback ke 30 hari jika artikel kurang dari limit agar widget tidak kosong
    if (articles.length < limit) {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      articles = await prisma.article.findMany({
        where: {
          status: 'PUBLISHED',
          publishedAt: { gte: thirtyDaysAgo }
        },
        select: articleSelect,
        orderBy: { views: 'desc' },
        take: limit,
      });
    }

    // Fallback akhir ke sepanjang waktu jika masih kurang
    if (articles.length < limit) {
      articles = await prisma.article.findMany({
        where: { status: 'PUBLISHED' },
        select: articleSelect,
        orderBy: { views: 'desc' },
        take: limit,
      });
    }

    res.json({ success: true, data: articles });
  } catch (error) {
    next(error);
  }
}

export async function getEditorChoice(req: Request, res: Response, next: NextFunction) {
  try {
    const limit = parseInt(req.query.limit as string) || 5;
    const articles = await prisma.article.findMany({
      where: { isEditorChoice: true, status: 'PUBLISHED' },
      select: articleSelect,
      orderBy: { publishedAt: 'desc' },
      take: limit,
    });
    res.json({ success: true, data: articles });
  } catch (error) {
    next(error);
  }
}

export async function getArticleStats(_req: Request, res: Response, next: NextFunction) {
  try {
    const [totalArticles, breakingCount, editorChoiceCount, headlineCount, trendingCount, trashCount] = await Promise.all([
      prisma.article.count({ where: { status: { not: 'ARCHIVED' } } }),
      prisma.article.count({ where: { isBreaking: true, status: { not: 'ARCHIVED' } } }),
      prisma.article.count({ where: { isEditorChoice: true, status: { not: 'ARCHIVED' } } }),
      prisma.article.count({ where: { isHeadline: true, status: { not: 'ARCHIVED' } } }),
      prisma.article.count({ where: { isTrending: true, status: { not: 'ARCHIVED' } } }),
      prisma.article.count({ where: { status: 'ARCHIVED' } }),
    ]);

    res.json({
      success: true,
      data: {
        total: totalArticles,
        breaking: breakingCount,
        recommendation: editorChoiceCount,
        headline: headlineCount,
        trending: trendingCount,
        trash: trashCount,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function incrementView(req: Request, res: Response, next: NextFunction) {
  try {
    await prisma.article.updateMany({
      where: { slug: req.params.slug },
      data: { views: { increment: 1 } },
    });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
}

export async function incrementRead(req: Request, res: Response, next: NextFunction) {
  try {
    await prisma.article.updateMany({
      where: { slug: req.params.slug },
      data: { reads: { increment: 1 } },
    });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
}

export async function incrementShare(req: Request, res: Response, next: NextFunction) {
  try {
    await prisma.article.updateMany({
      where: { slug: req.params.slug },
      data: { shares: { increment: 1 } },
    });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
}

export async function createArticle(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = articleSchema.parse(req.body);
    const slug = slugify(data.title);

    // Handle tags
    const tagIds: string[] = [];
    if (data.tags && data.tags.length > 0) {
      for (const tagName of data.tags) {
        const tagSlug = slugify(tagName);
        const tag = await prisma.tag.upsert({
          where: { slug: tagSlug },
          update: {},
          create: { name: tagName, slug: tagSlug },
        });
        tagIds.push(tag.id);
      }
    }

    const article = await prisma.article.create({
      data: {
        title: data.title,
        slug,
        content: data.content,
        excerpt: data.excerpt,
        image: data.image,
        imageCaption: data.imageCaption,
        status: (data.status as any) || 'DRAFT',
        scheduledAt: (data.scheduledAt && data.scheduledAt !== '') ? new Date(data.scheduledAt) : null,
        publishedAt: data.status === 'PUBLISHED' ? new Date() : undefined,
        isBreaking: data.isBreaking || false,
        isHeadline: data.isHeadline || false,
        isEditorChoice: data.isEditorChoice || false,
        isTrending: data.isTrending || false,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        metaKeywords: data.metaKeywords || [],
        videoUrl: data.videoUrl,
        audioUrl: data.audioUrl,
        categoryId: data.categoryId,
        authorId: req.user!.id,
        editorId: data.editorId,
        reporterId: data.reporterId,
        tags: { create: tagIds.map(id => ({ tagId: id })) },
      },
      select: articleSelect,
    });

    if (data.image && (data.status === 'PUBLISHED' || data.status === 'SCHEDULED')) {
      await prisma.mediaFile.updateMany({
        where: { url: data.image },
        data: { isTemporary: false },
      });
    }

    await prisma.auditLog.create({
      data: { userId: req.user!.id, role: req.user!.role, action: `CREATE_ARTICLE:${article.id}` },
    });

    res.status(201).json({ success: true, message: 'Artikel berhasil dibuat', data: article });
  } catch (error) {
    next(error);
  }
}

export async function updateArticle(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const data = articleSchema.partial().parse(req.body);

    const existing = await prisma.article.findUnique({ where: { id } });
    if (!existing) throw new AppError('Artikel tidak ditemukan', 404);

    // Handle tags
    if (data.tags !== undefined) {
      await prisma.articleTag.deleteMany({ where: { articleId: id } });
      for (const tagName of data.tags) {
        const tagSlug = slugify(tagName);
        const tag = await prisma.tag.upsert({
          where: { slug: tagSlug },
          update: {},
          create: { name: tagName, slug: tagSlug },
        });
        await prisma.articleTag.create({ data: { articleId: id, tagId: tag.id } });
      }
    }

    const { tags, ...rest } = data;
    const article = await prisma.article.update({
      where: { id },
      data: {
        ...rest,
        ...(rest.status === 'PUBLISHED' && !existing.publishedAt ? { publishedAt: new Date() } : {}),
        scheduledAt: (rest.scheduledAt && rest.scheduledAt !== '') ? new Date(rest.scheduledAt) : null,
      },
      select: articleSelect,
    });

    if (data.image && (data.status === 'PUBLISHED' || data.status === 'SCHEDULED' || rest.status === 'PUBLISHED' || rest.status === 'SCHEDULED')) {
      await prisma.mediaFile.updateMany({
        where: { url: data.image },
        data: { isTemporary: false },
      });
    }

    await prisma.auditLog.create({
      data: { userId: req.user!.id, role: req.user!.role, action: `UPDATE_ARTICLE:${id}` },
    });

    res.json({ success: true, message: 'Artikel berhasil diperbarui', data: article });
  } catch (error) {
    next(error);
  }
}

export async function deleteArticle(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const existing = await prisma.article.findUnique({ where: { id } });
    if (!existing) throw new AppError('Artikel tidak ditemukan', 404);

    await prisma.article.delete({ where: { id } });

    await prisma.auditLog.create({
      data: { userId: req.user!.id, role: req.user!.role, action: `DELETE_ARTICLE:${id}` },
    });

    res.json({ success: true, message: 'Artikel berhasil dihapus' });
  } catch (error) {
    next(error);
  }
}

export async function publishArticle(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    await prisma.article.update({
      where: { id },
      data: { status: 'PUBLISHED', publishedAt: new Date() },
    });
    res.json({ success: true, message: 'Artikel berhasil dipublikasikan' });
  } catch (error) {
    next(error);
  }
}

export async function archiveArticle(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    await prisma.article.update({ where: { id }, data: { status: 'ARCHIVED' } });
    res.json({ success: true, message: 'Artikel berhasil diarsipkan' });
  } catch (error) {
    next(error);
  }
}

export async function scrapeArticle(req: Request, res: Response, next: NextFunction) {
  try {
    const { url } = req.body;
    if (!url) throw new AppError('URL is required', 400);

    const response = await fetch(url);
    if (!response.ok) throw new AppError('Failed to fetch the URL', 400);
    const html = await response.text();

    const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
    let title = titleMatch ? titleMatch[1].trim() : '';
    title = title.split(' - ')[0].split(' | ')[0].trim();

    const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i) 
      || html.match(/<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i);
    const excerpt = descMatch ? descMatch[1].trim() : '';

    let content = '';
    const bodyMatch = html.match(/<body[^>]*>([\s\S]+?)<\/body>/i);
    if (bodyMatch) {
      let bodyHtml = bodyMatch[1];
      bodyHtml = bodyHtml.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
      bodyHtml = bodyHtml.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
      
      const pMatches = bodyHtml.match(/<p[^>]*>([\s\S]+?)<\/p>/gi);
      if (pMatches) {
        content = pMatches
          .map(p => p.replace(/<[^>]*>/g, '').trim())
          .filter(text => text.length > 50)
          .slice(0, 8)
          .map(text => `<p>${text}</p>`)
          .join('\n');
      }
    }

    if (!content) {
      content = '<p>Konten artikel gagal diambil secara otomatis. Silakan isi konten secara manual.</p>';
    }

    res.json({
      success: true,
      data: {
        title,
        excerpt,
        content
      }
    });
  } catch (error) {
    next(error);
  }
}


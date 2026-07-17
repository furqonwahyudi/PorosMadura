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
  scheduledAt: z.string().datetime().optional(),
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
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const category = req.query.category as string;
    const subCategory = req.query.subCategory as string;
    const status = req.query.status as string || 'PUBLISHED';
    const sort = req.query.sort as string || 'publishedAt';

    const where: any = { status: status as any };
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
    const articles = await prisma.article.findMany({
      where: { isTrending: true, status: 'PUBLISHED' },
      select: articleSelect,
      orderBy: { views: 'desc' },
      take: limit,
    });
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
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
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
        scheduledAt: rest.scheduledAt ? new Date(rest.scheduledAt) : undefined,
      },
      select: articleSelect,
    });

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

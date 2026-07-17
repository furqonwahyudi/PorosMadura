import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/database';

export async function searchArticles(req: Request, res: Response, next: NextFunction) {
  try {
    const q = (req.query.q as string || '').trim();
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    if (!q || q.length < 2) {
      return res.json({ success: true, data: [], pagination: { page, limit, total: 0, totalPages: 0 } });
    }

    // Log search term
    await prisma.searchLog.upsert({
      where: { term: q.toLowerCase() },
      update: { count: { increment: 1 }, lastSearchedAt: new Date() },
      create: { term: q.toLowerCase(), count: 1 },
    });

    // PostgreSQL full-text search
    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where: {
          status: 'PUBLISHED',
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { excerpt: { contains: q, mode: 'insensitive' } },
            { content: { contains: q, mode: 'insensitive' } },
            { tags: { some: { tag: { name: { contains: q, mode: 'insensitive' } } } } },
          ],
        },
        select: {
          id: true, title: true, slug: true, excerpt: true, image: true,
          publishedAt: true, views: true,
          category: { select: { id: true, name: true, slug: true } },
          author: { select: { id: true, name: true } },
        },
        orderBy: { publishedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.article.count({
        where: {
          status: 'PUBLISHED',
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { excerpt: { contains: q, mode: 'insensitive' } },
            { content: { contains: q, mode: 'insensitive' } },
          ],
        },
      }),
    ]);

    res.json({
      success: true,
      data: articles,
      query: q,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
}

import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/database';

export async function getSummary(_req: Request, res: Response, next: NextFunction) {
  try {
    const [articles, users, totalViews, totalReads] = await Promise.all([
      prisma.article.count({ where: { status: 'PUBLISHED' } }),
      prisma.user.count({ where: { isActive: true } }),
      prisma.article.aggregate({ _sum: { views: true } }),
      prisma.article.aggregate({ _sum: { reads: true } }),
    ]);
    res.json({ success: true, data: { articles, users, totalViews: totalViews._sum.views || 0, totalReads: totalReads._sum.reads || 0 } });
  } catch (error) { next(error); }
}

export async function getVisitors(req: Request, res: Response, next: NextFunction) {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const from = new Date(); from.setDate(from.getDate() - days);
    const data = await prisma.dailyAnalytics.findMany({
      where: { date: { gte: from } },
      orderBy: { date: 'asc' },
    });
    res.json({ success: true, data });
  } catch (error) { next(error); }
}

export async function getPopular(req: Request, res: Response, next: NextFunction) {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const articles = await prisma.article.findMany({
      where: { status: 'PUBLISHED' },
      select: { id: true, title: true, slug: true, image: true, views: true, reads: true, publishedAt: true },
      orderBy: { views: 'desc' },
      take: limit,
    });
    res.json({ success: true, data: articles });
  } catch (error) { next(error); }
}

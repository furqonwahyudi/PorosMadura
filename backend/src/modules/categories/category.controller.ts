import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import { AuthRequest } from '../../middleware/auth';
import { z } from 'zod';
import slugify from '../../utils/slugify';

const categorySchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  sortOrder: z.number().optional(),
  isActive: z.boolean().optional(),
  parentId: z.string().uuid().optional().nullable(),
});

export async function getCategories(req: Request, res: Response, next: NextFunction) {
  try {
    const isAdmin = req.query.admin === 'true';
    const whereClause: any = {};
    if (!isAdmin) {
      whereClause.isActive = true;
      whereClause.parentId = null;
    } else {
      whereClause.parentId = null;
    }

    const categories = await prisma.category.findMany({
      where: whereClause,
      include: {
        children: { 
          where: isAdmin ? undefined : { isActive: true }, 
          orderBy: { sortOrder: 'asc' } 
        },
        _count: { select: { articles: true } },
      },
      orderBy: { sortOrder: 'asc' },
    });
    res.json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
}

export async function getCategoryArticles(req: Request, res: Response, next: NextFunction) {
  try {
    const { slug } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const category = await prisma.category.findUnique({ where: { slug } });
    if (!category) throw new AppError('Kategori tidak ditemukan', 404);

    // Get all sub-category IDs
    const subCats = await prisma.category.findMany({ where: { parentId: category.id }, select: { id: true } });
    const catIds = [category.id, ...subCats.map(c => c.id)];

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where: { categoryId: { in: catIds }, status: 'PUBLISHED' },
        select: {
          id: true, title: true, slug: true, excerpt: true, image: true,
          publishedAt: true, views: true, reads: true,
          isBreaking: true, isHeadline: true,
          category: { select: { id: true, name: true, slug: true } },
          author: { select: { id: true, name: true } },
          tags: { include: { tag: { select: { name: true, slug: true } } } },
        },
        orderBy: { publishedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.article.count({ where: { categoryId: { in: catIds }, status: 'PUBLISHED' } }),
    ]);

    res.json({
      success: true,
      data: articles,
      category,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
}

export async function createCategory(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = categorySchema.parse(req.body);
    const slug = slugify(data.name);

    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing) throw new AppError('Kategori dengan nama ini sudah ada', 409);

    const category = await prisma.category.create({ data: { ...data, slug } });
    res.status(201).json({ success: true, message: 'Kategori berhasil dibuat', data: category });
  } catch (error) {
    next(error);
  }
}

export async function updateCategory(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const data = categorySchema.partial().parse(req.body);

    const category = await prisma.category.update({
      where: { id },
      data: { ...data, ...(data.name ? { slug: slugify(data.name) } : {}) },
    });
    res.json({ success: true, message: 'Kategori berhasil diperbarui', data: category });
  } catch (error) {
    next(error);
  }
}

export async function deleteCategory(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    await prisma.category.delete({ where: { id } });
    res.json({ success: true, message: 'Kategori berhasil dihapus' });
  } catch (error) {
    next(error);
  }
}

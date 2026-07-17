import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import { AuthRequest } from '../../middleware/auth';
import { z } from 'zod';

const commentSchema = z.object({
  author: z.string().min(2),
  email: z.string().email().optional(),
  content: z.string().min(5).max(1000),
  parentId: z.string().uuid().optional(),
});

export async function getComments(req: Request, res: Response, next: NextFunction) {
  try {
    const article = await prisma.article.findFirst({ where: { slug: req.params.articleSlug } });
    if (!article) throw new AppError('Artikel tidak ditemukan', 404);

    const comments = await prisma.comment.findMany({
      where: { articleId: article.id, isApproved: true, parentId: null },
      include: { replies: { where: { isApproved: true }, orderBy: { createdAt: 'asc' } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json({ success: true, data: comments });
  } catch (error) { next(error); }
}

export async function createComment(req: Request, res: Response, next: NextFunction) {
  try {
    const article = await prisma.article.findFirst({ where: { slug: req.params.articleSlug } });
    if (!article) throw new AppError('Artikel tidak ditemukan', 404);

    const data = commentSchema.parse(req.body);
    const comment = await prisma.comment.create({ data: { ...data, articleId: article.id } });
    res.status(201).json({ success: true, message: 'Komentar menunggu persetujuan', data: comment });
  } catch (error) { next(error); }
}

export async function approveComment(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await prisma.comment.update({ where: { id: req.params.id }, data: { isApproved: true } });
    res.json({ success: true, message: 'Komentar disetujui' });
  } catch (error) { next(error); }
}

export async function deleteComment(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await prisma.comment.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Komentar dihapus' });
  } catch (error) { next(error); }
}

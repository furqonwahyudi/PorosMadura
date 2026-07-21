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

export async function getAllCommentsAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const status = req.query.status as string;
    const whereClause: any = {};

    if (status === 'pending') {
      whereClause.isApproved = false;
    } else if (status === 'approved') {
      whereClause.isApproved = true;
    }

    const comments = await prisma.comment.findMany({
      where: whereClause,
      include: {
        article: { select: { id: true, title: true, slug: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    res.json({ success: true, data: comments });
  } catch (error) { next(error); }
}

export async function createComment(req: Request, res: Response, next: NextFunction) {
  try {
    const article = await prisma.article.findFirst({ where: { slug: req.params.articleSlug } });
    if (!article) throw new AppError('Artikel tidak ditemukan', 404);

    const data = commentSchema.parse(req.body);

    // Check blacklist words / spam keywords
    const blacklisted = await prisma.blacklistWord.findMany();
    const contentLower = data.content.toLowerCase();
    const isSpam = blacklisted.some(b => contentLower.includes(b.word.toLowerCase()));

    const comment = await prisma.comment.create({
      data: {
        ...data,
        articleId: article.id,
        isSpam,
        ipAddress: req.ip,
      }
    });

    res.status(201).json({
      success: true,
      message: isSpam ? 'Komentar Anda masuk ke folder tinjauan spam' : 'Komentar menunggu persetujuan',
      data: comment
    });
  } catch (error) { next(error); }
}

export async function replyComment(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    if (!content) throw new AppError('Isi balasan wajib diisi', 400);

    const parent = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!parent) throw new AppError('Komentar asal tidak ditemukan', 404);

    const reply = await prisma.comment.create({
      data: {
        content,
        author: req.user?.name || 'Redaksi Poros Madura',
        email: req.user?.email || 'redaksi@porosmadura.com',
        isApproved: true,
        articleId: parent.articleId,
        parentId: parent.id,
      },
    });

    // Automatically approve parent comment if not approved yet
    if (!parent.isApproved) {
      await prisma.comment.update({ where: { id: parent.id }, data: { isApproved: true } });
    }

    res.status(201).json({ success: true, message: 'Balasan berhasil dikirim', data: reply });
  } catch (error) { next(error); }
}

export async function approveComment(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await prisma.comment.update({ where: { id: req.params.id }, data: { isApproved: true } });
    res.json({ success: true, message: 'Komentar disetujui' });
  } catch (error) { next(error); }
}

export async function unapproveComment(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await prisma.comment.update({ where: { id: req.params.id }, data: { isApproved: false } });
    res.json({ success: true, message: 'Komentar ditolak/ditangguhkan' });
  } catch (error) { next(error); }
}

export async function deleteComment(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await prisma.comment.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Komentar dihapus' });
  } catch (error) { next(error); }
}

export async function getSpamCommentsAdmin(_req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const comments = await prisma.comment.findMany({
      where: { isSpam: true },
      include: { article: { select: { id: true, title: true, slug: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: comments });
  } catch (error) { next(error); }
}

export async function emptySpamStorage(_req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await prisma.comment.deleteMany({ where: { isSpam: true } });
    res.json({ success: true, message: 'Folder spam telah dikosongkan' });
  } catch (error) { next(error); }
}

export async function getReportedCommentsAdmin(_req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const comments = await prisma.comment.findMany({
      where: { isReported: true },
      include: { article: { select: { id: true, title: true, slug: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: comments });
  } catch (error) { next(error); }
}

export async function dismissReportComment(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await prisma.comment.update({
      where: { id: req.params.id },
      data: { isReported: false, reportReason: null },
    });
    res.json({ success: true, message: 'Laporan diabaikan' });
  } catch (error) { next(error); }
}

export async function getBlacklistWords(_req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const words = await prisma.blacklistWord.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: words });
  } catch (error) { next(error); }
}

export async function createBlacklistWord(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { word, type } = req.body;
    if (!word || !word.trim()) throw new AppError('Kata terlarang wajib diisi', 400);

    const item = await prisma.blacklistWord.create({
      data: { word: word.trim().toLowerCase(), type: type || 'WORD' },
    });
    res.status(201).json({ success: true, message: 'Kata terlarang ditambahkan', data: item });
  } catch (error) { next(error); }
}

export async function deleteBlacklistWord(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await prisma.blacklistWord.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Kata terlarang dihapus' });
  } catch (error) { next(error); }
}

export async function getCommentStats(_req: Request, res: Response, next: NextFunction) {
  try {
    const [pendingCount, approvedCount, spamCount, reportCount, totalCount] = await Promise.all([
      prisma.comment.count({ where: { isApproved: false, isSpam: false } }),
      prisma.comment.count({ where: { isApproved: true, isSpam: false } }),
      prisma.comment.count({ where: { isSpam: true } }),
      prisma.comment.count({ where: { isReported: true } }),
      prisma.comment.count(),
    ]);

    res.json({
      success: true,
      data: {
        moderation: pendingCount,
        approved: approvedCount,
        spam: spamCount,
        reports: reportCount,
        total: totalCount,
      },
    });
  } catch (error) { next(error); }
}

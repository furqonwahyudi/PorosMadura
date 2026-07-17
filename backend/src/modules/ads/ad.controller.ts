import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import { AuthRequest } from '../../middleware/auth';

export async function getAdForSlot(req: Request, res: Response, next: NextFunction) {
  try {
    const { slug } = req.params;
    const page = req.query.page as string || 'all';
    const device = req.query.device as string || 'all';
    const now = new Date();

    const ads = await prisma.ad.findMany({
      where: {
        slot: { slug },
        status: 'ACTIVE',
        startDate: { lte: now },
        endDate: { gte: now },
        OR: [{ targetDevice: 'ALL' }, { targetDevice: device.toUpperCase() as any }],
        OR: [{ targetPages: { isEmpty: true } }, { targetPages: { has: page } }],
      },
      orderBy: { priority: 'asc' },
      take: 1,
    });

    res.json({ success: true, data: ads[0] || null });
  } catch (error) {
    next(error);
  }
}

export async function recordImpression(req: Request, res: Response, next: NextFunction) {
  try {
    await prisma.ad.update({ where: { id: req.params.id }, data: { impressions: { increment: 1 } } });
    res.json({ success: true });
  } catch (error) { next(error); }
}

export async function recordClick(req: Request, res: Response, next: NextFunction) {
  try {
    await prisma.ad.update({ where: { id: req.params.id }, data: { clicks: { increment: 1 } } });
    res.json({ success: true });
  } catch (error) { next(error); }
}

export async function getAdSlots(_req: Request, res: Response, next: NextFunction) {
  try {
    const slots = await prisma.adSlot.findMany({ include: { _count: { select: { ads: true } } } });
    res.json({ success: true, data: slots });
  } catch (error) { next(error); }
}

export async function createAd(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const ad = await prisma.ad.create({ data: req.body });
    res.status(201).json({ success: true, data: ad });
  } catch (error) { next(error); }
}

export async function updateAd(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const ad = await prisma.ad.update({ where: { id: req.params.id }, data: req.body });
    res.json({ success: true, data: ad });
  } catch (error) { next(error); }
}

export async function deleteAd(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await prisma.ad.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Iklan dihapus' });
  } catch (error) { next(error); }
}

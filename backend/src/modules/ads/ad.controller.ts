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
        slot: { slug, isActive: true },
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
    const slots = await prisma.adSlot.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { ads: true } } }
    });
    res.json({ success: true, data: slots });
  } catch (error) { next(error); }
}

export async function createAdSlot(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const slot = await prisma.adSlot.create({ data: req.body });
    res.status(201).json({ success: true, data: slot });
  } catch (error) { next(error); }
}

export async function updateAdSlot(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const slot = await prisma.adSlot.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json({ success: true, data: slot });
  } catch (error) { next(error); }
}

export async function deleteAdSlot(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await prisma.adSlot.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Slot iklan berhasil dihapus' });
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

// === NEW ADMIN ENDPOINTS ===

export async function getAds(req: Request, res: Response, next: NextFunction) {
  try {
    const ads = await prisma.ad.findMany({
      include: {
        slot: true,
        advertiser: true,
        campaign: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: ads });
  } catch (error) { next(error); }
}

export async function getAdvertisers(req: Request, res: Response, next: NextFunction) {
  try {
    const advertisers = await prisma.advertiser.findMany({
      include: {
        _count: {
          select: { campaigns: true, ads: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: advertisers });
  } catch (error) { next(error); }
}

export async function createAdvertiser(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const advertiser = await prisma.advertiser.create({ data: req.body });
    res.status(201).json({ success: true, data: advertiser });
  } catch (error) { next(error); }
}

export async function updateAdvertiser(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const advertiser = await prisma.advertiser.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json({ success: true, data: advertiser });
  } catch (error) { next(error); }
}

export async function deleteAdvertiser(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await prisma.advertiser.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Advertiser berhasil dihapus' });
  } catch (error) { next(error); }
}

export async function getCampaigns(req: Request, res: Response, next: NextFunction) {
  try {
    const campaigns = await prisma.campaign.findMany({
      include: {
        advertiser: true,
        _count: {
          select: { ads: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: campaigns });
  } catch (error) { next(error); }
}

export async function createCampaign(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const campaign = await prisma.campaign.create({ data: req.body });
    res.status(201).json({ success: true, data: campaign });
  } catch (error) { next(error); }
}

export async function updateCampaign(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const campaign = await prisma.campaign.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json({ success: true, data: campaign });
  } catch (error) { next(error); }
}

export async function deleteCampaign(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await prisma.campaign.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Kampanye berhasil dihapus' });
  } catch (error) { next(error); }
}

export async function getPublicAdSlots(req: Request, res: Response, next: NextFunction) {
  try {
    const slots = await prisma.adSlot.findMany({
      orderBy: { name: 'asc' }
    });
    res.json({ success: true, data: slots });
  } catch (error) { next(error); }
}

export async function getActiveAds(req: Request, res: Response, next: NextFunction) {
  try {
    const now = new Date();
    const ads = await prisma.ad.findMany({
      where: {
        status: 'ACTIVE',
        startDate: { lte: now },
        endDate: { gte: now },
      },
      include: {
        slot: true,
      }
    });
    
    // Format output to match frontend Ad type
    const formattedAds = ads.map(ad => ({
      id: ad.id,
      name: ad.name,
      title: ad.title,
      landingUrl: ad.landingUrl,
      targetBlank: ad.targetBlank,
      altText: ad.altText,
      format: ad.format.toLowerCase(),
      htmlCode: ad.htmlCode,
      scriptCode: ad.scriptCode,
      priority: ad.priority,
      status: ad.status.toLowerCase(),
      startDate: ad.startDate.toISOString().split('T')[0],
      endDate: ad.endDate.toISOString().split('T')[0],
      schedule: ad.schedule,
      targetDevice: ad.targetDevice.toLowerCase(),
      targetPages: ad.targetPages,
      slotSlug: ad.slot.slug,
      imageDesktop: ad.imageDesktop,
      imageMobile: ad.imageMobile,
    }));

    res.json({ success: true, data: formattedAds });
  } catch (error) { next(error); }
}

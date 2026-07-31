import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/database';
import { AppError } from '../../middleware/errorHandler';

// GET /api/seo/settings
export async function getSeoSettings(req: Request, res: Response, next: NextFunction) {
  try {
    let settings = await prisma.seoSettings.findUnique({ where: { id: 'singleton' } });
    if (!settings) {
      settings = await prisma.seoSettings.create({ data: { id: 'singleton' } });
    }
    res.json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
}

// PUT /api/seo/settings
export async function updateSeoSettings(req: Request, res: Response, next: NextFunction) {
  try {
    const { siteUrl, homeTitle, homeDescription, robotsTxt, fallbackImage } = req.body;
    const settings = await prisma.seoSettings.upsert({
      where: { id: 'singleton' },
      update: { siteUrl, homeTitle, homeDescription, robotsTxt, fallbackImage },
      create: { id: 'singleton', siteUrl, homeTitle, homeDescription, robotsTxt, fallbackImage },
    });
    res.json({ success: true, message: 'Pengaturan SEO berhasil disimpan', data: settings });
  } catch (error) {
    next(error);
  }
}

// GET /api/seo/redirects
export async function getRedirects(req: Request, res: Response, next: NextFunction) {
  try {
    const redirects = await prisma.redirect.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: redirects });
  } catch (error) {
    next(error);
  }
}

// POST /api/seo/redirects
export async function createRedirect(req: Request, res: Response, next: NextFunction) {
  try {
    const { oldUrl, newUrl, type } = req.body;
    if (!oldUrl || !newUrl) {
      throw new AppError('Old URL dan New URL harus diisi', 400);
    }
    const redirect = await prisma.redirect.create({
      data: {
        oldUrl: oldUrl.trim(),
        newUrl: newUrl.trim(),
        type: type || '301'
      }
    });
    res.status(201).json({ success: true, message: 'Aturan redirect berhasil ditambahkan', data: redirect });
  } catch (error) {
    next(error);
  }
}

// DELETE /api/seo/redirects/:id
export async function deleteRedirect(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    await prisma.redirect.delete({ where: { id } });
    res.json({ success: true, message: 'Aturan redirect berhasil dihapus' });
  } catch (error) {
    next(error);
  }
}

// GET /api/seo/dead-links
export async function getDeadLinks(req: Request, res: Response, next: NextFunction) {
  try {
    const deadLinks = await prisma.deadLink.findMany({
      orderBy: { count: 'desc' },
      take: 50
    });
    res.json({ success: true, data: deadLinks });
  } catch (error) {
    next(error);
  }
}

// POST /api/seo/sitemap/rebuild
export async function triggerSitemapRebuild(req: Request, res: Response, next: NextFunction) {
  try {
    // Karena sitemap di-generate dinamis saat diminta, rebuild sitemap di sini
    // hanya mengembalikan sinyal sukses kepada CMS admin.
    res.json({ success: true, message: 'Peta situs (sitemap) berhasil dibangun ulang!' });
  } catch (error) {
    next(error);
  }
}

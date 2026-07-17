import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/database';

export async function getSettings(_req: Request, res: Response, next: NextFunction) {
  try {
    let settings = await prisma.websiteSettings.findUnique({ where: { id: 'singleton' } });
    if (!settings) {
      settings = await prisma.websiteSettings.create({ data: { id: 'singleton' } });
    }
    res.json({ success: true, data: settings });
  } catch (error) { next(error); }
}

export async function updateSettings(req: Request, res: Response, next: NextFunction) {
  try {
    const settings = await prisma.websiteSettings.upsert({
      where: { id: 'singleton' },
      update: req.body,
      create: { id: 'singleton', ...req.body },
    });
    res.json({ success: true, message: 'Pengaturan disimpan', data: settings });
  } catch (error) { next(error); }
}

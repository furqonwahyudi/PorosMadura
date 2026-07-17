import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import { prisma } from '../../config/database';
import { AppError } from '../../middleware/errorHandler';

export async function getMedia(req: Request, res: Response, next: NextFunction) {
  try {
    const media = await prisma.mediaFile.findMany({ orderBy: { uploadedAt: 'desc' } });
    res.json({ success: true, data: media });
  } catch (error) { next(error); }
}

export async function uploadMedia(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.file) throw new AppError('File tidak ditemukan', 400);

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const url = `${baseUrl}/uploads/images/${req.file.filename}`;

    const media = await prisma.mediaFile.create({
      data: {
        name: req.file.originalname,
        filename: req.file.filename,
        url,
        path: req.file.path,
        mimeType: req.file.mimetype,
        size: req.file.size,
      },
    });

    res.status(201).json({ success: true, message: 'File berhasil diupload', data: media });
  } catch (error) { next(error); }
}

export async function deleteMedia(req: Request, res: Response, next: NextFunction) {
  try {
    const media = await prisma.mediaFile.findUnique({ where: { id: req.params.id } });
    if (!media) throw new AppError('Media tidak ditemukan', 404);

    // Delete file from disk
    if (fs.existsSync(media.path)) fs.unlinkSync(media.path);
    await prisma.mediaFile.delete({ where: { id: req.params.id } });

    res.json({ success: true, message: 'Media dihapus' });
  } catch (error) { next(error); }
}

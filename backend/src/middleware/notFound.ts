import { Request, Response } from 'express';
import { prisma } from '../config/database';

export async function notFound(req: Request, res: Response) {
  // Hanya catat log 404 untuk request GET halaman/assets yang bukan API internal
  if (req.method === 'GET' && !req.originalUrl.startsWith('/api')) {
    try {
      await prisma.deadLink.upsert({
        where: { url: req.originalUrl },
        update: {
          count: { increment: 1 },
          lastSeenAt: new Date()
        },
        create: {
          url: req.originalUrl,
          count: 1,
          lastSeenAt: new Date()
        }
      });
    } catch (e) {
      // Abaikan error database
    }
  }

  res.status(404).json({
    success: false,
    message: `Route tidak ditemukan: ${req.method} ${req.originalUrl}`,
  });
}

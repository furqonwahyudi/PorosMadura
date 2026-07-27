import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import { AuthRequest } from '../../middleware/auth';
import { z } from 'zod';

const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
  role: z.string().min(1).optional(), // Dynamic roles from rbac_roles table — not hardcoded enum
  bio: z.string().optional(),
});

export async function getUsers(_req: Request, res: Response, next: NextFunction) {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, avatar: true, isActive: true, createdAt: true },
    });
    res.json({ success: true, data: users });
  } catch (error) { next(error); }
}

export async function createUser(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = userSchema.parse(req.body);
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new AppError('Email sudah terdaftar', 409);

    const hashedPassword = await bcrypt.hash(data.password, 12);
    const user = await prisma.user.create({
      data: { ...data, password: hashedPassword },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });
    res.status(201).json({ success: true, message: 'User berhasil dibuat', data: user });
  } catch (error) { next(error); }
}

export async function updateUser(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { password, ...rest } = req.body;
    const updateData: any = { ...rest };
    if (password) updateData.password = await bcrypt.hash(password, 12);

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: { id: true, email: true, name: true, role: true, isActive: true },
    });
    res.json({ success: true, message: 'User berhasil diperbarui', data: user });
  } catch (error) { next(error); }
}

export async function deleteUser(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'User dihapus' });
  } catch (error) { next(error); }
}

export async function updateMe(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const id = req.user!.id;
    const { name, email, password, bio, avatar } = req.body;

    const updateData: any = {};
    if (name) updateData.name = name;
    
    if (email) {
      const emailLower = email.toLowerCase();
      // Check if email already registered by another user
      const existing = await prisma.user.findFirst({
        where: { email: emailLower, NOT: { id } }
      });
      if (existing) throw new AppError('Email sudah digunakan oleh pengguna lain', 409);
      updateData.email = emailLower;
    }

    if (password) {
      if (password.length < 8) {
        throw new AppError('Password minimal harus 8 karakter', 400);
      }
      updateData.password = await bcrypt.hash(password, 12);

      // Create password change audit log
      const ipAddress = (req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || '').split(',')[0].trim();
      const userAgent = req.headers['user-agent'] || '';
      await prisma.auditLog.create({
        data: {
          userId: id,
          role: req.user!.role,
          action: 'PASSWORD_CHANGED',
          meta: { ip: ipAddress, ua: userAgent }
        }
      });
    }

    if (bio !== undefined) updateData.bio = bio;
    if (avatar !== undefined) updateData.avatar = avatar;

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: { id: true, email: true, name: true, role: true, avatar: true, bio: true },
    });

    res.json({ success: true, message: 'Profil Anda berhasil diperbarui', data: user });
  } catch (error) { next(error); }
}

function parseUserAgent(uaString: string) {
  const ua = uaString.toLowerCase();
  let browser = 'Unknown Browser';
  let os = 'Unknown OS';
  let device = 'Desktop PC';
  let icon = 'monitor';

  // Detect OS
  if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod')) {
    os = 'iOS';
    device = ua.includes('ipad') ? 'iPad' : 'iPhone';
    icon = 'smartphone';
  } else if (ua.includes('android')) {
    os = 'Android';
    device = 'Android Phone';
    icon = 'smartphone';
  } else if (ua.includes('macintosh') || ua.includes('mac os x')) {
    os = 'macOS';
    device = 'MacBook/iMac';
    icon = 'laptop';
  } else if (ua.includes('windows')) {
    os = 'Windows';
    device = 'Windows PC';
    icon = 'monitor';
  } else if (ua.includes('linux')) {
    os = 'Linux';
    device = 'Linux PC';
    icon = 'monitor';
  }

  // Detect Browser
  if (ua.includes('firefox')) {
    browser = 'Firefox';
  } else if (ua.includes('chrome') || ua.includes('crios')) {
    browser = 'Chrome';
  } else if (ua.includes('safari') && !ua.includes('chrome') && !ua.includes('android')) {
    browser = 'Safari';
  } else if (ua.includes('edge') || ua.includes('edg')) {
    browser = 'Edge';
  } else if (ua.includes('opera') || ua.includes('opr')) {
    browser = 'Opera';
  }

  // Extract major version
  const match = uaString.match(/(firefox|chrome|safari|opera|version|edg|opr)\/?\s*(\d+)/i);
  if (match && match[2]) {
    browser = `${browser} ${match[2]}`;
  }

  return { browser, os, device, icon };
}

export async function getSessions(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];
    const decodedAccess = token ? (jwt.decode(token) as any) : null;
    const currentSessionId = decodedAccess?.sessionId;

    const refreshTokens = await prisma.refreshToken.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    const sessions = [];

    for (const rt of refreshTokens) {
      try {
        const decoded = jwt.verify(rt.token, process.env.JWT_REFRESH_SECRET!) as any;
        const uaInfo = parseUserAgent(decoded.ua || '');
        
        sessions.push({
          id: rt.id,
          device: uaInfo.device,
          browser: uaInfo.browser,
          os: uaInfo.os,
          ip: decoded.ip || 'Unknown IP',
          location: (decoded.ip === '::1' || decoded.ip === '127.0.0.1') ? 'Localhost (Bangkalan, Jawa Timur)' : 'Bangkalan, Jawa Timur',
          time: rt.createdAt,
          current: decoded.sessionId === currentSessionId,
          icon: uaInfo.icon
        });
      } catch (err) {
        // Token is invalid/expired. Let's delete it so database stays clean.
        await prisma.refreshToken.delete({ where: { id: rt.id } }).catch(() => {});
      }
    }

    res.json({ success: true, data: sessions });
  } catch (error) { next(error); }
}

export async function revokeSession(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    // Verify session belongs to current user
    const rt = await prisma.refreshToken.findFirst({
      where: { id, userId }
    });
    if (!rt) throw new AppError('Sesi tidak ditemukan', 404);

    await prisma.refreshToken.delete({ where: { id } });

    res.json({ success: true, message: 'Sesi berhasil dicabut' });
  } catch (error) { next(error); }
}

export async function revokeAllSessions(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];
    const decodedAccess = token ? (jwt.decode(token) as any) : null;
    const currentSessionId = decodedAccess?.sessionId;

    const refreshTokens = await prisma.refreshToken.findMany({
      where: { userId }
    });

    for (const rt of refreshTokens) {
      try {
        const decoded = jwt.verify(rt.token, process.env.JWT_REFRESH_SECRET!) as any;
        if (decoded.sessionId !== currentSessionId) {
          await prisma.refreshToken.delete({ where: { id: rt.id } });
        }
      } catch (err) {
        // Expired/invalid, delete it anyway
        await prisma.refreshToken.delete({ where: { id: rt.id } }).catch(() => {});
      }
    }

    res.json({ success: true, message: 'Semua sesi lain berhasil dicabut' });
  } catch (error) { next(error); }
}

export async function getSecurityActivity(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;

    const logs = await prisma.auditLog.findMany({
      where: { 
        userId,
        action: { in: ['LOGIN', 'PASSWORD_CHANGED', 'LOGOUT'] }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    const formatted = logs.map(log => {
      const meta = (log.meta as any) || {};
      const uaInfo = parseUserAgent(meta.ua || '');
      
      return {
        id: log.id,
        action: log.action === 'LOGIN' ? 'Login' : log.action === 'PASSWORD_CHANGED' ? 'Password changed' : 'Logout',
        time: log.createdAt,
        device: uaInfo.device,
        browser: uaInfo.browser,
        os: uaInfo.os,
        location: (meta.ip === '::1' || meta.ip === '127.0.0.1') ? 'Localhost (Bangkalan, Jawa Timur)' : 'Bangkalan, Jawa Timur',
        ok: true
      };
    });

    res.json({ success: true, data: formatted });
  } catch (error) { next(error); }
}

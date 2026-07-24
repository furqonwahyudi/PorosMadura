import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './errorHandler';
import { prisma } from '../config/database';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    name: string;
  };
}

export async function authenticate(req: AuthRequest, _res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Token autentikasi diperlukan', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    // Always re-fetch role from database to ensure latest permissions are used
    const dbUser = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, name: true, role: true, isActive: true }
    });

    if (!dbUser || !dbUser.isActive) {
      return next(new AppError('Akun tidak aktif atau tidak ditemukan', 401));
    }

    req.user = {
      id: dbUser.id,
      email: dbUser.email,
      role: dbUser.role,
      name: dbUser.name,
    };

    next();
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      next(new AppError('Token tidak valid', 401));
    } else if (error.name === 'TokenExpiredError') {
      next(new AppError('Token sudah kedaluwarsa', 401));
    } else {
      next(error);
    }
  }
}

export function authorize(...roles: string[]) {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Tidak terautentikasi', 401));
    }
    if (!roles.includes(req.user.role)) {
      return next(new AppError('Tidak memiliki izin untuk aksi ini', 403));
    }
    next();
  };
}

export function authorizePermission(permission: string) {
  return async (req: AuthRequest, _res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return next(new AppError('Tidak terautentikasi', 401));
      }

      // SUPER_ADMIN bypass
      if (req.user.role === 'SUPER_ADMIN') {
        return next();
      }

      const roleObj = await prisma.rbacRole.findUnique({
        where: { key: req.user.role }
      });

      if (!roleObj) {
        return next(new AppError('Tidak memiliki izin untuk aksi ini (Role tidak ditemukan)', 403));
      }

      if (!roleObj.permissions.includes(permission)) {
        return next(new AppError('Tidak memiliki izin untuk aksi ini', 403));
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

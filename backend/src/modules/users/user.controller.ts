import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
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

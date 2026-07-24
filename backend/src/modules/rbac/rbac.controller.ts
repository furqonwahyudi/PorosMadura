import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import { AuthRequest } from '../../middleware/auth';

export async function getRoles(req: Request, res: Response, next: NextFunction) {
  try {
    const roles = await prisma.rbacRole.findMany({
      orderBy: { name: 'asc' }
    });
    res.json({ success: true, data: roles });
  } catch (error) {
    next(error);
  }
}

export async function createRole(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { name, description } = req.body;
    if (!name || !name.trim()) {
      throw new AppError('Nama peran wajib diisi', 400);
    }

    const key = name.trim().toUpperCase().replace(/\s+/g, '_').replace(/[^A-Z0-9_]/g, '');
    
    // Check if key already exists
    const existing = await prisma.rbacRole.findUnique({ where: { key } });
    if (existing) {
      throw new AppError('Peran dengan kode nama ini sudah terdaftar', 400);
    }

    const role = await prisma.rbacRole.create({
      data: {
        name: name.trim(),
        key,
        description: description || `Otorisasi kustom untuk ${name}`,
        isSystem: false,
        permissions: []
      }
    });

    res.status(201).json({ success: true, data: role });
  } catch (error) {
    next(error);
  }
}

export async function updateRole(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const existing = await prisma.rbacRole.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError('Peran tidak ditemukan', 404);
    }

    // System roles can only have their description updated
    const updateData: any = {};
    if (existing.isSystem) {
      updateData.description = description;
    } else {
      if (name && name.trim()) {
        updateData.name = name.trim();
      }
      updateData.description = description;
    }

    const role = await prisma.rbacRole.update({
      where: { id },
      data: updateData
    });

    res.json({ success: true, data: role });
  } catch (error) {
    next(error);
  }
}

export async function deleteRole(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;

    const existing = await prisma.rbacRole.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError('Peran tidak ditemukan', 404);
    }

    if (existing.isSystem) {
      throw new AppError('Peran sistem bawaan tidak dapat dihapus', 400);
    }

    // Check if there are active users assigned to this role
    const userCount = await prisma.user.count({
      where: { role: existing.key }
    });

    if (userCount > 0) {
      throw new AppError(`Peran ini tidak dapat dihapus karena sedang digunakan oleh ${userCount} pengguna`, 400);
    }

    await prisma.rbacRole.delete({ where: { id } });

    res.json({ success: true, message: 'Peran berhasil dihapus' });
  } catch (error) {
    next(error);
  }
}

export async function saveMatrix(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const matrix = req.body.matrix as Record<string, Record<string, boolean>>;
    if (!matrix) {
      throw new AppError('Data matriks diperlukan', 400);
    }

    // Save permissions for each role key in the matrix
    const keys = Object.keys(matrix);
    for (const key of keys) {
      // Find matching roles in DB
      const dbRole = await prisma.rbacRole.findUnique({ where: { key } });
      if (!dbRole) continue;

      if (dbRole.key === 'SUPER_ADMIN') continue; // SUPER_ADMIN permissions cannot be changed

      // Extract only permissions with value = true
      const permObj = matrix[key];
      const activePermissions = Object.keys(permObj).filter(perm => permObj[perm] === true);

      await prisma.rbacRole.update({
        where: { key },
        data: { permissions: activePermissions }
      });
    }

    res.json({ success: true, message: 'Matriks otorisasi berhasil disimpan' });
  } catch (error) {
    next(error);
  }
}

import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import { AuthRequest } from '../../middleware/auth';
import { z } from 'zod';
import slugify from '../../utils/slugify';

const tagSchema = z.object({
  name: z.string().min(1),
  slug: z.string().optional(),
});

export async function getTags(req: Request, res: Response, next: NextFunction) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.q as string || '';
    const skip = (page - 1) * limit;

    const whereClause: any = {};
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [tags, total] = await Promise.all([
      prisma.tag.findMany({
        where: whereClause,
        include: {
          _count: { select: { articles: true } },
        },
        orderBy: { name: 'asc' },
        skip,
        take: limit,
      }),
      prisma.tag.count({ where: whereClause }),
    ]);

    // Format output
    const formattedTags = tags.map(tag => ({
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
      count: tag._count.articles,
    }));

    res.json({
      success: true,
      data: formattedTags,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function createTag(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = tagSchema.parse(req.body);
    const slug = data.slug || slugify(data.name);

    const existing = await prisma.tag.findUnique({ where: { slug } });
    if (existing) throw new AppError('Tag dengan nama/slug ini sudah ada', 409);

    const tag = await prisma.tag.create({
      data: {
        name: data.name,
        slug,
      },
    });

    res.status(201).json({ success: true, message: 'Tag berhasil dibuat', data: tag });
  } catch (error) {
    next(error);
  }
}

export async function updateTag(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const data = tagSchema.partial().parse(req.body);

    const updateData: any = {};
    if (data.name) {
      updateData.name = data.name;
      updateData.slug = data.slug || slugify(data.name);
    }

    const tag = await prisma.tag.update({
      where: { id },
      data: updateData,
    });

    res.json({ success: true, message: 'Tag berhasil diperbarui', data: tag });
  } catch (error) {
    next(error);
  }
}

export async function deleteTag(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    await prisma.tag.delete({ where: { id } });
    res.json({ success: true, message: 'Tag berhasil dihapus' });
  } catch (error) {
    next(error);
  }
}

export async function mergeTags(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const schema = z.object({
      sourceTagIds: z.array(z.string().uuid()),
      targetTagId: z.string().uuid(),
    });

    const { sourceTagIds, targetTagId } = schema.parse(req.body);

    if (sourceTagIds.includes(targetTagId)) {
      throw new AppError('Tag tujuan tidak boleh masuk dalam tag asal', 400);
    }

    // Verify target tag exists
    const targetTag = await prisma.tag.findUnique({ where: { id: targetTagId } });
    if (!targetTag) throw new AppError('Tag tujuan tidak ditemukan', 404);

    // Let's run the merging in a single transaction
    await prisma.$transaction(async (tx) => {
      for (const sourceId of sourceTagIds) {
        // Find all articles related to the source tag
        const relations = await tx.articleTag.findMany({
          where: { tagId: sourceId },
        });

        for (const relation of relations) {
          // Check if article is already linked to the target tag
          const targetExists = await tx.articleTag.findUnique({
            where: {
              articleId_tagId: {
                articleId: relation.articleId,
                tagId: targetTagId,
              },
            },
          });

          if (!targetExists) {
            // Re-assign the relation
            await tx.articleTag.create({
              data: {
                articleId: relation.articleId,
                tagId: targetTagId,
              },
            });
          }
        }

        // Delete relations of the source tag
        await tx.articleTag.deleteMany({
          where: { tagId: sourceId },
        });

        // Delete the source tag itself
        await tx.tag.delete({
          where: { id: sourceId },
        });
      }
    });

    res.json({ success: true, message: 'Tag berhasil digabungkan (merged)' });
  } catch (error) {
    next(error);
  }
}

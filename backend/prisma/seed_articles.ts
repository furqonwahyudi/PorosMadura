import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { dummyArticles } from '../../frontend/src/data/dummyArticles';
import slugify from '../src/utils/slugify';
import 'dotenv/config';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Mengimpor dummy articles ke database...');

  // Get the default author (Super Admin)
  const author = await prisma.user.findFirst({
    where: { role: 'SUPER_ADMIN' }
  });

  if (!author) {
    console.error('❌ Harap jalankan seed.ts terlebih dahulu untuk membuat user admin.');
    return;
  }

  // Get all categories to match by slug
  const dbCategories = await prisma.category.findMany();
  const categoryMap = new Map<string, string>(); // slug -> id
  dbCategories.forEach(c => categoryMap.set(c.slug.toLowerCase(), c.id));

  let count = 0;
  for (const art of dummyArticles) {
    // Determine the category slug we want to match
    // If there is a subCategory, we map to that. Otherwise, parent category.
    const targetSlug = (art.subCategory || art.category).toLowerCase();
    
    let categoryId = categoryMap.get(targetSlug);
    
    // Fallback if category not found in DB: map to 'lainnya'
    if (!categoryId) {
      categoryId = categoryMap.get('lainnya');
    }

    if (!categoryId) {
      console.warn(`⚠️ Kategori tidak ditemukan untuk slug: ${targetSlug}. Melewati artikel: ${art.title}`);
      continue;
    }

    // Prepare tags
    const tagRelations = [];
    if (art.tags && art.tags.length > 0) {
      for (const tagName of art.tags) {
        const tagSlug = slugify(tagName);
        if (!tagSlug) continue;
        
        // Upsert tag
        const tag = await prisma.tag.upsert({
          where: { slug: tagSlug },
          update: {},
          create: { name: tagName, slug: tagSlug }
        });
        
        tagRelations.push({ tagId: tag.id });
      }
    }

    // Insert article
    await prisma.article.upsert({
      where: { slug: art.slug },
      update: {},
      create: {
        title: art.title,
        slug: art.slug,
        content: art.content,
        excerpt: art.title.substring(0, 150) + '...',
        image: art.image,
        status: 'PUBLISHED',
        publishedAt: new Date(art.publishDate),
        isBreaking: art.isBreaking || false,
        isHeadline: art.isHeadline || false,
        isEditorChoice: art.isEditorChoice || false,
        isTrending: art.isTrending || false,
        views: art.views || 0,
        reads: art.reads || 0,
        shares: art.shares || 0,
        categoryId: categoryId,
        authorId: author.id,
        tags: {
          create: tagRelations
        }
      }
    });

    count++;
  }

  console.log(`🎉 Berhasil mengimpor ${count} artikel ke database.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

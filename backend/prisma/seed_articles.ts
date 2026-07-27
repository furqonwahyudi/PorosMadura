import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import slugify from '../src/utils/slugify';
import 'dotenv/config';

const dummyArticles = [
  {
    title: "Geliat Perekonomian Madura Pascopandemi Menunjukkan Tren Positif",
    slug: "geliat-perekonomian-madura-pascopandemi",
    category: "Ekonomi",
    content: "<p>Perekonomian di wilayah Madura terus bangkit pascopandemi Covid-19. Sektor UMKM dan pariwisata lokal menjadi motor penggerak utama pertumbuhan ekonomi daerah.</p>",
    tags: ["Ekonomi", "Madura", "UMKM"],
    image: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800",
    views: 1250,
    reads: 890,
    shares: 45,
    isBreaking: false,
    isHeadline: true,
    isEditorChoice: true,
    isTrending: true
  },
  {
    title: "Pariwisata Pantai Lombang Sumenep Ramai Dikunjungi Wisatawan",
    slug: "pariwisata-pantai-lombang-sumenep-ramai",
    category: "Daerah",
    subCategory: "Sumenep",
    content: "<p>Pantai Lombang di Kabupaten Sumenep dengan ciri khas pohon cemara udangnya kembali menjadi destinasi favorit wisatawan pada libur akhir pekan ini.</p>",
    tags: ["Sumenep", "Wisata", "Pantai Lombang"],
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
    views: 840,
    reads: 610,
    shares: 23,
    isBreaking: false,
    isHeadline: false,
    isEditorChoice: false,
    isTrending: false
  },
  {
    title: "Pemkab Bangkalan Gelar Festival Kebudayaan Karapan Sapi Piala Presiden",
    slug: "pemkab-bangkalan-gelar-festival-karapan-sapi",
    category: "Daerah",
    subCategory: "Bangkalan",
    content: "<p>Kabupaten Bangkalan sukses menggelar festival kebudayaan karapan sapi tingkat regional dalam rangka memelihara tradisi khas masyarakat Madura.</p>",
    tags: ["Bangkalan", "Karapan Sapi", "Budaya"],
    image: "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800",
    views: 3100,
    reads: 2040,
    shares: 198,
    isBreaking: true,
    isHeadline: true,
    isEditorChoice: false,
    isTrending: true
  },
  {
    title: "Persiapan Pilkada Serentak di Sampang Berjalan Kondusif dan Aman",
    slug: "persiapan-pilkada-serentak-di-sampang-kondusif",
    category: "Daerah",
    subCategory: "Sampang",
    content: "<p>Pihak kepolisian resort Sampang bersama KPU memastikan koordinasi pengamanan Pilkada serentak berjalan lancar demi menjaga ketertiban masyarakat.</p>",
    tags: ["Sampang", "Pilkada", "Politik"],
    image: "https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=800",
    views: 930,
    reads: 720,
    shares: 12,
    isBreaking: false,
    isHeadline: false,
    isEditorChoice: true,
    isTrending: false
  },
  {
    title: "Sentra Batik Tulis Pamekasan Go International Melalui Pameran Ekspor",
    slug: "sentra-batik-tulis-pamekasan-go-international",
    category: "Daerah",
    subCategory: "Pamekasan",
    content: "<p>Kerajinan batik tulis khas Pamekasan yang dikenal dengan corak warna berani berhasil menembus pasar ekspor Eropa melalui program kemitraan UMKM binaan Pemprov Jawa Timur.</p>",
    tags: ["Pamekasan", "Batik Tulis", "Ekspor"],
    image: "https://images.unsplash.com/photo-1528164344705-47542687000d?w=800",
    views: 1420,
    reads: 980,
    shares: 64,
    isBreaking: false,
    isHeadline: false,
    isEditorChoice: false,
    isTrending: true
  },
  {
    title: "Rekomendasi Kebijakan Baru Sektor Pertanian Tembakau Madura",
    slug: "rekomendasi-kebijakan-baru-pertanian-tembakau",
    category: "Politik",
    subCategory: "Pemerintahan",
    content: "<p>Dewan perwakilan rakyat daerah bersama asosiasi petani tembakau merumuskan draf kebijakan regulasi tata niaga tembakau Madura guna meningkatkan kesejahteraan petani lokal.</p>",
    tags: ["Pemerintahan", "Tembakau", "Pertanian"],
    image: "https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?w=800",
    views: 1100,
    reads: 750,
    shares: 34,
    isBreaking: false,
    isHeadline: false,
    isEditorChoice: false,
    isTrending: false
  }
];

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
        publishedAt: art.publishDate ? new Date(art.publishDate) : new Date(),
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

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcrypt';
import 'dotenv/config';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Mulai seeding database Poros Madura...');

  // Clean up parent categories that are no longer used
  await prisma.category.deleteMany({
    where: {
      slug: {
        in: ['daerah', 'nasional', 'lainnya']
      }
    }
  });

  // =============================================
  // 1. Super Admin User
  // =============================================
  const hashedPassword = await bcrypt.hash(
    process.env.ADMIN_PASSWORD || 'Admin@PorosMadura2026',
    12
  );

  const admin = await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL || 'admin@porosmadura.com' },
    update: {},
    create: {
      email: process.env.ADMIN_EMAIL || 'admin@porosmadura.com',
      password: hashedPassword,
      name: 'Super Admin',
      role: 'SUPER_ADMIN',
    },
  });
  console.log('✅ Super Admin dibuat:', admin.email);

  // =============================================
  // 2. Kategori (Flat Top-Level Categories)
  // =============================================
  const categories = [
    // Daerah Group
    { name: 'Bangkalan', slug: 'bangkalan', icon: 'MapPin', color: '#1E40AF', sortOrder: 1 },
    { name: 'Sampang', slug: 'sampang', icon: 'MapPin', color: '#1E40AF', sortOrder: 2 },
    { name: 'Pamekasan', slug: 'pamekasan', icon: 'MapPin', color: '#1E40AF', sortOrder: 3 },
    { name: 'Sumenep', slug: 'sumenep', icon: 'MapPin', color: '#1E40AF', sortOrder: 4 },

    // Nasional Group
    { name: 'Politik', slug: 'politik', icon: 'Flag', color: '#0D2B5C', sortOrder: 5 },
    { name: 'Pemerintahan', slug: 'pemerintahan', icon: 'Flag', color: '#0D2B5C', sortOrder: 6 },
    { name: 'Hukum', slug: 'hukum', icon: 'Flag', color: '#0D2B5C', sortOrder: 7 },
    { name: 'Kriminal', slug: 'kriminal', icon: 'Flag', color: '#0D2B5C', sortOrder: 8 },
    { name: 'Pendidikan', slug: 'pendidikan', icon: 'Flag', color: '#0D2B5C', sortOrder: 9 },
    { name: 'Kesehatan', slug: 'kesehatan', icon: 'Flag', color: '#0D2B5C', sortOrder: 10 },
    { name: 'Ekonomi', slug: 'ekonomi', icon: 'TrendingUp', color: '#D97706', sortOrder: 11 },

    // Lainnya Group
    { name: 'Lifestyle', slug: 'lifestyle', icon: 'MoreHorizontal', color: '#6B7280', sortOrder: 12 },
    { name: 'Budaya', slug: 'budaya', icon: 'MoreHorizontal', color: '#6B7280', sortOrder: 13 },
    { name: 'Wisata', slug: 'wisata', icon: 'MoreHorizontal', color: '#6B7280', sortOrder: 14 },
    { name: 'Kuliner', slug: 'kuliner', icon: 'MoreHorizontal', color: '#6B7280', sortOrder: 15 },
    { name: 'Hiburan', slug: 'hiburan', icon: 'MoreHorizontal', color: '#6B7280', sortOrder: 16 },
    { name: 'Opini', slug: 'opini', icon: 'MoreHorizontal', color: '#6B7280', sortOrder: 17 },

    // Mandiri Group
    { name: 'Olahraga', slug: 'olahraga', icon: 'Trophy', color: '#D71920', sortOrder: 18 },
    { name: 'Teknologi', slug: 'teknologi', icon: 'Cpu', color: '#059669', sortOrder: 19 },
    { name: 'Otomotif', slug: 'otomotif', icon: 'Car', color: '#7C3AED', sortOrder: 20 },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { parentId: null }, // Ensure parentId is null
      create: cat,
    });
    console.log(`✅ Kategori Utama: ${cat.name}`);
  }

  // =============================================
  // 3. Ad Slots
  // =============================================
  const adSlots = [
    { name: 'Top Billboard', slug: 'top-billboard', size: '970x250', type: 'DISPLAY' as any, page: 'all' },
    { name: 'Popup / Interstitial', slug: 'popup-interstitial', size: '600x400', type: 'POPUP' as any, page: 'all' },
    { name: 'Mobile Anchor Banner', slug: 'mobile-anchor-banner', size: '320x50', type: 'DISPLAY' as any, page: 'all', sticky: true },
    { name: 'Category Banner', slug: 'category-banner', size: '728x90', type: 'DISPLAY' as any, page: 'kategori' },
    { name: 'Homepage Banner Atas', slug: 'homepage-banner-atas', size: '970x90', type: 'DISPLAY' as any, page: 'homepage' },
    { name: 'Hero Banner', slug: 'hero-banner', size: '728x90', type: 'DISPLAY' as any, page: 'homepage' },
    { name: 'Homepage Banner Tengah', slug: 'homepage-banner-tengah', size: '728x90', type: 'DISPLAY' as any, page: 'homepage' },
    { name: 'Homepage Banner Bawah', slug: 'homepage-banner-bawah', size: '970x90', type: 'DISPLAY' as any, page: 'homepage' },
    { name: 'In-Feed Ad 1', slug: 'in-feed-1', size: '300x250', type: 'NATIVE' as any, page: 'all' },
    { name: 'Mobile In-Feed Banner', slug: 'mobile-in-feed-banner', size: '320x100', type: 'NATIVE' as any, page: 'all' },
    { name: 'In-Feed Ad 2', slug: 'in-feed-2', size: '300x250', type: 'NATIVE' as any, page: 'all' },
    { name: 'In-Feed Ad 3', slug: 'in-feed-3', size: '300x250', type: 'NATIVE' as any, page: 'all' },
    { name: 'In-Feed Ad 4', slug: 'in-feed-4', size: '300x250', type: 'NATIVE' as any, page: 'all' },
    { name: 'Sidebar Top', slug: 'sidebar-top', size: '300x250', type: 'DISPLAY' as any, page: 'all' },
    { name: 'Sidebar Middle', slug: 'sidebar-middle', size: '300x250', type: 'DISPLAY' as any, page: 'all' },
    { name: 'Sidebar Bottom', slug: 'sidebar-bottom', size: '300x250', type: 'DISPLAY' as any, page: 'all' },
    { name: 'Sidebar Sticky', slug: 'sidebar-sticky', size: '300x600', type: 'DISPLAY' as any, page: 'all', sticky: true },
    { name: 'Breaking News Banner', slug: 'breaking-news-banner', size: '728x90', type: 'DISPLAY' as any, page: 'all' },
    { name: 'Header Banner', slug: 'header-banner', size: '468x60', type: 'DISPLAY' as any, page: 'all' },
    { name: 'Top Leaderboard', slug: 'top-leaderboard', size: '970x90', type: 'DISPLAY' as any, page: 'all' },
    { name: 'In-Article Ad 1', slug: 'in-article-1', size: '300x250', type: 'DISPLAY' as any, page: 'artikel' },
    { name: 'In-Article Ad 2', slug: 'in-article-2', size: '300x250', type: 'DISPLAY' as any, page: 'artikel' },
    { name: 'In-Article Ad 3', slug: 'in-article-3', size: '300x250', type: 'DISPLAY' as any, page: 'artikel' },
    { name: 'In-Article Ad 4', slug: 'in-article-4', size: '300x250', type: 'DISPLAY' as any, page: 'artikel' },
    { name: 'Video Banner Ad', slug: 'video-banner', size: '640x360', type: 'VIDEO' as any, page: 'artikel' },
    { name: 'Related News Banner', slug: 'related-news-banner', size: '728x90', type: 'DISPLAY' as any, page: 'artikel' },
    { name: 'Footer Billboard', slug: 'footer-billboard', size: '970x250', type: 'DISPLAY' as any, page: 'artikel' },
    { name: 'Footer Banner', slug: 'footer-banner', size: '728x90', type: 'DISPLAY' as any, page: 'artikel' },
  ];

  for (const slot of adSlots) {
    await prisma.adSlot.upsert({
      where: { slug: slot.slug },
      update: {},
      create: slot,
    });
    console.log(`✅ Ad Slot: ${slot.name}`);
  }

  // =============================================
  // 4. Website Settings
  // =============================================
  await prisma.websiteSettings.upsert({
    where: { id: 'singleton' },
    update: {},
    create: {
      id: 'singleton',
      siteName: 'Poros Madura',
      tagline: 'Berita Tepat, Fakta Kuat',
      primaryColor: '#0D2B5C',
      secondaryColor: '#1E40AF',
      accentColor: '#D71920',
      contactEmail: 'redaksi@porosmadura.com',
      socials: {
        facebook: 'https://facebook.com/porosmadura',
        instagram: 'https://instagram.com/porosmadura',
        twitter: 'https://twitter.com/porosmadura',
        tiktok: '',
        youtube: '',
        linkedin: '',
      },
    },
  });
  console.log('✅ Website Settings dibuat');

  console.log('\n🎉 Seeding selesai!');
  console.log('📧 Admin Email:', process.env.ADMIN_EMAIL || 'admin@porosmadura.com');
  console.log('🔑 Admin Password:', process.env.ADMIN_PASSWORD || 'Admin@PorosMadura2026');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });

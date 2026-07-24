import dotenv from 'dotenv';
dotenv.config();

import { execSync } from 'child_process';
import path from 'path';

// Kill any orphaned node processes occupying port 3001
try {
  const stdout = execSync('netstat -ano | findstr :3001').toString();
  const lines = stdout.split('\n');
  for (const line of lines) {
    const parts = line.trim().split(/\s+/);
    if (parts.length >= 5) {
      const pid = parts[parts.length - 1];
      if (pid && parseInt(pid) > 0 && parseInt(pid) !== process.pid) {
        execSync(`taskkill /F /PID ${pid}`);
        console.log(`[SYS] Killed orphaned process ${pid} occupying port 3001`);
      }
    }
  }
} catch (e) {
  // port was free, ignore
}

import app from './app';
import { prisma } from './config/database';
import { logger } from './config/logger';

const PORT = parseInt(process.env.PORT || '3001');

async function main() {
  try {
    // Programmatic Prisma Database Schema push & client generate
    try {
      console.log('[SYS] Synchronizing Prisma database schema...');
      execSync('npx prisma db push --accept-data-loss', { stdio: 'ignore' });
      execSync('npx prisma generate', { stdio: 'ignore' });
      console.log('[SYS] Prisma database schema synchronized successfully');
    } catch (e: any) {
      console.error('[SYS] Database sync notice:', e.message || e);
    }

    // Test database connection
    await prisma.$connect();
    logger.info('✅ Database PostgreSQL terhubung');


    // Auto-migrate schema updates for comments & blacklist & media_files
    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE comments ADD COLUMN IF NOT EXISTS "isSpam" BOOLEAN DEFAULT false;
        ALTER TABLE comments ADD COLUMN IF NOT EXISTS "isReported" BOOLEAN DEFAULT false;
        ALTER TABLE comments ADD COLUMN IF NOT EXISTS "reportReason" TEXT;
        ALTER TABLE comments ADD COLUMN IF NOT EXISTS "ipAddress" TEXT;
        ALTER TABLE media_files ADD COLUMN IF NOT EXISTS "isTemporary" BOOLEAN DEFAULT false;
        ALTER TABLE website_settings ADD COLUMN IF NOT EXISTS "trashRetention" TEXT DEFAULT '30d';
        CREATE TABLE IF NOT EXISTS "blacklist_words" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "word" TEXT NOT NULL UNIQUE,
          "type" TEXT NOT NULL DEFAULT 'WORD',
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);
      logger.info('✅ Schema database comments, blacklist_words, media_files & website_settings diperbarui');
    } catch (e: any) {
      logger.warn('Schema DDL migration notice:', e.message);
    }

    // Ensure floating skyscraper slots exist in database
    try {
      await prisma.adSlot.upsert({
        where: { slug: 'floating-left-skyscraper' },
        update: {},
        create: {
          name: 'Floating Left Skyscraper',
          slug: 'floating-left-skyscraper',
          size: '160x600',
          type: 'FLOATING' as any,
          page: 'all',
          floating: true,
          isActive: true,
        }
      });
      await prisma.adSlot.upsert({
        where: { slug: 'floating-right-skyscraper' },
        update: {},
        create: {
          name: 'Floating Right Skyscraper',
          slug: 'floating-right-skyscraper',
          size: '160x600',
          type: 'FLOATING' as any,
          page: 'all',
          floating: true,
          isActive: true,
        }
      });
      logger.info('✅ Floating skyscraper ad slots verified');
    } catch (e: any) {
      logger.warn('Failed to verify floating skyscraper slots:', e.message);
    }

    // Ensure default system roles exist in database
    try {
      const defaultRoles = [
        {
          key: "SUPER_ADMIN",
          name: "Super Admin",
          description: "Akses sistem penuh tanpa batas",
          isSystem: true,
          permissions: ["create_post", "publish_post", "edit_others_post", "delete_post", "manage_comments", "manage_ads", "manage_seo", "manage_settings"]
        },
        {
          key: "ADMIN",
          name: "Admin",
          description: "Mengelola konten, iklan, komentar, optimasi SEO, dan konfigurasi portal",
          isSystem: true,
          permissions: ["create_post", "publish_post", "edit_others_post", "delete_post", "manage_comments", "manage_ads", "manage_seo", "manage_settings"]
        },
        {
          key: "EDITOR",
          name: "Editor",
          description: "Menulis, mengedit tulisan jurnalis lain, mengelola komentar, dan menerbitkan berita",
          isSystem: true,
          permissions: ["create_post", "publish_post", "edit_others_post", "manage_comments"]
        },
        {
          key: "REPORTER",
          name: "Reporter",
          description: "Menulis draf berita secara mandiri (butuh persetujuan Editor untuk publish)",
          isSystem: true,
          permissions: ["create_post"]
        },
        {
          key: "CONTRIBUTOR",
          name: "Kontributor",
          description: "Menyumbang draf artikel/opini dari luar redaksi",
          isSystem: true,
          permissions: ["create_post"]
        },
        {
          key: "SALES",
          name: "Sales",
          description: "Otorisasi kustom untuk Sales",
          isSystem: false,
          permissions: ["manage_ads"]
        },
        {
          key: "PEMIMPIN_REDAKSI",
          name: "Pemimpin Redaksi",
          description: "Otorisasi kustom untuk Pemimpin Redaksi",
          isSystem: false,
          permissions: ["create_post", "publish_post", "edit_others_post", "delete_post", "manage_comments", "manage_seo", "manage_settings"]
        }
      ];

      for (const r of defaultRoles) {
        await prisma.rbacRole.upsert({
          where: { key: r.key },
          update: {},
          create: r
        });
      }
      logger.info('✅ Default RBAC system roles verified and seeded');
    } catch (e: any) {
      logger.warn('Failed to verify and seed default RBAC roles:', e.message);
    }

    // Force admin@porosmadura.com user to SUPER_ADMIN role to recover from migration defaults
    try {
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@porosmadura.com';
      await prisma.user.updateMany({
        where: { email: adminEmail },
        data: { role: 'SUPER_ADMIN' }
      });
      logger.info('✅ Admin user elevated to SUPER_ADMIN role in database');
    } catch (e: any) {
      logger.warn('Failed to elevate admin user role:', e.message);
    }

    app.listen(PORT, () => {
      logger.info(`🚀 Poros Madura API berjalan di http://localhost:${PORT}`);
      logger.info(`📝 Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    logger.error('❌ Gagal terhubung ke database:', error);
    process.exit(1);
  }
}

main(); // Start server - tags registered

process.on('uncaughtException', (error) => {
  logger.error('CRITICAL UNCAUGHT EXCEPTION:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('CRITICAL UNHANDLED REJECTION:', reason);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM diterima. Menutup server...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT diterima. Menutup server...');
  await prisma.$disconnect();
  process.exit(0);
});

// Trigger restart to execute database seeds: 2026-07-23T23:28


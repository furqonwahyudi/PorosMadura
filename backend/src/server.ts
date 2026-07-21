import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { prisma } from './config/database';
import { logger } from './config/logger';

const PORT = parseInt(process.env.PORT || '3001');

async function main() {
  try {
    // Test database connection
    await prisma.$connect();
    logger.info('✅ Database PostgreSQL terhubung');

    // Auto-migrate schema updates for comments & blacklist
    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE comments ADD COLUMN IF NOT EXISTS "isSpam" BOOLEAN DEFAULT false;
        ALTER TABLE comments ADD COLUMN IF NOT EXISTS "isReported" BOOLEAN DEFAULT false;
        ALTER TABLE comments ADD COLUMN IF NOT EXISTS "reportReason" TEXT;
        ALTER TABLE comments ADD COLUMN IF NOT EXISTS "ipAddress" TEXT;
        CREATE TABLE IF NOT EXISTS "blacklist_words" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "word" TEXT NOT NULL UNIQUE,
          "type" TEXT NOT NULL DEFAULT 'WORD',
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);
      logger.info('✅ Schema database comments & blacklist_words diperbarui');
    } catch (e: any) {
      logger.warn('Schema DDL migration notice:', e.message);
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

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

    app.listen(PORT, () => {
      logger.info(`🚀 Poros Madura API berjalan di http://localhost:${PORT}`);
      logger.info(`📝 Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    logger.error('❌ Gagal terhubung ke database:', error);
    process.exit(1);
  }
}

main();

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

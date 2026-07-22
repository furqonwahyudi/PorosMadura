import 'dotenv/config';
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

try {
  const output = execSync('npx prisma generate', {
    cwd: path.resolve(__dirname, '../..'),
    encoding: 'utf-8'
  });
  fs.writeFileSync(path.resolve(__dirname, '../../../prisma-generate.log'), 'SUCCESS:\n' + output);
} catch (error: any) {
  fs.writeFileSync(
    path.resolve(__dirname, '../../../prisma-generate.log'),
    'ERROR:\n' + error.message + '\n' + error.stack + '\n' + (error.stdout || '') + '\n' + (error.stderr || '')
  );
}


import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function run() {
  console.log('Inserting floating skyscraper slots...');
  
  const left = await prisma.adSlot.upsert({
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
  console.log('Upserted left slot:', left.name);

  const right = await prisma.adSlot.upsert({
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
  console.log('Upserted right slot:', right.name);
  
  await prisma.$disconnect();
  await pool.end();
  console.log('Done!');
}

run().catch(console.error);

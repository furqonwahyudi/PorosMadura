require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Updating Kebijakan Privasi via Prisma...");
  
  const updatedStaticPages = {
    "privacy-policy": {
      title: "Kebijakan Privasi Dinamis (Uji Coba)",
      subtitle: "Perlindungan Data & Informasi Pembaca Poros Madura",
      content: "Ini adalah konten Kebijakan Privasi dinamis yang baru saja diupdate dari database untuk uji coba manual verification!"
    }
  };

  const settings = await prisma.websiteSettings.update({
    where: { id: 'singleton' },
    data: {
      staticPages: updatedStaticPages
    }
  });

  console.log("UPDATE SUCCESSFUL! Current staticPages:", JSON.stringify(settings.staticPages, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });

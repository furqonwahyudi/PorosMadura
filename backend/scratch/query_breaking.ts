import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("=== CHECKING BREAKING NEWS ARTICLES IN DATABASE ===");
  const breakingArticles = await prisma.article.findMany({
    where: { isBreaking: true, status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    take: 10,
    select: {
      id: true,
      title: true,
      isBreaking: true,
      status: true,
      publishedAt: true,
      createdAt: true
    }
  });

  console.log(`Found ${breakingArticles.length} active breaking news articles:`);
  breakingArticles.forEach((art, idx) => {
    console.log(`${idx + 1}. Title: "${art.title}"`);
    console.log(`   isBreaking: ${art.isBreaking}, status: ${art.status}`);
    console.log(`   publishedAt: ${art.publishedAt}, createdAt: ${art.createdAt}`);
  });

  console.log("\n=== CHECKING LATEST 5 GENERAL PUBLISHED ARTICLES (TICKER FALLBACK) ===");
  const fallbackArticles = await prisma.article.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    take: 5,
    select: {
      id: true,
      title: true,
      isBreaking: true,
      status: true,
      publishedAt: true,
      createdAt: true
    }
  });

  fallbackArticles.forEach((art, idx) => {
    console.log(`${idx + 1}. Title: "${art.title}"`);
    console.log(`   isBreaking: ${art.isBreaking}, status: ${art.status}`);
    console.log(`   publishedAt: ${art.publishedAt}, createdAt: ${art.createdAt}`);
  });
}

main()
  .catch(err => {
    console.error(err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

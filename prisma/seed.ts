import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PrismaClient } from '@prisma/client';
import { loadDotenv } from '../shared/loadDotenv.js';

loadDotenv();

const prisma = new PrismaClient();
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

interface SourceProduct {
  id: number;
  name: string;
  image: string;
  rating: number;
  booked_count: number;
  tag: string;
  per_day_rent: number;
  out_of_stock: boolean;
}

async function main() {
  const raw = readFileSync(resolve(root, 'data/product-list.json'), 'utf8');
  const parsed = JSON.parse(raw) as { products: SourceProduct[] };
  if (!Array.isArray(parsed.products) || parsed.products.length !== 23) {
    throw new Error(`Expected 23 products, received ${parsed.products?.length ?? 0}`);
  }

  for (const product of parsed.products) {
    await prisma.product.upsert({
      where: { id: product.id },
      update: {
        name: product.name,
        image: product.image,
        rating: product.rating,
        bookedCount: product.booked_count,
        tag: product.tag ?? '',
        perDayRent: product.per_day_rent,
        outOfStock: product.out_of_stock,
      },
      create: {
        id: product.id,
        name: product.name,
        image: product.image,
        rating: product.rating,
        bookedCount: product.booked_count,
        tag: product.tag ?? '',
        perDayRent: product.per_day_rent,
        outOfStock: product.out_of_stock,
      },
    });
  }

  console.log(`Seeded ${parsed.products.length} products (idempotent).`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

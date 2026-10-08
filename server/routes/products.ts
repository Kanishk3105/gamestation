import type { FastifyInstance } from 'fastify';
import { prisma } from '../prisma.js';
import { sendError } from '../http.js';
import { calculateRental, PricingError } from '../../shared/pricing/calculateRental.js';

function mapProduct(product: {
  id: number;
  name: string;
  image: string;
  rating: number;
  bookedCount: number;
  tag: string;
  perDayRent: { toString(): string } | number;
  outOfStock: boolean;
}) {
  return {
    id: product.id,
    name: product.name,
    image: product.image,
    rating: product.rating,
    booked_count: product.bookedCount,
    tag: product.tag,
    per_day_rent: Number(product.perDayRent),
    out_of_stock: product.outOfStock,
  };
}

export async function productRoutes(app: FastifyInstance) {
  app.get('/api/products', async () => {
    const products = await prisma.product.findMany({ orderBy: { bookedCount: 'desc' } });
    return { products: products.map(mapProduct) };
  });

  app.get('/api/products/:id', async (request, reply) => {
    const id = Number((request.params as { id: string }).id);
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return sendError(reply, 404, 'NOT_FOUND', 'Product not found');
    return { product: mapProduct(product) };
  });

  app.post('/api/rentals/quote', async (request, reply) => {
    const body = request.body as {
      productId: number;
      quantity: number;
      deliveryDate: string;
      pickupDate: string;
    };
    const product = await prisma.product.findUnique({ where: { id: Number(body.productId) } });
    if (!product) return sendError(reply, 404, 'NOT_FOUND', 'Product not found');
    try {
      const quote = calculateRental({
        dailyRate: Number(product.perDayRent),
        quantity: Number(body.quantity),
        deliveryDate: body.deliveryDate,
        pickupDate: body.pickupDate,
        outOfStock: product.outOfStock,
      });
      return { product: mapProduct(product), quote };
    } catch (error) {
      if (error instanceof PricingError) {
        return sendError(reply, 400, error.code, error.message);
      }
      throw error;
    }
  });
}

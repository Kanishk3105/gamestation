import type { FastifyInstance } from 'fastify';
import type { AppEnv } from '../env.js';
import { prisma } from '../prisma.js';
import { sendError } from '../http.js';
import { ensureGuestId, getSessionUser } from '../services/session.js';

export async function wishlistRoutes(app: FastifyInstance, env: AppEnv) {
  app.get('/api/wishlist', async (request, reply) => {
    const user = await getSessionUser(request);
    const guestId = ensureGuestId(request, reply, env);
    const items = await prisma.wishlistItem.findMany({
      where: user ? { userId: user.id } : { guestId },
      include: { product: true },
      orderBy: { createdAt: 'desc' },
    });
    return {
      items: items.map((item) => ({
        id: item.id,
        productId: item.productId,
        product: {
          id: item.product.id,
          name: item.product.name,
          image: item.product.image,
          rating: item.product.rating,
          booked_count: item.product.bookedCount,
          tag: item.product.tag,
          per_day_rent: Number(item.product.perDayRent),
          out_of_stock: item.product.outOfStock,
        },
      })),
    };
  });

  app.post('/api/wishlist', async (request, reply) => {
    const productId = Number((request.body as { productId?: number }).productId);
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return sendError(reply, 404, 'NOT_FOUND', 'Product not found');
    const user = await getSessionUser(request);
    const guestId = ensureGuestId(request, reply, env);
    const item = await prisma.wishlistItem.upsert({
      where: user
        ? { userId_productId: { userId: user.id, productId } }
        : { guestId_productId: { guestId, productId } },
      update: {},
      create: user ? { userId: user.id, productId } : { guestId, productId },
    });
    return { ok: true, id: item.id };
  });

  app.delete('/api/wishlist/:productId', async (request, reply) => {
    const productId = Number((request.params as { productId: string }).productId);
    const user = await getSessionUser(request);
    const guestId = ensureGuestId(request, reply, env);
    await prisma.wishlistItem.deleteMany({
      where: user ? { userId: user.id, productId } : { guestId, productId },
    });
    return { ok: true };
  });
}

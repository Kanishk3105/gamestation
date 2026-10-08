import type { FastifyInstance } from 'fastify';
import type { AppEnv } from '../env.js';
import { sendError } from '../http.js';
import { prisma } from '../prisma.js';
import { getOrCreateCart, pricingToHttp, serializeCart } from '../services/cart.js';
import { ensureGuestId, getSessionUser } from '../services/session.js';
import { calculateRental } from '../../shared/pricing/calculateRental.js';

async function identity(request: Parameters<typeof getSessionUser>[0], reply: Parameters<typeof ensureGuestId>[1], env: AppEnv) {
  const user = await getSessionUser(request);
  const guestId = ensureGuestId(request, reply, env);
  return { userId: user?.id ?? null, guestId: user ? null : guestId };
}

export async function cartRoutes(app: FastifyInstance, env: AppEnv) {
  app.get('/api/cart', async (request, reply) => {
    const id = await identity(request, reply, env);
    const cart = await getOrCreateCart(id);
    try {
      return serializeCart(cart);
    } catch (error) {
      const mapped = pricingToHttp(error);
      if (mapped) return sendError(reply, mapped.statusCode, mapped.code, mapped.message);
      throw error;
    }
  });

  app.post('/api/cart', async (request, reply) => {
    const body = request.body as {
      productId: number;
      quantity: number;
      deliveryDate: string;
      pickupDate: string;
    };
    const product = await prisma.product.findUnique({ where: { id: Number(body.productId) } });
    if (!product) return sendError(reply, 404, 'NOT_FOUND', 'Product not found');
    try {
      calculateRental({
        dailyRate: Number(product.perDayRent),
        quantity: Number(body.quantity),
        deliveryDate: body.deliveryDate,
        pickupDate: body.pickupDate,
        outOfStock: product.outOfStock,
      });
    } catch (error) {
      const mapped = pricingToHttp(error);
      if (mapped) return sendError(reply, mapped.statusCode, mapped.code, mapped.message);
      throw error;
    }

    const id = await identity(request, reply, env);
    const cart = await getOrCreateCart(id);
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId: product.id,
        quantity: Number(body.quantity),
        deliveryDate: new Date(body.deliveryDate),
        pickupDate: new Date(body.pickupDate),
      },
    });
    const next = await getOrCreateCart(id);
    return serializeCart(next);
  });

  app.patch('/api/cart/items/:id', async (request, reply) => {
    const itemId = (request.params as { id: string }).id;
    const body = request.body as {
      quantity?: number;
      deliveryDate?: string;
      pickupDate?: string;
    };
    const item = await prisma.cartItem.findUnique({ where: { id: itemId }, include: { product: true, cart: true } });
    if (!item) return sendError(reply, 404, 'NOT_FOUND', 'Cart item not found');
    const owner = await identity(request, reply, env);
    if (owner.userId ? item.cart.userId !== owner.userId : item.cart.guestId !== owner.guestId) {
      return sendError(reply, 404, 'NOT_FOUND', 'Cart item not found');
    }
    const quantity = body.quantity ?? item.quantity;
    const deliveryDate = body.deliveryDate ?? item.deliveryDate.toISOString();
    const pickupDate = body.pickupDate ?? item.pickupDate.toISOString();
    try {
      calculateRental({
        dailyRate: Number(item.product.perDayRent),
        quantity,
        deliveryDate,
        pickupDate,
        outOfStock: item.product.outOfStock,
      });
    } catch (error) {
      const mapped = pricingToHttp(error);
      if (mapped) return sendError(reply, mapped.statusCode, mapped.code, mapped.message);
      throw error;
    }
    await prisma.cartItem.update({
      where: { id: itemId },
      data: {
        quantity,
        deliveryDate: new Date(deliveryDate),
        pickupDate: new Date(pickupDate),
      },
    });
    const id = await identity(request, reply, env);
    return serializeCart(await getOrCreateCart(id));
  });

  app.delete('/api/cart/items/:id', async (request, reply) => {
    const itemId = (request.params as { id: string }).id;
    const owner = await identity(request, reply, env);
    await prisma.cartItem.deleteMany({
      where: {
        id: itemId,
        cart: owner.userId ? { userId: owner.userId } : { guestId: owner.guestId },
      },
    });
    const id = await identity(request, reply, env);
    return serializeCart(await getOrCreateCart(id));
  });
}

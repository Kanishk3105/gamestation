import { prisma } from '../prisma.js';
import { calculateRental, sumQuotes } from '../../shared/pricing/calculateRental.js';
import { PricingError } from '../../shared/pricing/calculateRental.js';

export async function getOrCreateCart(identity: { userId?: string | null; guestId?: string | null }) {
  if (identity.userId) {
    return prisma.cart.upsert({
      where: { userId: identity.userId },
      update: {},
      create: { userId: identity.userId },
      include: { items: { include: { product: true } } },
    });
  }
  if (!identity.guestId) {
    throw Object.assign(new Error('Missing guest identity'), { statusCode: 400, code: 'GUEST_REQUIRED' });
  }
  return prisma.cart.upsert({
    where: { guestId: identity.guestId },
    update: {},
    create: { guestId: identity.guestId },
    include: { items: { include: { product: true } } },
  });
}

export async function mergeGuestCart(userId: string, guestId: string) {
  const guestCart = await prisma.cart.findUnique({
    where: { guestId },
    include: { items: true },
  });
  if (!guestCart) return;
  const userCart = await getOrCreateCart({ userId });
  for (const item of guestCart.items) {
    await prisma.cartItem.create({
      data: {
        cartId: userCart.id,
        productId: item.productId,
        quantity: item.quantity,
        deliveryDate: item.deliveryDate,
        pickupDate: item.pickupDate,
      },
    });
  }
  await prisma.cart.delete({ where: { id: guestCart.id } });
}

export async function mergeGuestWishlist(userId: string, guestId: string) {
  const guestItems = await prisma.wishlistItem.findMany({ where: { guestId } });
  for (const item of guestItems) {
    await prisma.wishlistItem.upsert({
      where: { userId_productId: { userId, productId: item.productId } },
      update: {},
      create: { userId, productId: item.productId },
    });
  }
  await prisma.wishlistItem.deleteMany({ where: { guestId } });
}

export function serializeCart(cart: Awaited<ReturnType<typeof getOrCreateCart>>) {
  const lines = cart.items.map((item) => {
    const quote = calculateRental({
      dailyRate: Number(item.product.perDayRent),
      deliveryDate: item.deliveryDate,
      pickupDate: item.pickupDate,
      quantity: item.quantity,
      outOfStock: item.product.outOfStock,
    });
    return {
      id: item.id,
      productId: item.productId,
      name: item.product.name,
      image: item.product.image,
      ...quote,
      quantity: item.quantity,
    };
  });

  const totals = sumQuotes(lines);
  return {
    id: cart.id,
    items: lines,
    totals,
  };
}

export function pricingToHttp(error: unknown) {
  if (error instanceof PricingError) {
    return { statusCode: 400, code: error.code, message: error.message };
  }
  return null;
}

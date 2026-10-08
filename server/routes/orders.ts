import { randomBytes } from 'node:crypto';
import type { FastifyInstance } from 'fastify';
import type { AppEnv } from '../env.js';
import { sendError } from '../http.js';
import { prisma } from '../prisma.js';
import { getSessionUser } from '../services/session.js';
import { getOrCreateCart } from '../services/cart.js';
import { calculateRental, sumQuotes } from '../../shared/pricing/calculateRental.js';
import { createPaymentProvider, recordPayment } from '../services/payment.js';

function publicRef() {
  return `GS-${randomBytes(4).toString('hex').toUpperCase()}`;
}

function serializeOrder(order: {
  id: string;
  publicRef: string;
  status: string;
  paymentStatus: string;
  subtotal: { toString(): string } | number;
  fees: { toString(): string } | number;
  discount: { toString(): string } | number;
  tax: { toString(): string } | number;
  total: { toString(): string } | number;
  deliveryDate: Date;
  pickupDate: Date;
  createdAt: Date;
  address: {
    fullName: string;
    phone: string;
    line1: string;
    house: string;
    city: string;
    state: string;
    pincode: string;
  };
  items: Array<{
    id: string;
    productId: number;
    productNameSnapshot: string;
    imageSnapshot: string;
    dailyRateSnapshot: { toString(): string } | number;
    quantity: number;
    rentalDays: number;
    lineTotal: { toString(): string } | number;
  }>;
  payment: { provider: string; isTest: boolean; status: string; providerRef: string | null } | null;
}) {
  return {
    id: order.id,
    publicRef: order.publicRef,
    status: order.status,
    paymentStatus: order.paymentStatus,
    subtotal: Number(order.subtotal),
    fees: Number(order.fees),
    discount: Number(order.discount),
    tax: Number(order.tax),
    total: Number(order.total),
    deliveryDate: order.deliveryDate,
    pickupDate: order.pickupDate,
    createdAt: order.createdAt,
    address: order.address,
    items: order.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      name: item.productNameSnapshot,
      image: item.imageSnapshot,
      dailyRate: Number(item.dailyRateSnapshot),
      quantity: item.quantity,
      rentalDays: item.rentalDays,
      lineTotal: Number(item.lineTotal),
    })),
    payment: order.payment,
  };
}

export async function orderRoutes(app: FastifyInstance, env: AppEnv) {
  app.post('/api/orders', async (request, reply) => {
    const user = await getSessionUser(request);
    if (!user) return sendError(reply, 401, 'UNAUTHENTICATED', 'Sign in to place an order');
    const body = request.body as { addressId?: string; idempotencyKey?: string; confirmTestPayment?: boolean };
    const idempotencyKey = String(body.idempotencyKey ?? request.headers['idempotency-key'] ?? '').trim();
    if (!idempotencyKey) return sendError(reply, 400, 'IDEMPOTENCY_REQUIRED', 'Idempotency-Key is required');
    if (!body.addressId) return sendError(reply, 400, 'ADDRESS_REQUIRED', 'Select a delivery address');

    const existing = await prisma.order.findUnique({
      where: { idempotencyKey },
      include: { items: true, address: true, payment: true },
    });
    if (existing) return { order: serializeOrder(existing), reused: true };

    const address = await prisma.address.findFirst({ where: { id: body.addressId, userId: user.id } });
    if (!address) return sendError(reply, 400, 'ADDRESS_INVALID', 'Address not found');

    const cart = await getOrCreateCart({ userId: user.id });
    if (cart.items.length === 0) return sendError(reply, 400, 'CART_EMPTY', 'Your cart is empty');

    const quotes = cart.items.map((item) => {
      const quote = calculateRental({
        dailyRate: Number(item.product.perDayRent),
        quantity: item.quantity,
        deliveryDate: item.deliveryDate,
        pickupDate: item.pickupDate,
        outOfStock: item.product.outOfStock,
      });
      return { item, quote };
    });
    const totals = sumQuotes(quotes.map((entry) => entry.quote));
    const deliveryDate = quotes.reduce((min, entry) => (entry.quote.deliveryDate < min ? entry.quote.deliveryDate : min), quotes[0].quote.deliveryDate);
    const pickupDate = quotes.reduce((max, entry) => (entry.quote.pickupDate > max ? entry.quote.pickupDate : max), quotes[0].quote.pickupDate);

    try {
      const order = await prisma.$transaction(async (tx) => {
        const created = await tx.order.create({
          data: {
            publicRef: publicRef(),
            userId: user.id,
            status: 'PENDING',
            paymentStatus: 'PENDING',
            subtotal: totals.subtotal,
            fees: totals.deliveryFee,
            discount: totals.discount,
            tax: totals.tax,
            total: totals.total,
            deliveryDate: new Date(deliveryDate),
            pickupDate: new Date(pickupDate),
            addressId: address.id,
            idempotencyKey,
            items: {
              create: quotes.map(({ item, quote }) => ({
                productId: item.productId,
                productNameSnapshot: item.product.name,
                imageSnapshot: item.product.image,
                dailyRateSnapshot: quote.dailyRate,
                quantity: quote.quantity,
                rentalDays: quote.rentalDays,
                lineTotal: quote.subtotal,
              })),
            },
          },
          include: { items: true, address: true, payment: true },
        });
        await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
        return created;
      });

      if (body.confirmTestPayment === false) {
        return { order: serializeOrder(order), payment: null };
      }

      const provider = createPaymentProvider(env);
      const charge = await provider.charge({ orderId: order.id, amount: totals.total });
      await recordPayment(order.id, charge, totals.total);
      const paid = await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: charge.status,
          status: charge.status === 'PAID' ? 'CONFIRMED' : 'PENDING',
        },
        include: { items: true, address: true, payment: true },
      });

      return {
        order: serializeOrder(paid),
        payment: {
          ...charge,
          disclaimer: charge.isTest
            ? 'This was a test/development payment. No live payment gateway was charged.'
            : undefined,
        },
      };
    } catch (error) {
      const err = error as { code?: string };
      if (err.code === 'P2002') {
        const reused = await prisma.order.findUnique({
          where: { idempotencyKey },
          include: { items: true, address: true, payment: true },
        });
        if (reused) return { order: serializeOrder(reused), reused: true };
      }
      throw error;
    }
  });

  app.get('/api/orders', async (request, reply) => {
    const user = await getSessionUser(request);
    if (!user) return sendError(reply, 401, 'UNAUTHENTICATED', 'Sign in to view orders');
    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      include: { items: true, address: true, payment: true },
      orderBy: { createdAt: 'desc' },
    });
    return { orders: orders.map(serializeOrder) };
  });

  app.get('/api/orders/:id', async (request, reply) => {
    const user = await getSessionUser(request);
    if (!user) return sendError(reply, 401, 'UNAUTHENTICATED', 'Sign in to view orders');
    const id = (request.params as { id: string }).id;
    const order = await prisma.order.findFirst({
      where: { OR: [{ id }, { publicRef: id }], userId: user.id },
      include: { items: true, address: true, payment: true },
    });
    if (!order) return sendError(reply, 404, 'NOT_FOUND', 'Order not found');
    return { order: serializeOrder(order) };
  });

  app.post('/api/orders/:id/cancel', async (request, reply) => {
    const user = await getSessionUser(request);
    if (!user) return sendError(reply, 401, 'UNAUTHENTICATED', 'Sign in required');
    const id = (request.params as { id: string }).id;
    const order = await prisma.order.findFirst({ where: { id, userId: user.id } });
    if (!order) return sendError(reply, 404, 'NOT_FOUND', 'Order not found');
    if (['DELIVERED', 'ACTIVE_RENTAL', 'COMPLETED', 'CANCELLED'].includes(order.status)) {
      return sendError(reply, 400, 'NOT_CANCELLABLE', 'This order can no longer be cancelled');
    }
    const updated = await prisma.order.update({
      where: { id },
      data: { status: 'CANCELLED' },
      include: { items: true, address: true, payment: true },
    });
    return { order: serializeOrder(updated) };
  });
}

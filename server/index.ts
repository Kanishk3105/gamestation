import Fastify from 'fastify';
import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import { loadEnv } from './env.js';
import { logger } from './logger.js';
import { healthRoutes } from './routes/health.js';
import { productRoutes } from './routes/products.js';
import { authRoutes } from './routes/auth.js';
import { cartRoutes } from './routes/cart.js';
import { wishlistRoutes } from './routes/wishlist.js';
import { addressRoutes } from './routes/addresses.js';
import { orderRoutes } from './routes/orders.js';
import { prisma } from './prisma.js';

async function main() {
  const env = loadEnv();
  const app = Fastify({ logger: false });

  await app.register(cookie);
  await app.register(cors, {
    origin: env.WEB_ORIGIN,
    credentials: true,
  });
  await app.register(rateLimit, {
    max: 120,
    timeWindow: '1 minute',
  });

  await healthRoutes(app);
  await productRoutes(app);
  await authRoutes(app, env);
  await cartRoutes(app, env);
  await wishlistRoutes(app, env);
  await addressRoutes(app);
  await orderRoutes(app, env);

  app.setErrorHandler((error, _request, reply) => {
    const err = error as Error & { statusCode?: number };
    logger.error('unhandled_error', { message: err.message });
    const status = err.statusCode ?? 500;
    reply.status(status).send({
      error: {
        code: 'INTERNAL',
        message: status >= 500 ? 'Something went wrong' : err.message,
      },
    });
  });

  const shutdown = async () => {
    await app.close();
    await prisma.$disconnect();
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  await app.listen({ port: env.PORT, host: '0.0.0.0' });
  logger.info('api_started', { port: env.PORT, otpMode: env.OTP_MODE, payment: env.PAYMENT_PROVIDER });
}

main().catch((error) => {
  const err = error as Error;
  logger.error('api_boot_failed', { message: err.message });
  process.exit(1);
});

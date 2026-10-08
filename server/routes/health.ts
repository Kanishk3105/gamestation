import type { FastifyInstance } from 'fastify';
import { prisma } from '../prisma.js';

export async function healthRoutes(app: FastifyInstance) {
  app.get('/api/health', async () => ({
    status: 'ok',
    service: 'gamestation-api',
    time: new Date().toISOString(),
  }));

  app.get('/api/health/ready', async (_request, reply) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return { status: 'ready', database: 'up' };
    } catch {
      return reply.status(503).send({ status: 'not_ready', database: 'down' });
    }
  });
}

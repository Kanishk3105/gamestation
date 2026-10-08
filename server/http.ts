import type { FastifyReply, FastifyRequest } from 'fastify';

export function clientIp(request: FastifyRequest): string {
  const forwarded = request.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim();
  }
  return request.ip;
}

export function sendError(reply: FastifyReply, status: number, code: string, message: string, details?: unknown) {
  return reply.status(status).send({
    error: { code, message, details: details ?? null },
  });
}

import { createHash, randomBytes } from 'node:crypto';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { prisma } from '../prisma.js';
import type { AppEnv } from '../env.js';

export const SESSION_COOKIE = 'gs_session';
export const GUEST_COOKIE = 'gs_guest';
const SESSION_TTL_MS = 14 * 24 * 60 * 60 * 1000;

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export async function createSession(userId: string, env: AppEnv, reply: FastifyReply) {
  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await prisma.session.create({
    data: { userId, tokenHash: hashToken(token), expiresAt },
  });
  reply.setCookie(SESSION_COOKIE, token, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: env.COOKIE_SECURE,
    expires: expiresAt,
  });
}

export async function destroySession(request: FastifyRequest, reply: FastifyReply) {
  const token = request.cookies[SESSION_COOKIE];
  if (token) {
    await prisma.session.deleteMany({ where: { tokenHash: hashToken(token) } });
  }
  reply.clearCookie(SESSION_COOKIE, { path: '/' });
}

export async function getSessionUser(request: FastifyRequest) {
  const token = request.cookies[SESSION_COOKIE];
  if (!token) return null;
  const session = await prisma.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: true },
  });
  if (!session || session.expiresAt.getTime() < Date.now()) {
    if (session) await prisma.session.delete({ where: { id: session.id } });
    return null;
  }
  return session.user;
}

export function ensureGuestId(request: FastifyRequest, reply: FastifyReply, env: AppEnv): string {
  const existing = request.cookies[GUEST_COOKIE];
  if (existing) return existing;
  const guestId = randomBytes(16).toString('hex');
  reply.setCookie(GUEST_COOKIE, guestId, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: env.COOKIE_SECURE,
    maxAge: 60 * 60 * 24 * 180,
  });
  return guestId;
}

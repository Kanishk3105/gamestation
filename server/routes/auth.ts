import type { FastifyInstance } from 'fastify';
import { isEmail, isIndianMobile, normalizeEmail, normalizePhone } from '../../shared/otp/otpEngine.js';
import type { AppEnv } from '../env.js';
import { clientIp, sendError } from '../http.js';
import { OtpService } from '../services/otpService.js';
import { createSession, destroySession, ensureGuestId, getSessionUser } from '../services/session.js';
import { mergeGuestCart, mergeGuestWishlist } from '../services/cart.js';

function publicUser(user: { id: string; email: string | null; phone: string | null; createdAt: Date }) {
  return {
    id: user.id,
    email: user.email,
    phone: user.phone,
    createdAt: user.createdAt,
  };
}

export async function authRoutes(app: FastifyInstance, env: AppEnv) {
  const otp = new OtpService(env);

  app.post('/api/auth/request-email-otp', async (request, reply) => {
    const email = normalizeEmail(String((request.body as { email?: string }).email ?? ''));
    if (!isEmail(email)) return sendError(reply, 400, 'INVALID_EMAIL', 'Enter a valid email address');
    try {
      const result = await otp.requestOtp({ channel: 'email', destination: email, ip: clientIp(request) });
      return { ok: true, ...result };
    } catch (error) {
      const err = error as { statusCode?: number; code?: string; message: string; retryAfterMs?: number };
      return sendError(reply, err.statusCode ?? 500, err.code ?? 'OTP_ERROR', err.message, { retryAfterMs: err.retryAfterMs });
    }
  });

  app.post('/api/auth/request-phone-otp', async (request, reply) => {
    const phone = normalizePhone(String((request.body as { phone?: string }).phone ?? ''));
    if (!isIndianMobile(phone)) return sendError(reply, 400, 'INVALID_PHONE', 'Enter a valid Indian mobile number');
    try {
      const result = await otp.requestOtp({ channel: 'phone', destination: phone, ip: clientIp(request) });
      return { ok: true, ...result };
    } catch (error) {
      const err = error as { statusCode?: number; code?: string; message: string; retryAfterMs?: number };
      return sendError(reply, err.statusCode ?? 500, err.code ?? 'OTP_ERROR', err.message, { retryAfterMs: err.retryAfterMs });
    }
  });

  async function finishAuth(request: Parameters<typeof getSessionUser>[0], reply: Parameters<typeof createSession>[2], user: { id: string; email: string | null; phone: string | null; createdAt: Date }) {
    const guestId = request.cookies.gs_guest;
    if (guestId) {
      await mergeGuestCart(user.id, guestId);
      await mergeGuestWishlist(user.id, guestId);
    }
    await createSession(user.id, env, reply);
    return { user: publicUser(user) };
  }

  app.post('/api/auth/verify-email-otp', async (request, reply) => {
    const body = request.body as { challengeId?: string; code?: string };
    if (!body.challengeId || !body.code) return sendError(reply, 400, 'INVALID_REQUEST', 'challengeId and code are required');
    try {
      const verified = await otp.verifyOtp({ challengeId: body.challengeId, code: body.code });
      return finishAuth(request, reply, verified.user);
    } catch (error) {
      const err = error as { statusCode?: number; code?: string; message: string };
      return sendError(reply, err.statusCode ?? 500, err.code ?? 'VERIFY_FAILED', err.message);
    }
  });

  app.post('/api/auth/verify-phone-otp', async (request, reply) => {
    const body = request.body as { challengeId?: string; code?: string };
    if (!body.challengeId || !body.code) return sendError(reply, 400, 'INVALID_REQUEST', 'challengeId and code are required');
    try {
      const verified = await otp.verifyOtp({ challengeId: body.challengeId, code: body.code });
      return finishAuth(request, reply, verified.user);
    } catch (error) {
      const err = error as { statusCode?: number; code?: string; message: string };
      return sendError(reply, err.statusCode ?? 500, err.code ?? 'VERIFY_FAILED', err.message);
    }
  });

  app.get('/api/auth/me', async (request) => {
    const user = await getSessionUser(request);
    return { user: user ? publicUser(user) : null };
  });

  app.post('/api/auth/logout', async (request, reply) => {
    await destroySession(request, reply);
    ensureGuestId(request, reply, env);
    return { ok: true };
  });
}

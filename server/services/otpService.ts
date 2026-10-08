import type { OtpChannel } from '../../shared/otp/otpEngine.js';
import {
  OTP_TTL_MS,
  canResend,
  evaluateOtpVerification,
  generateOtpCode,
  hashOtp,
  type OtpChannel as Channel,
} from '../../shared/otp/otpEngine.js';
import type { AppEnv } from '../env.js';
import { prisma } from '../prisma.js';
import { logger } from '../logger.js';
import { createEmailOtpProvider, createSmsOtpProvider } from './otpProviders.js';

const REQUEST_WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS_PER_DEST = 5;
const MAX_REQUESTS_PER_IP = 12;

export class OtpService {
  constructor(private readonly env: AppEnv) {}

  private codeForDispatch(): string {
    if (this.env.OTP_MODE === 'development' && this.env.OTP_DEV_CODE) {
      return this.env.OTP_DEV_CODE;
    }
    return generateOtpCode(6);
  }

  async requestOtp(input: {
    channel: Channel;
    destination: string;
    ip: string;
  }) {
    const recentDest = await prisma.otpChallenge.count({
      where: {
        channel: input.channel as OtpChannel,
        destination: input.destination,
        createdAt: { gte: new Date(Date.now() - REQUEST_WINDOW_MS) },
      },
    });
    if (recentDest >= MAX_REQUESTS_PER_DEST) {
      const error = Object.assign(new Error('Too many OTP requests for this destination'), { statusCode: 429, code: 'RATE_LIMITED' });
      throw error;
    }

    const recentIp = await prisma.otpChallenge.count({
      where: {
        requestIp: input.ip,
        createdAt: { gte: new Date(Date.now() - REQUEST_WINDOW_MS) },
      },
    });
    if (recentIp >= MAX_REQUESTS_PER_IP) {
      const error = Object.assign(new Error('Too many OTP requests from this network'), { statusCode: 429, code: 'RATE_LIMITED' });
      throw error;
    }

    await prisma.otpChallenge.deleteMany({
      where: { expiresAt: { lt: new Date() }, consumedAt: null },
    });

    const existing = await prisma.otpChallenge.findFirst({
      where: {
        channel: input.channel as OtpChannel,
        destination: input.destination,
        consumedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (existing) {
      const resend = canResend(existing.lastSentAt);
      if (!resend.ok) {
        const error = Object.assign(new Error('Please wait before requesting another code'), {
          statusCode: 429,
          code: 'RESEND_COOLDOWN',
          retryAfterMs: resend.retryAfterMs,
        });
        throw error;
      }
    }

    const code = this.codeForDispatch();
    const challenge = await prisma.otpChallenge.create({
      data: {
        channel: input.channel as OtpChannel,
        destination: input.destination,
        codeHash: hashOtp(code, this.env.SESSION_SECRET),
        expiresAt: new Date(Date.now() + OTP_TTL_MS),
        requestIp: input.ip,
        lastSentAt: new Date(),
      },
    });

    const provider = input.channel === 'email'
      ? createEmailOtpProvider(this.env)
      : createSmsOtpProvider(this.env);

    try {
      await provider.send(input.destination, code);
    } catch (error) {
      logger.error('OTP provider failed', { channel: input.channel, provider: provider.name });
      throw error;
    }

    if (this.env.OTP_MODE === 'development') {
      logger.info('Development OTP ready', { destination: input.destination, challengeId: challenge.id });
      if (this.env.OTP_DEV_CODE) {
        logger.info('Using configured development OTP code');
      } else {
        console.info(`[otp:dev] ${input.channel} ${input.destination} code=${code}`);
      }
    }

    return {
      challengeId: challenge.id,
      expiresAt: challenge.expiresAt,
      cooldownMs: 30_000,
      provider: provider.name,
    };
  }

  async verifyOtp(input: { challengeId: string; code: string }) {
    const challenge = await prisma.otpChallenge.findUnique({ where: { id: input.challengeId } });
    if (!challenge) {
      const error = Object.assign(new Error('OTP challenge not found'), { statusCode: 404, code: 'NOT_FOUND' });
      throw error;
    }

    const result = evaluateOtpVerification(
      {
        id: challenge.id,
        channel: challenge.channel as Channel,
        destination: challenge.destination,
        codeHash: challenge.codeHash,
        expiresAt: challenge.expiresAt,
        attemptCount: challenge.attemptCount,
        consumedAt: challenge.consumedAt,
        lastSentAt: challenge.lastSentAt,
        lockedUntil: challenge.lockedUntil,
      },
      input.code,
      this.env.SESSION_SECRET,
    );

    await prisma.otpChallenge.update({
      where: { id: challenge.id },
      data: {
        attemptCount: result.attemptCount,
        lockedUntil: result.lockedUntil ?? challenge.lockedUntil,
        consumedAt: result.ok ? new Date() : challenge.consumedAt,
      },
    });

    if (!result.ok) {
      const error = Object.assign(new Error(result.reason ?? 'INVALID'), {
        statusCode: result.reason === 'LOCKED' || result.reason === 'MAX_ATTEMPTS' ? 429 : 400,
        code: result.reason ?? 'INVALID',
      });
      throw error;
    }

    const destination = challenge.destination;
    const user = challenge.channel === 'email'
      ? await prisma.user.upsert({
          where: { email: destination },
          update: {},
          create: { email: destination },
        })
      : await prisma.user.upsert({
          where: { phone: destination },
          update: {},
          create: { phone: destination },
        });

    return { user, channel: challenge.channel, destination };
  }
}

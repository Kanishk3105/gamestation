import { createHash, randomInt, timingSafeEqual } from 'node:crypto';

export const OTP_TTL_MS = 5 * 60 * 1000;
export const OTP_MAX_ATTEMPTS = 5;
export const OTP_RESEND_COOLDOWN_MS = 30 * 1000;
export const OTP_LOCK_MS = 15 * 60 * 1000;

export type OtpChannel = 'email' | 'phone';

export interface OtpChallengeState {
  id: string;
  channel: OtpChannel;
  destination: string;
  codeHash: string;
  expiresAt: Date;
  attemptCount: number;
  consumedAt: Date | null;
  lastSentAt: Date;
  lockedUntil: Date | null;
}

export function generateOtpCode(length = 6): string {
  const max = 10 ** length;
  return String(randomInt(0, max)).padStart(length, '0');
}

export function hashOtp(code: string, pepper: string): string {
  return createHash('sha256').update(`${pepper}:${code}`).digest('hex');
}

export function secureCompareHex(a: string, b: string): boolean {
  const left = Buffer.from(a, 'hex');
  const right = Buffer.from(b, 'hex');
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export type OtpVerifyFailure =
  | 'EXPIRED'
  | 'CONSUMED'
  | 'LOCKED'
  | 'INVALID'
  | 'MAX_ATTEMPTS';

export interface OtpVerifyResult {
  ok: boolean;
  reason?: OtpVerifyFailure;
  attemptCount: number;
  lockedUntil?: Date;
}

export function evaluateOtpVerification(
  challenge: OtpChallengeState,
  submittedCode: string,
  pepper: string,
  now = new Date(),
): OtpVerifyResult {
  if (challenge.consumedAt) {
    return { ok: false, reason: 'CONSUMED', attemptCount: challenge.attemptCount };
  }
  if (challenge.lockedUntil && challenge.lockedUntil.getTime() > now.getTime()) {
    return { ok: false, reason: 'LOCKED', attemptCount: challenge.attemptCount, lockedUntil: challenge.lockedUntil };
  }
  if (challenge.expiresAt.getTime() <= now.getTime()) {
    return { ok: false, reason: 'EXPIRED', attemptCount: challenge.attemptCount };
  }
  if (challenge.attemptCount >= OTP_MAX_ATTEMPTS) {
    const lockedUntil = new Date(now.getTime() + OTP_LOCK_MS);
    return { ok: false, reason: 'MAX_ATTEMPTS', attemptCount: challenge.attemptCount, lockedUntil };
  }

  const submittedHash = hashOtp(submittedCode.trim(), pepper);
  const matches = secureCompareHex(challenge.codeHash, submittedHash);
  const attemptCount = challenge.attemptCount + 1;

  if (!matches) {
    if (attemptCount >= OTP_MAX_ATTEMPTS) {
      return {
        ok: false,
        reason: 'MAX_ATTEMPTS',
        attemptCount,
        lockedUntil: new Date(now.getTime() + OTP_LOCK_MS),
      };
    }
    return { ok: false, reason: 'INVALID', attemptCount };
  }

  return { ok: true, attemptCount };
}

export function canResend(lastSentAt: Date, now = new Date()): { ok: boolean; retryAfterMs: number } {
  const elapsed = now.getTime() - lastSentAt.getTime();
  if (elapsed < OTP_RESEND_COOLDOWN_MS) {
    return { ok: false, retryAfterMs: OTP_RESEND_COOLDOWN_MS - elapsed };
  }
  return { ok: true, retryAfterMs: 0 };
}

export function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim().toLowerCase());
}

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function normalizePhone(value: string): string {
  const digits = value.replace(/[^\d+]/g, '');
  if (digits.startsWith('+')) return digits;
  if (digits.length === 10) return `+91${digits}`;
  if (digits.startsWith('91') && digits.length === 12) return `+${digits}`;
  return digits.startsWith('+') ? digits : `+${digits}`;
}

export function isIndianMobile(value: string): boolean {
  return /^\+91[6-9]\d{9}$/.test(normalizePhone(value));
}

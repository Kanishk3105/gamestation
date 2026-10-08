import { describe, expect, it } from 'vitest';
import {
  OTP_MAX_ATTEMPTS,
  canResend,
  evaluateOtpVerification,
  generateOtpCode,
  hashOtp,
  isEmail,
  isIndianMobile,
  type OtpChallengeState,
} from '../shared/otp/otpEngine';

function challenge(overrides: Partial<OtpChallengeState> = {}): OtpChallengeState {
  return {
    id: 'c1',
    channel: 'email',
    destination: 'qa@gamestation.test',
    codeHash: hashOtp('246810', 'pepper'),
    expiresAt: new Date(Date.now() + 60_000),
    attemptCount: 0,
    consumedAt: null,
    lastSentAt: new Date(),
    lockedUntil: null,
    ...overrides,
  };
}

describe('otp engine', () => {
  it('generates 6 digit codes', () => {
    expect(generateOtpCode()).toMatch(/^\d{6}$/);
  });

  it('accepts a valid unused code', () => {
    const result = evaluateOtpVerification(challenge(), '246810', 'pepper');
    expect(result.ok).toBe(true);
  });

  it('rejects expired challenges', () => {
    const result = evaluateOtpVerification(
      challenge({ expiresAt: new Date(Date.now() - 1000) }),
      '246810',
      'pepper',
    );
    expect(result.ok).toBe(false);
    expect(result.reason).toBe('EXPIRED');
  });

  it('locks after max attempts', () => {
    const result = evaluateOtpVerification(
      challenge({ attemptCount: OTP_MAX_ATTEMPTS - 1 }),
      '000000',
      'pepper',
    );
    expect(result.ok).toBe(false);
    expect(result.reason).toBe('MAX_ATTEMPTS');
    expect(result.lockedUntil).toBeInstanceOf(Date);
  });

  it('never stores comparison on raw equality for consumed codes', () => {
    const result = evaluateOtpVerification(
      challenge({ consumedAt: new Date() }),
      '246810',
      'pepper',
    );
    expect(result.reason).toBe('CONSUMED');
  });

  it('enforces resend cooldown', () => {
    expect(canResend(new Date(), new Date()).ok).toBe(false);
    expect(canResend(new Date(Date.now() - 31_000), new Date()).ok).toBe(true);
  });

  it('validates email and Indian mobiles', () => {
    expect(isEmail('a@b.com')).toBe(true);
    expect(isIndianMobile('9876543210')).toBe(true);
    expect(isIndianMobile('12345')).toBe(false);
  });
});

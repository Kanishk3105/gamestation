import { afterEach, describe, expect, it } from 'vitest';
import { loadEnv } from '../server/env';

const original = { ...process.env };

afterEach(() => {
  process.env = { ...original };
});

describe('environment guards', () => {
  it('refuses production with development OTP mode', () => {
    process.env.NODE_ENV = 'production';
    process.env.OTP_MODE = 'development';
    process.env.DATABASE_URL = 'postgresql://example';
    process.env.SESSION_SECRET = 'production-secret-value-32-chars!!';
    expect(() => loadEnv()).toThrow(/production cannot run/i);
  });

  it('refuses OTP_DEV_CODE in production', () => {
    process.env.NODE_ENV = 'production';
    process.env.OTP_MODE = 'production';
    process.env.OTP_DEV_CODE = '246810';
    process.env.DATABASE_URL = 'postgresql://example';
    process.env.SESSION_SECRET = 'production-secret-value-32-chars!!';
    expect(() => loadEnv()).toThrow(/OTP_DEV_CODE/);
  });
});

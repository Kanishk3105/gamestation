import { loadDotenv } from '../shared/loadDotenv.js';

loadDotenv();

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export type AppEnv = {
  NODE_ENV: string;
  PORT: number;
  DATABASE_URL: string;
  SESSION_SECRET: string;
  OTP_MODE: 'development' | 'production';
  OTP_DEV_CODE?: string;
  COOKIE_SECURE: boolean;
  WEB_ORIGIN: string;
  RESEND_API_KEY?: string;
  RESEND_FROM?: string;
  SMS_PROVIDER: 'none' | 'msg91' | 'twilio';
  TWILIO_ACCOUNT_SID?: string;
  TWILIO_AUTH_TOKEN?: string;
  TWILIO_PHONE_NUMBER?: string;
  MSG91_AUTH_KEY?: string;
  MSG91_SENDER_ID?: string;
  PAYMENT_PROVIDER: 'development' | 'razorpay';
  RAZORPAY_KEY_ID?: string;
  RAZORPAY_KEY_SECRET?: string;
};

export function loadEnv(): AppEnv {
  const NODE_ENV = process.env.NODE_ENV ?? 'development';
  const OTP_MODE = (process.env.OTP_MODE ?? (NODE_ENV === 'production' ? 'production' : 'development')) as AppEnv['OTP_MODE'];

  if (OTP_MODE !== 'development' && OTP_MODE !== 'production') {
    throw new Error('OTP_MODE must be development or production');
  }

  if (NODE_ENV === 'production' && OTP_MODE === 'development') {
    throw new Error('Refusing to start: production cannot run with OTP_MODE=development');
  }

  const OTP_DEV_CODE = process.env.OTP_DEV_CODE;
  if (NODE_ENV === 'production' && OTP_DEV_CODE) {
    throw new Error('Refusing to start: OTP_DEV_CODE is not allowed in production');
  }

  const PAYMENT_PROVIDER = (process.env.PAYMENT_PROVIDER ?? 'development') as AppEnv['PAYMENT_PROVIDER'];
  if (NODE_ENV === 'production' && PAYMENT_PROVIDER === 'development') {
    console.warn('[env] PAYMENT_PROVIDER=development in production — test payments only');
  }

  return {
    NODE_ENV,
    PORT: Number(process.env.PORT ?? 4000),
    DATABASE_URL: required('DATABASE_URL'),
    SESSION_SECRET: required('SESSION_SECRET', NODE_ENV === 'production' ? undefined : 'dev-session-secret-change-me-32chars!!'),
    OTP_MODE,
    OTP_DEV_CODE,
    COOKIE_SECURE: NODE_ENV === 'production',
    WEB_ORIGIN: process.env.WEB_ORIGIN ?? 'http://localhost:5173',
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    RESEND_FROM: process.env.RESEND_FROM ?? 'GameStation <noreply@gamestation.local>',
    SMS_PROVIDER: (process.env.SMS_PROVIDER ?? 'none') as AppEnv['SMS_PROVIDER'],
    TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
    TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER,
    MSG91_AUTH_KEY: process.env.MSG91_AUTH_KEY,
    MSG91_SENDER_ID: process.env.MSG91_SENDER_ID ?? 'GAMESN',
    PAYMENT_PROVIDER,
    RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
    RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
  };
}

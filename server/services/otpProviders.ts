import type { AppEnv } from '../env.js';
import { logger } from '../logger.js';

export interface OtpDeliveryProvider {
  name: string;
  send(destination: string, code: string): Promise<void>;
}

class DevelopmentOtpProvider implements OtpDeliveryProvider {
  name = 'development';
  async send(destination: string, _code: string): Promise<void> {
    logger.info('Development OTP dispatched', { destination, provider: this.name });
  }
}

class ResendEmailProvider implements OtpDeliveryProvider {
  name = 'resend';
  constructor(private readonly apiKey: string, private readonly from: string) {}
  async send(destination: string, code: string): Promise<void> {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: this.from,
        to: [destination],
        subject: 'Your GameStation verification code',
        html: `<p>Your GameStation code is <strong>${code}</strong>. It expires in 5 minutes.</p>`,
      }),
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Resend failed: ${response.status} ${text}`);
    }
  }
}

class TwilioSmsProvider implements OtpDeliveryProvider {
  name = 'twilio';
  constructor(
    private readonly sid: string,
    private readonly token: string,
    private readonly from: string,
  ) {}
  async send(destination: string, code: string): Promise<void> {
    const body = new URLSearchParams({
      To: destination,
      From: this.from,
      Body: `GameStation code: ${code}. Expires in 5 minutes.`,
    });
    const auth = Buffer.from(`${this.sid}:${this.token}`).toString('base64');
    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${this.sid}/Messages.json`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    });
    if (!response.ok) {
      throw new Error(`Twilio failed: ${response.status}`);
    }
  }
}

class Msg91SmsProvider implements OtpDeliveryProvider {
  name = 'msg91';
  constructor(private readonly authKey: string, private readonly senderId: string) {}
  async send(destination: string, code: string): Promise<void> {
    const mobile = destination.replace(/^\+/, '');
    const response = await fetch('https://control.msg91.com/api/v5/flow/', {
      method: 'POST',
      headers: {
        authkey: this.authKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        template_id: 'otp',
        sender: this.senderId,
        short_url: '0',
        recipients: [{ mobiles: mobile, var1: code }],
      }),
    });
    if (!response.ok) {
      throw new Error(`MSG91 failed: ${response.status}`);
    }
  }
}

export function createEmailOtpProvider(env: AppEnv): OtpDeliveryProvider {
  if (env.OTP_MODE === 'development') return new DevelopmentOtpProvider();
  if (!env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is required when OTP_MODE=production');
  }
  return new ResendEmailProvider(env.RESEND_API_KEY, env.RESEND_FROM ?? 'GameStation <noreply@gamestation.local>');
}

export function createSmsOtpProvider(env: AppEnv): OtpDeliveryProvider {
  if (env.OTP_MODE === 'development') return new DevelopmentOtpProvider();
  if (env.SMS_PROVIDER === 'twilio') {
    if (!env.TWILIO_ACCOUNT_SID || !env.TWILIO_AUTH_TOKEN || !env.TWILIO_PHONE_NUMBER) {
      throw new Error('Twilio credentials are required');
    }
    return new TwilioSmsProvider(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN, env.TWILIO_PHONE_NUMBER);
  }
  if (env.SMS_PROVIDER === 'msg91') {
    if (!env.MSG91_AUTH_KEY) throw new Error('MSG91_AUTH_KEY is required');
    return new Msg91SmsProvider(env.MSG91_AUTH_KEY, env.MSG91_SENDER_ID ?? 'GAMESN');
  }
  throw new Error('SMS_PROVIDER must be msg91 or twilio in production');
}

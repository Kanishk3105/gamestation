import { prisma } from '../prisma.js';
import type { AppEnv } from '../env.js';

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

export interface ChargeInput {
  orderId: string;
  amount: number;
  currency?: string;
}

export interface ChargeResult {
  provider: string;
  status: PaymentStatus;
  providerRef: string;
  isTest: boolean;
  message: string;
}

export interface PaymentProvider {
  name: string;
  charge(input: ChargeInput): Promise<ChargeResult>;
}

class DevelopmentPaymentProvider implements PaymentProvider {
  name = 'development';
  async charge(input: ChargeInput): Promise<ChargeResult> {
    return {
      provider: this.name,
      status: 'PAID',
      providerRef: `dev_${input.orderId}`,
      isTest: true,
      message: 'Test payment recorded by the development provider. No live charges were made.',
    };
  }
}

class RazorpayPaymentProvider implements PaymentProvider {
  name = 'razorpay';
  constructor(private readonly keyId: string, private readonly keySecret: string) {}
  async charge(_input: ChargeInput): Promise<ChargeResult> {
    throw Object.assign(new Error('Razorpay capture is not configured for this assignment build'), {
      statusCode: 501,
      code: 'PAYMENT_PROVIDER_UNAVAILABLE',
    });
  }
}

export function createPaymentProvider(env: AppEnv): PaymentProvider {
  if (env.PAYMENT_PROVIDER === 'razorpay') {
    if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
      throw new Error('RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are required');
    }
    return new RazorpayPaymentProvider(env.RAZORPAY_KEY_ID, env.RAZORPAY_KEY_SECRET);
  }
  return new DevelopmentPaymentProvider();
}

export async function recordPayment(orderId: string, result: ChargeResult, amount: number) {
  return prisma.payment.upsert({
    where: { orderId },
    update: {
      status: result.status,
      provider: result.provider,
      providerRef: result.providerRef,
      isTest: result.isTest,
      amount,
    },
    create: {
      orderId,
      status: result.status,
      provider: result.provider,
      providerRef: result.providerRef,
      isTest: result.isTest,
      amount,
    },
  });
}

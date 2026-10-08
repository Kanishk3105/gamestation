import { describe, expect, it } from 'vitest';
import { createPaymentProvider } from '../server/services/payment';

describe('development payment provider', () => {
  it('records a test charge without claiming a live gateway', async () => {
    const provider = createPaymentProvider({
      PAYMENT_PROVIDER: 'development',
    } as never);
    const result = await provider.charge({ orderId: 'ord_1', amount: 1299 });
    expect(result.isTest).toBe(true);
    expect(result.status).toBe('PAID');
    expect(result.message).toMatch(/No live charges/i);
  });
});

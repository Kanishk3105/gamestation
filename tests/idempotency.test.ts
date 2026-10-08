import { describe, expect, it } from 'vitest';

describe('order idempotency key contract', () => {
  it('treats identical keys as a single order identity', () => {
    const seen = new Map<string, string>();
    const place = (key: string) => {
      if (seen.has(key)) return { id: seen.get(key)!, reused: true };
      seen.set(key, 'order_1');
      return { id: 'order_1', reused: false };
    };
    const first = place('checkout-abc');
    const second = place('checkout-abc');
    expect(first.reused).toBe(false);
    expect(second.reused).toBe(true);
    expect(first.id).toBe(second.id);
  });
});

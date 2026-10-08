import { describe, expect, it } from 'vitest';
import {
  PricingError,
  calculateRental,
  calculateRentalDays,
  formatDisplayDate,
  sumQuotes,
} from '../shared/pricing/calculateRental';

const future = (daysFromToday: number) => {
  const date = new Date(Date.UTC(2030, 0, 10 + daysFromToday));
  return date.toISOString().slice(0, 10);
};

describe('rental duration', () => {
  it('counts calendar days between delivery and pickup', () => {
    expect(calculateRentalDays('2030-01-10', '2030-01-13')).toBe(3);
  });

  it('rejects pickup before delivery', () => {
    expect(() => calculateRentalDays('2030-01-13', '2030-01-10')).toThrow(PricingError);
  });

  it('rejects zero-day rentals', () => {
    expect(() => calculateRentalDays('2030-01-10', '2030-01-10')).toThrow(/1 day/);
  });
});

describe('calculateRental', () => {
  it('uses daily rate × days × quantity', () => {
    const quote = calculateRental({
      dailyRate: 200,
      deliveryDate: future(0),
      pickupDate: future(3),
      quantity: 2,
      now: new Date('2030-01-10T00:00:00.000Z'),
    });
    expect(quote.rentalDays).toBe(3);
    expect(quote.subtotal).toBe(1200);
    expect(quote.deliveryFee).toBe(99);
    expect(quote.total).toBe(1299);
  });

  it('waives delivery fee at the subtotal threshold', () => {
    const quote = calculateRental({
      dailyRate: 440,
      deliveryDate: future(0),
      pickupDate: future(4),
      quantity: 1,
      now: new Date('2030-01-10T00:00:00.000Z'),
    });
    expect(quote.subtotal).toBe(1760);
    expect(quote.deliveryFee).toBe(0);
    expect(quote.total).toBe(1760);
  });

  it('blocks out of stock products', () => {
    expect(() =>
      calculateRental({
        dailyRate: 260,
        deliveryDate: future(0),
        pickupDate: future(2),
        quantity: 1,
        outOfStock: true,
        now: new Date('2030-01-10T00:00:00.000Z'),
      }),
    ).toThrow(/unavailable/i);
  });

  it('rejects invalid quantity', () => {
    expect(() =>
      calculateRental({
        dailyRate: 200,
        deliveryDate: future(0),
        pickupDate: future(2),
        quantity: 0,
        now: new Date('2030-01-10T00:00:00.000Z'),
      }),
    ).toThrow(PricingError);
  });

  it('formats display dates', () => {
    expect(formatDisplayDate('2030-01-10')).toBe('10 Jan 2030');
  });

  it('sums cart quotes with a single delivery fee', () => {
    const a = calculateRental({
      dailyRate: 160,
      deliveryDate: future(0),
      pickupDate: future(2),
      quantity: 1,
      now: new Date('2030-01-10T00:00:00.000Z'),
    });
    const totals = sumQuotes([a, a]);
    expect(totals.subtotal).toBe(640);
    expect(totals.deliveryFee).toBe(99);
  });
});

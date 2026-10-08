export const MIN_RENTAL_DAYS = 1;
export const MAX_RENTAL_DAYS = 30;
export const MIN_QUANTITY = 1;
export const MAX_QUANTITY = 4;
export const DELIVERY_FEE = 99;
export const DELIVERY_FEE_WAIVER_SUBTOTAL = 1500;
export const GST_RATE = 0;

export type PricingErrorCode =
  | 'INVALID_DATE'
  | 'DELIVERY_IN_PAST'
  | 'PICKUP_BEFORE_DELIVERY'
  | 'ZERO_DAY_RENTAL'
  | 'DURATION_TOO_LONG'
  | 'INVALID_QUANTITY'
  | 'OUT_OF_STOCK'
  | 'PRODUCT_UNAVAILABLE';

export class PricingError extends Error {
  constructor(
    public readonly code: PricingErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'PricingError';
  }
}

export interface RentalInput {
  dailyRate: number;
  deliveryDate: Date | string;
  pickupDate: Date | string;
  quantity: number;
  outOfStock?: boolean;
  now?: Date;
}

export interface RentalQuote {
  dailyRate: number;
  rentalDays: number;
  quantity: number;
  deliveryDate: string;
  pickupDate: string;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  tax: number;
  total: number;
  currency: 'INR';
}

function parseDate(value: Date | string, field: string): Date {
  const date = value instanceof Date ? new Date(value.getTime()) : new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new PricingError('INVALID_DATE', `${field} is not a valid date`);
  }
  return date;
}

export function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export function toIsoDate(date: Date): string {
  return startOfUtcDay(date).toISOString().slice(0, 10);
}

export function formatDisplayDate(date: Date | string): string {
  const d = parseDate(date, 'date');
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(startOfUtcDay(d));
}

export function calculateRentalDays(deliveryDate: Date | string, pickupDate: Date | string): number {
  const delivery = startOfUtcDay(parseDate(deliveryDate, 'deliveryDate'));
  const pickup = startOfUtcDay(parseDate(pickupDate, 'pickupDate'));
  const days = Math.round((pickup.getTime() - delivery.getTime()) / 86_400_000);
  if (days < 0) {
    throw new PricingError('PICKUP_BEFORE_DELIVERY', 'Pickup date must be after delivery date');
  }
  if (days === 0) {
    throw new PricingError('ZERO_DAY_RENTAL', 'Rental duration must be at least 1 day');
  }
  if (days > MAX_RENTAL_DAYS) {
    throw new PricingError('DURATION_TOO_LONG', `Rental cannot exceed ${MAX_RENTAL_DAYS} days`);
  }
  return days;
}

export function validateRentalWindow(input: {
  deliveryDate: Date | string;
  pickupDate: Date | string;
  quantity: number;
  outOfStock?: boolean;
  now?: Date;
}): { delivery: Date; pickup: Date; rentalDays: number; quantity: number } {
  if (!Number.isInteger(input.quantity) || input.quantity < MIN_QUANTITY || input.quantity > MAX_QUANTITY) {
    throw new PricingError(
      'INVALID_QUANTITY',
      `Quantity must be an integer between ${MIN_QUANTITY} and ${MAX_QUANTITY}`,
    );
  }

  if (input.outOfStock) {
    throw new PricingError('OUT_OF_STOCK', 'This package is currently unavailable');
  }

  const delivery = startOfUtcDay(parseDate(input.deliveryDate, 'deliveryDate'));
  const pickup = startOfUtcDay(parseDate(input.pickupDate, 'pickupDate'));
  const today = startOfUtcDay(input.now ?? new Date());

  if (delivery.getTime() < today.getTime()) {
    throw new PricingError('DELIVERY_IN_PAST', 'Delivery date cannot be in the past');
  }

  const rentalDays = calculateRentalDays(delivery, pickup);
  return { delivery, pickup, rentalDays, quantity: input.quantity };
}

function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function calculateRental(input: RentalInput): RentalQuote {
  if (!Number.isFinite(input.dailyRate) || input.dailyRate <= 0) {
    throw new PricingError('PRODUCT_UNAVAILABLE', 'Product price is invalid');
  }

  const { delivery, pickup, rentalDays, quantity } = validateRentalWindow(input);
  const subtotal = roundMoney(input.dailyRate * rentalDays * quantity);
  const deliveryFee = subtotal >= DELIVERY_FEE_WAIVER_SUBTOTAL ? 0 : DELIVERY_FEE;
  const discount = 0;
  const taxable = roundMoney(subtotal + deliveryFee - discount);
  const tax = roundMoney(taxable * GST_RATE);
  const total = roundMoney(taxable + tax);

  return {
    dailyRate: roundMoney(input.dailyRate),
    rentalDays,
    quantity,
    deliveryDate: toIsoDate(delivery),
    pickupDate: toIsoDate(pickup),
    subtotal,
    deliveryFee,
    discount,
    tax,
    total,
    currency: 'INR',
  };
}

export function sumQuotes(quotes: RentalQuote[]): Omit<RentalQuote, 'dailyRate' | 'rentalDays' | 'quantity' | 'deliveryDate' | 'pickupDate'> & {
  itemCount: number;
} {
  const subtotal = roundMoney(quotes.reduce((sum, q) => sum + q.subtotal, 0));
  const deliveryFee = quotes.length === 0 ? 0 : subtotal >= DELIVERY_FEE_WAIVER_SUBTOTAL ? 0 : DELIVERY_FEE;
  const discount = roundMoney(quotes.reduce((sum, q) => sum + q.discount, 0));
  const tax = roundMoney((subtotal + deliveryFee - discount) * GST_RATE);
  const total = roundMoney(subtotal + deliveryFee - discount + tax);
  return {
    itemCount: quotes.length,
    subtotal,
    deliveryFee,
    discount,
    tax,
    total,
    currency: 'INR',
  };
}

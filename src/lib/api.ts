export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(path, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
    ...init,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(
      response.status,
      payload?.error?.code ?? 'REQUEST_FAILED',
      payload?.error?.message ?? 'Request failed',
      payload?.error?.details,
    );
  }
  return payload as T;
}

export const api = {
  health: () => request<{ status: string }>('/api/health'),
  products: () => request<{ products: import('../types/product').Product[] }>('/api/products'),
  product: (id: number) => request<{ product: import('../types/product').Product }>(`/api/products/${id}`),
  quote: (body: { productId: number; quantity: number; deliveryDate: string; pickupDate: string }) =>
    request<{ quote: import('../../shared/pricing/calculateRental').RentalQuote; product: import('../types/product').Product }>(
      '/api/rentals/quote',
      { method: 'POST', body: JSON.stringify(body) },
    ),
  cart: () => request<CartResponse>('/api/cart'),
  addToCart: (body: { productId: number; quantity: number; deliveryDate: string; pickupDate: string }) =>
    request<CartResponse>('/api/cart', { method: 'POST', body: JSON.stringify(body) }),
  updateCartItem: (id: string, body: Record<string, unknown>) =>
    request<CartResponse>(`/api/cart/items/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  removeCartItem: (id: string) => request<CartResponse>(`/api/cart/items/${id}`, { method: 'DELETE' }),
  wishlist: () => request<{ items: Array<{ id: string; productId: number; product: import('../types/product').Product }> }>('/api/wishlist'),
  addWishlist: (productId: number) => request('/api/wishlist', { method: 'POST', body: JSON.stringify({ productId }) }),
  removeWishlist: (productId: number) => request(`/api/wishlist/${productId}`, { method: 'DELETE' }),
  me: () => request<{ user: AuthUser | null }>('/api/auth/me'),
  requestEmailOtp: (email: string) =>
    request<{ challengeId: string; expiresAt: string; cooldownMs: number; provider: string }>(
      '/api/auth/request-email-otp',
      { method: 'POST', body: JSON.stringify({ email }) },
    ),
  requestPhoneOtp: (phone: string) =>
    request<{ challengeId: string; expiresAt: string; cooldownMs: number; provider: string }>(
      '/api/auth/request-phone-otp',
      { method: 'POST', body: JSON.stringify({ phone }) },
    ),
  verifyEmailOtp: (challengeId: string, code: string) =>
    request<{ user: AuthUser }>('/api/auth/verify-email-otp', { method: 'POST', body: JSON.stringify({ challengeId, code }) }),
  verifyPhoneOtp: (challengeId: string, code: string) =>
    request<{ user: AuthUser }>('/api/auth/verify-phone-otp', { method: 'POST', body: JSON.stringify({ challengeId, code }) }),
  logout: () => request('/api/auth/logout', { method: 'POST' }),
  addresses: () => request<{ addresses: Address[] }>('/api/addresses'),
  createAddress: (body: Omit<Address, 'id'>) =>
    request<{ address: Address }>('/api/addresses', { method: 'POST', body: JSON.stringify(body) }),
  orders: () => request<{ orders: Order[] }>('/api/orders'),
  order: (id: string) => request<{ order: Order }>(`/api/orders/${id}`),
  placeOrder: (body: { addressId: string; idempotencyKey: string; confirmTestPayment?: boolean }) =>
    request<{ order: Order; payment?: { message: string; isTest: boolean; disclaimer?: string }; reused?: boolean }>(
      '/api/orders',
      {
        method: 'POST',
        headers: { 'Idempotency-Key': body.idempotencyKey },
        body: JSON.stringify(body),
      },
    ),
};

export interface AuthUser {
  id: string;
  email: string | null;
  phone: string | null;
  createdAt: string;
}

export interface Address {
  id: string;
  fullName: string;
  phone: string;
  line1: string;
  house: string;
  city: string;
  state: string;
  pincode: string;
}

export interface CartLine {
  id: string;
  productId: number;
  name: string;
  image: string;
  quantity: number;
  dailyRate: number;
  rentalDays: number;
  deliveryDate: string;
  pickupDate: string;
  subtotal: number;
  total: number;
}

export interface CartResponse {
  id: string;
  items: CartLine[];
  totals: {
    subtotal: number;
    deliveryFee: number;
    discount: number;
    tax: number;
    total: number;
    itemCount: number;
  };
}

export interface Order {
  id: string;
  publicRef: string;
  status: string;
  paymentStatus: string;
  subtotal: number;
  fees: number;
  discount: number;
  tax: number;
  total: number;
  deliveryDate: string;
  pickupDate: string;
  createdAt: string;
  address: Omit<Address, 'id'>;
  items: Array<{
    id: string;
    productId: number;
    name: string;
    image: string;
    dailyRate: number;
    quantity: number;
    rentalDays: number;
    lineTotal: number;
  }>;
  payment: { provider: string; isTest: boolean; status: string; providerRef: string | null } | null;
}

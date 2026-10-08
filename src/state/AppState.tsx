import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, type Address, type AuthUser, type CartResponse } from '../lib/api';
import type { Product } from '../types/product';

interface AppStateValue {
  user: AuthUser | null;
  cart: CartResponse | null;
  wishlistIds: Set<number>;
  addresses: Address[];
  apiAvailable: boolean;
  cartOpen: boolean;
  authOpen: boolean;
  setCartOpen: (open: boolean) => void;
  setAuthOpen: (open: boolean) => void;
  refresh: () => Promise<void>;
  toggleWishlist: (product: Product) => Promise<void>;
}

const AppStateContext = createContext<AppStateValue | null>(null);

const emptyCart: CartResponse = {
  id: 'local',
  items: [],
  totals: { subtotal: 0, deliveryFee: 0, discount: 0, tax: 0, total: 0, itemCount: 0 },
};

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [cart, setCart] = useState<CartResponse | null>(emptyCart);
  const [wishlistIds, setWishlistIds] = useState<Set<number>>(new Set());
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [apiAvailable, setApiAvailable] = useState(true);
  const [cartOpen, setCartOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const [me, cartRes, wish] = await Promise.all([api.me(), api.cart(), api.wishlist()]);
      setUser(me.user);
      setCart(cartRes);
      setWishlistIds(new Set(wish.items.map((item) => item.productId)));
      setApiAvailable(true);
      if (me.user) {
        const list = await api.addresses();
        setAddresses(list.addresses);
      } else {
        setAddresses([]);
      }
    } catch {
      setApiAvailable(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const toggleWishlist = useCallback(async (product: Product) => {
    const has = wishlistIds.has(product.id);
    if (has) {
      await api.removeWishlist(product.id);
      setWishlistIds((prev) => {
        const next = new Set(prev);
        next.delete(product.id);
        return next;
      });
    } else {
      await api.addWishlist(product.id);
      setWishlistIds((prev) => new Set(prev).add(product.id));
    }
  }, [wishlistIds]);

  const value = useMemo(
    () => ({
      user,
      cart,
      wishlistIds,
      addresses,
      apiAvailable,
      cartOpen,
      authOpen,
      setCartOpen,
      setAuthOpen,
      refresh,
      toggleWishlist,
    }),
    [user, cart, wishlistIds, addresses, apiAvailable, cartOpen, authOpen, refresh, toggleWishlist],
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider');
  return ctx;
}

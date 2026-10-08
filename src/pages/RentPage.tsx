import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, ApiError } from '../lib/api';
import { products as localProducts } from '../data/products';
import { calculateRental, formatDisplayDate } from '../../shared/pricing/calculateRental';
import { useAppState } from '../state/AppState';
import type { Product } from '../types/product';

function isoOffset(days: number) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function RentPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { refresh, setCartOpen, toggleWishlist, wishlistIds } = useAppState();
  const [product, setProduct] = useState<Product | null>(null);
  const [deliveryDate, setDeliveryDate] = useState(isoOffset(1));
  const [pickupDate, setPickupDate] = useState(isoOffset(4));
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [wishlistBusy, setWishlistBusy] = useState(false);

  useEffect(() => {
    const id = Number(productId);
    const local = localProducts.find((item) => item.id === id) ?? null;
    setProduct(local);
    api.product(id).then((res) => setProduct(res.product)).catch(() => undefined);
  }, [productId]);

  const quote = useMemo(() => {
    if (!product) return null;
    try {
      return calculateRental({
        dailyRate: product.per_day_rent,
        deliveryDate,
        pickupDate,
        quantity,
        outOfStock: product.out_of_stock,
      });
    } catch (err) {
      return err instanceof Error ? err.message : 'Invalid rental';
    }
  }, [product, deliveryDate, pickupDate, quantity]);

  if (!product) return <main className="gs-page"><p>Loading package…</p></main>;

  const priced = typeof quote === 'object' && quote ? quote : null;

  return (
    <main className="gs-page gs-rent">
      <Link to="/" className="gs-text-btn">← Catalog</Link>
      <div className="gs-rent-grid">
        <figure className="gs-rent-visual">
          <img src={product.image} alt={product.name} />
        </figure>
        <section>
          {product.tag && <span className="gs-tag">{product.tag}</span>}
          <h1>{product.name}</h1>
          <p className="gs-muted">
            {product.rating > 0 ? `★ ${product.rating}` : 'New arrival'} · {product.booked_count.toLocaleString()} bookings
          </p>
          <p className="gs-price">₹{product.per_day_rent} <span>/ day</span></p>
          {product.out_of_stock && <p className="gs-error">This package is out of stock and cannot be booked.</p>}

          <div className="gs-rent-form">
            <label>
              Delivery
              <input type="date" value={deliveryDate} min={isoOffset(0)} onChange={(e) => setDeliveryDate(e.target.value)} />
            </label>
            <label>
              Return
              <input type="date" value={pickupDate} min={deliveryDate} onChange={(e) => setPickupDate(e.target.value)} />
            </label>
            <label>
              Quantity
              <input type="number" min={1} max={4} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
            </label>
          </div>

          {priced ? (
            <dl className="gs-quote">
              <div><dt>Delivery</dt><dd>{formatDisplayDate(priced.deliveryDate)}</dd></div>
              <div><dt>Return</dt><dd>{formatDisplayDate(priced.pickupDate)}</dd></div>
              <div><dt>Duration</dt><dd>{priced.rentalDays} days</dd></div>
              <div><dt>Daily rate</dt><dd>₹{priced.dailyRate}</dd></div>
              <div><dt>Quantity</dt><dd>{priced.quantity}</dd></div>
              <div><dt>Subtotal</dt><dd>₹{priced.subtotal}</dd></div>
              <div><dt>Delivery fee</dt><dd>₹{priced.deliveryFee}</dd></div>
              <div className="gs-total"><dt>Total</dt><dd>₹{priced.total}</dd></div>
            </dl>
          ) : (
            <p className="gs-error">{String(quote)}</p>
          )}

          {error && <p className="gs-error" role="alert">{error}</p>}

          <div className="gs-hero-actions">
            <button
              className="gs-btn gs-btn-primary"
              disabled={busy || product.out_of_stock || !priced}
              onClick={async () => {
                setBusy(true);
                setError('');
                try {
                  await api.addToCart({
                    productId: product.id,
                    quantity,
                    deliveryDate,
                    pickupDate,
                  });
                  await refresh();
                  setCartOpen(true);
                  navigate('/');
                } catch (err) {
                  setError(err instanceof ApiError ? err.message : 'Could not add to cart');
                } finally {
                  setBusy(false);
                }
              }}
            >
              Add to bag
            </button>
            <button
              className="gs-btn gs-btn-ghost"
              disabled={wishlistBusy}
              onClick={async () => {
                try {
                  setWishlistBusy(true);
                  await toggleWishlist(product);
                } finally {
                  setWishlistBusy(false);
                }
              }}
            >
              {wishlistIds.has(product.id) ? 'Wishlisted' : 'Add to wishlist'}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}

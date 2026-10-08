import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, ApiError } from '../lib/api';
import { useAppState } from '../state/AppState';
import { formatDisplayDate } from '../../shared/pricing/calculateRental';

const emptyAddress = {
  fullName: '',
  phone: '',
  line1: '',
  house: '',
  city: '',
  state: '',
  pincode: '',
};

export function CheckoutPage() {
  const { user, cart, addresses, refresh, setAuthOpen, setCartOpen } = useAppState();
  const navigate = useNavigate();
  const [step, setStep] = useState<'review' | 'address' | 'pay'>('review');
  const [addressId, setAddressId] = useState('');
  const [form, setForm] = useState(emptyAddress);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const idempotencyKey = useMemo(() => crypto.randomUUID(), []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!user) setAuthOpen(true);
  }, [user, setAuthOpen]);

  if (!cart || cart.items.length === 0) {
    return (
      <main className="gs-page">
        <h1>Checkout</h1>
        <p>Your bag is empty.</p>
        <button className="gs-btn gs-btn-primary" onClick={() => setCartOpen(true)}>Open bag</button>
      </main>
    );
  }

  return (
    <main className="gs-page gs-checkout">
      <h1>Checkout</h1>
      <ol className="gs-steps">
        <li className={step === 'review' ? 'is-on' : ''}>Review</li>
        <li className={step === 'address' ? 'is-on' : ''}>Address</li>
        <li className={step === 'pay' ? 'is-on' : ''}>Test payment</li>
      </ol>

      {step === 'review' && (
        <section className="gs-card">
          {cart.items.map((item) => (
            <article key={item.id} className="gs-review-line">
              <img src={item.image} alt="" />
              <div>
                <strong>{item.name}</strong>
                <p>{formatDisplayDate(item.deliveryDate)} → {formatDisplayDate(item.pickupDate)}</p>
                <p>{item.rentalDays} days · qty {item.quantity}</p>
              </div>
              <span>₹{item.subtotal}</span>
            </article>
          ))}
          <p className="gs-total">Payable ₹{cart.totals.total}</p>
          <button className="gs-btn gs-btn-primary" disabled={!user} onClick={() => setStep('address')}>
            Continue
          </button>
        </section>
      )}

      {step === 'address' && (
        <section className="gs-card">
          {addresses.length > 0 && (
            <div className="gs-address-list">
              {addresses.map((address) => (
                <label key={address.id} className="gs-radio-card">
                  <input type="radio" name="address" checked={addressId === address.id} onChange={() => setAddressId(address.id)} />
                  <span>
                    <strong>{address.fullName}</strong>
                    <br />{address.house}, {address.line1}, {address.city}, {address.state} {address.pincode}
                  </span>
                </label>
              ))}
            </div>
          )}
          <h2>New address</h2>
          {Object.entries({ fullName: 'Full name', phone: 'Phone', line1: 'Address line', house: 'House / apartment', city: 'City', state: 'State', pincode: 'Pincode' }).map(([key, label]) => (
            <label key={key}>
              {label}
              <input
                value={form[key as keyof typeof form]}
                onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
              />
            </label>
          ))}
          {error && <p className="gs-error">{error}</p>}
          <div className="gs-hero-actions">
            <button
              className="gs-btn gs-btn-ghost"
              onClick={async () => {
                setBusy(true);
                setError('');
                try {
                  const created = await api.createAddress(form);
                  await refresh();
                  setAddressId(created.address.id);
                } catch (err) {
                  setError(err instanceof ApiError ? err.message : 'Could not save address');
                } finally {
                  setBusy(false);
                }
              }}
            >
              Save address
            </button>
            <button className="gs-btn gs-btn-primary" disabled={!addressId} onClick={() => setStep('pay')}>
              Review payment
            </button>
          </div>
        </section>
      )}

      {step === 'pay' && (
        <section className="gs-card">
          <h2>Development payment</h2>
          <p className="gs-muted">
            This assignment uses a test payment provider. Confirming will record a development payment — it will not charge a live gateway.
          </p>
          <p className="gs-total">Amount ₹{cart.totals.total}</p>
          {error && <p className="gs-error">{error}</p>}
          <button
            className="gs-btn gs-btn-primary"
            disabled={busy || !addressId}
            onClick={async () => {
              setBusy(true);
              setError('');
              try {
                const result = await api.placeOrder({ addressId, idempotencyKey, confirmTestPayment: true });
                await refresh();
                navigate(`/orders/${result.order.id}/success`, { state: result });
              } catch (err) {
                setError(err instanceof ApiError ? err.message : 'Order could not be created');
              } finally {
                setBusy(false);
              }
            }}
          >
            Confirm test payment & place order
          </button>
        </section>
      )}
    </main>
  );
}

import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { formatDisplayDate } from '../../shared/pricing/calculateRental';
import { useAppState } from '../state/AppState';
import { useIsMobile } from '../hooks/useMediaQuery';

export function CartDrawer() {
  const { cart, cartOpen, setCartOpen, refresh } = useAppState();
  const isMobile = useIsMobile();
  const items = cart?.items ?? [];

  return (
    <AnimatePresence>
      {cartOpen && (
        <>
          <motion.button
            className="gs-overlay"
            aria-label="Close cart"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCartOpen(false)}
          />
          <motion.aside
            className={isMobile ? 'gs-cart gs-cart-sheet' : 'gs-cart gs-cart-drawer'}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-title"
            initial={isMobile ? { y: '100%' } : { x: '100%' }}
            animate={isMobile ? { y: 0 } : { x: 0 }}
            exit={isMobile ? { y: '100%' } : { x: '100%' }}
            transition={{ type: 'spring', stiffness: 280, damping: 30 }}
          >
            <header className="gs-cart-head">
              <h2 id="cart-title">Rental bag</h2>
              <button className="gs-icon-btn" onClick={() => setCartOpen(false)} aria-label="Close cart">×</button>
            </header>
            {items.length === 0 ? (
              <div className="gs-empty-block">
                <p>Your bag is empty.</p>
                <p className="gs-muted">Configure a package and the dates will stay with the item.</p>
              </div>
            ) : (
              <ul className="gs-cart-list">
                {items.map((item) => (
                  <motion.li layout key={item.id} className="gs-cart-item">
                    <img src={item.image} alt="" />
                    <div>
                      <strong>{item.name}</strong>
                      <p>
                        {formatDisplayDate(item.deliveryDate)} → {formatDisplayDate(item.pickupDate)} · {item.rentalDays} days
                      </p>
                      <div className="gs-qty">
                        <button
                          onClick={async () => {
                            if (item.quantity <= 1) {
                              await api.removeCartItem(item.id);
                            } else {
                              await api.updateCartItem(item.id, { quantity: item.quantity - 1 });
                            }
                            await refresh();
                          }}
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          onClick={async () => {
                            await api.updateCartItem(item.id, { quantity: item.quantity + 1 });
                            await refresh();
                          }}
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="gs-cart-line">
                      <span>₹{item.subtotal}</span>
                      <button
                        className="gs-text-btn"
                        onClick={async () => {
                          await api.removeCartItem(item.id);
                          await refresh();
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </motion.li>
                ))}
              </ul>
            )}
            <footer className="gs-cart-foot">
              <div>
                <span>Subtotal</span>
                <strong>₹{cart?.totals.subtotal ?? 0}</strong>
              </div>
              <div>
                <span>Delivery</span>
                <strong>₹{cart?.totals.deliveryFee ?? 0}</strong>
              </div>
              <div className="gs-total">
                <span>Total</span>
                <strong>₹{cart?.totals.total ?? 0}</strong>
              </div>
              <Link
                to="/checkout"
                className="gs-btn gs-btn-primary"
                onClick={() => setCartOpen(false)}
                aria-disabled={items.length === 0}
              >
                Continue to checkout
              </Link>
            </footer>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

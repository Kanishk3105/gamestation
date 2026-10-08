import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, type Order } from '../lib/api';
import { formatDisplayDate } from '../../shared/pricing/calculateRental';
import { useAppState } from '../state/AppState';

export function OrdersPage() {
  const { user, setAuthOpen } = useAppState();
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      setAuthOpen(true);
      return;
    }
    api.orders().then((res) => setOrders(res.orders)).catch((err) => setError(err.message));
  }, [user, setAuthOpen]);

  return (
    <main className="gs-page">
      <h1>Orders</h1>
      {error && <p className="gs-error">{error}</p>}
      {orders.length === 0 && <p className="gs-muted">No rentals yet.</p>}
      <ul className="gs-order-list">
        {orders.map((order) => (
          <li key={order.id} className="gs-card">
            <Link to={`/orders/${order.id}`}>
              <strong>{order.publicRef}</strong>
              <p>{order.items[0]?.name}</p>
              <p>{formatDisplayDate(order.deliveryDate)} → {formatDisplayDate(order.pickupDate)}</p>
              <p>₹{order.total} · {order.status} · {order.paymentStatus}</p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}

import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, type Order } from '../lib/api';
import { formatDisplayDate } from '../../shared/pricing/calculateRental';

export function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    api.order(id).then((res) => setOrder(res.order)).catch((err) => setError(err.message));
  }, [id]);

  if (error) return <main className="gs-page"><p className="gs-error">{error}</p></main>;
  if (!order) return <main className="gs-page"><p>Loading order…</p></main>;

  return (
    <main className="gs-page">
      <Link to="/orders" className="gs-text-btn">← All orders</Link>
      <h1>{order.publicRef}</h1>
      <p>{order.status} · payment {order.paymentStatus}</p>
      {order.items.map((item) => (
        <article key={item.id} className="gs-review-line">
          <img src={item.image} alt="" />
          <div>
            <strong>{item.name}</strong>
            <p>Qty {item.quantity} · {item.rentalDays} days · ₹{item.dailyRate}/day</p>
          </div>
          <span>₹{item.lineTotal}</span>
        </article>
      ))}
      <p>Delivery {formatDisplayDate(order.deliveryDate)} · Return {formatDisplayDate(order.pickupDate)}</p>
      <p>{order.address.fullName}, {order.address.house}, {order.address.line1}, {order.address.city}</p>
      <p className="gs-total">Total ₹{order.total}</p>
    </main>
  );
}

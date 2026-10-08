import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api, type Order } from '../lib/api';
import { formatDisplayDate } from '../../shared/pricing/calculateRental';

export function OrderSuccessPage() {
  const { id } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState<Order | null>((location.state as { order?: Order } | null)?.order ?? null);

  useEffect(() => {
    if (!id) return;
    api.order(id).then((res) => setOrder(res.order)).catch(() => undefined);
  }, [id]);

  if (!order) return <main className="gs-page"><p>Loading confirmation…</p></main>;

  return (
    <main className="gs-page gs-success">
      <motion.div
        className="gs-success-mark"
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18 }}
      >
        ✓
      </motion.div>
      <motion.h1 initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>Rental booked</motion.h1>
      <p className="gs-muted">
        {order.payment?.isTest
          ? 'A development/test payment was recorded. No live payment gateway was charged.'
          : 'Payment recorded.'}
      </p>
      <section className="gs-card">
        <p><strong>{order.publicRef}</strong></p>
        <p>{order.items[0]?.name}</p>
        <p>Delivery {formatDisplayDate(order.deliveryDate)}</p>
        <p>Return {formatDisplayDate(order.pickupDate)}</p>
        <p>{order.items[0]?.rentalDays} days · ₹{order.total}</p>
        <p>{order.address.line1}, {order.address.city}</p>
        <p>Status {order.status}</p>
      </section>
      <div className="gs-hero-actions">
        <Link className="gs-btn gs-btn-primary" to={`/orders/${order.id}`}>View order</Link>
        <Link className="gs-btn gs-btn-ghost" to="/">Continue shopping</Link>
      </div>
    </main>
  );
}

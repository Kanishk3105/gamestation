import React from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import Footer from './components/Footer';
import Header from './components/Header';
import { AuthModal } from './components/AuthModal';
import { CartDrawer } from './components/CartDrawer';
import { HomePage } from './pages/HomePage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderDetailPage } from './pages/OrderDetailPage';
import { OrdersPage } from './pages/OrdersPage';
import { OrderSuccessPage } from './pages/OrderSuccessPage';
import { RentPage } from './pages/RentPage';

function App() {
  const navigate = useNavigate();

  const handleScrollToSection = (section: string) => {
    const target = section.toLowerCase();
    if (target === 'catalog' || target === 'trending' || target === 'new arrivals') {
      navigate('/');
      window.setTimeout(() => {
        const catalog = document.getElementById('catalog');
        catalog?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 120);
      return;
    }

    if (target === 'rent') {
      navigate('/');
      return;
    }

    navigate('/');
  };

  return (
    <div style={appStyles.root}>
      <div style={appStyles.bgGradient1} />
      <div style={appStyles.bgGradient2} />

      <Header
        onSearchClick={() => {
          navigate('/');
          window.setTimeout(() => {
            const catalog = document.getElementById('catalog');
            catalog?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            const input = document.querySelector<HTMLInputElement>('input[placeholder*="Search"]');
            input?.focus();
          }, 120);
        }}
        onScrollToSection={handleScrollToSection}
      />

      <main style={appStyles.content}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/rent/:productId" element={<RentPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/orders/:id" element={<OrderDetailPage />} />
          <Route path="/orders/:id/success" element={<OrderSuccessPage />} />
        </Routes>
      </main>

      <Footer />
      <AuthModal />
      <CartDrawer />
    </div>
  );
}

const appStyles: Record<string, React.CSSProperties> = {
  root: {
    position: 'relative',
    minHeight: '100vh',
    overflowX: 'hidden',
    background: '#0a0a0f',
  },
  bgGradient1: {
    position: 'fixed',
    inset: '0 auto auto 70%',
    width: '36rem',
    height: '36rem',
    background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, rgba(99,102,241,0.04) 20%, transparent 70%)',
    pointerEvents: 'none',
    filter: 'blur(24px)',
    zIndex: 0,
  },
  bgGradient2: {
    position: 'fixed',
    inset: 'auto auto 0 0',
    width: '32rem',
    height: '32rem',
    background: 'radial-gradient(circle, rgba(168,85,247,0.14) 0%, rgba(168,85,247,0.04) 20%, transparent 70%)',
    pointerEvents: 'none',
    filter: 'blur(30px)',
    zIndex: 0,
  },
  content: {
    position: 'relative',
    zIndex: 1,
  },
};

export default App;

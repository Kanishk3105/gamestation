import React, { useEffect, useRef, CSSProperties } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Product } from '../types/product';
import { usePrefersReducedMotion, useIsMobile } from '../hooks/useMediaQuery';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
}

const styles: Record<string, CSSProperties> = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 200,
    padding: '20px',
    boxSizing: 'border-box',
  },
  modal: {
    position: 'relative',
    backgroundColor: 'rgba(18, 18, 26, 0.96)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '24px',
    maxWidth: '920px',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
    display: 'flex',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 40px rgba(99, 102, 241, 0.15)',
    boxSizing: 'border-box',
  },
  modalMobile: {
    flexDirection: 'column',
    maxHeight: '85vh',
    borderRadius: '20px',
  },
  closeBtn: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    color: '#ffffff',
    fontSize: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    zIndex: 10,
    transition: 'all 0.2s ease',
  },
  imageSection: {
    flex: '1 1 45%',
    minWidth: '280px',
    background: 'radial-gradient(circle at center, rgba(99, 102, 241, 0.12) 0%, rgba(10, 10, 15, 0.8) 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '32px',
    boxSizing: 'border-box',
    borderRight: '1px solid rgba(255, 255, 255, 0.06)',
  },
  imageSectionMobile: {
    borderRight: 'none',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
    padding: '24px',
  },
  image: {
    maxWidth: '100%',
    maxHeight: '340px',
    objectFit: 'contain',
    filter: 'drop-shadow(0 15px 25px rgba(0,0,0,0.5))',
  },
  detailsSection: {
    flex: '1 1 55%',
    padding: '36px',
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box',
  },
  detailsSectionMobile: {
    padding: '24px',
  },
  tag: {
    display: 'inline-block',
    alignSelf: 'flex-start',
    padding: '4px 12px',
    borderRadius: '100px',
    fontSize: '12px',
    fontWeight: 600,
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
    marginBottom: '12px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 700,
    fontFamily: "'Space Grotesk', sans-serif",
    color: '#ffffff',
    margin: '0 0 12px 0',
    lineHeight: 1.3,
  },
  ratingRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: '18px',
  },
  stars: {
    color: '#fbbf24',
    letterSpacing: '2px',
    fontSize: '15px',
  },
  priceRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '6px',
    marginBottom: '16px',
  },
  price: {
    fontSize: '32px',
    fontWeight: 800,
    fontFamily: "'Space Grotesk', sans-serif",
    background: 'linear-gradient(135deg, #6366f1, #a855f7)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  priceUnit: {
    fontSize: '15px',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  availabilityBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    fontWeight: 500,
    marginBottom: '24px',
  },
  statusDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
  },
  includesTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: 'rgba(255, 255, 255, 0.9)',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
    margin: '0 0 10px 0',
  },
  includesList: {
    listStyle: 'none',
    padding: 0,
    margin: '0 0 28px 0',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '8px',
  },
  includesItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    color: 'rgba(255, 255, 255, 0.75)',
  },
  checkIcon: {
    color: '#22c55e',
    fontWeight: 'bold',
  },
  ctaPrimary: {
    width: '100%',
    padding: '14px 24px',
    borderRadius: '14px',
    border: 'none',
    fontSize: '15px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    marginBottom: '10px',
  },
  ctaAvailable: {
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    color: '#ffffff',
    boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4)',
  },
  ctaUnavailable: {
    background: 'rgba(255, 255, 255, 0.08)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    color: 'rgba(255, 255, 255, 0.5)',
    cursor: 'not-allowed',
  },
  ctaSecondary: {
    width: '100%',
    padding: '12px 24px',
    borderRadius: '14px',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    backgroundColor: 'transparent',
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.2s ease',
  },
};

const ProductModal: React.FC<ProductModalProps> = ({ product, onClose }) => {
  const isMobile = useIsMobile();
  const prefersReducedMotion = usePrefersReducedMotion();
  const navigate = useNavigate();
  const modalRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && product) {
        onClose();
      }
    };

    if (product) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
      previousFocus.current = document.activeElement as HTMLElement;
      setTimeout(() => closeBtnRef.current?.focus(), 50);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
      if (previousFocus.current) {
        previousFocus.current.focus();
      }
    };
  }, [product, onClose]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getTagColor = (tag: string) => {
    switch (tag.toLowerCase()) {
      case 'new': return { bg: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4' };
      case 'trending': return { bg: 'rgba(249, 115, 22, 0.15)', color: '#f97316' };
      case 'vote to launch': return { bg: 'rgba(168, 85, 247, 0.15)', color: '#a855f7' };
      default: return { bg: 'rgba(255, 255, 255, 0.1)', color: '#ffffff' };
    }
  };

  const getIncludes = (name: string) => {
    const items = ['PS5 Ultra HD Console', 'Power & HDMI Cables'];
    const lower = name.toLowerCase();
    if (lower.includes('2 controller') || lower.includes('2 controllers')) {
      items.push('2x DualSense Wireless Controllers');
    } else if (lower.includes('4 controller') || lower.includes('4 controllers')) {
      items.push('4x DualSense Wireless Controllers');
    } else if (lower.includes('1 controller')) {
      items.push('1x DualSense Wireless Controller');
    }
    if (lower.includes('100+') || lower.includes('games')) {
      items.push('100+ Games Library Included');
    }
    if (lower.includes('ea play')) {
      items.push('EA Play Subscription');
    }
    if (lower.includes('racing wheel')) {
      items.push('Force Feedback Racing Wheel & Pedals');
    }
    if (lower.includes('portal')) {
      return ['PlayStation Portal Handheld', 'USB-C Charging Cable', 'Screen Protector'];
    }
    return items;
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const full = Math.floor(rating);
    for (let i = 0; i < 5; i++) {
      if (i < full) {
        stars.push('★');
      } else if (i === full && rating % 1 >= 0.5) {
        stars.push('★');
      } else {
        stars.push('☆');
      }
    }
    return stars.join('');
  };

  return (
    <AnimatePresence>
      {product && (
        <motion.div
          style={styles.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: prefersReducedMotion ? 0.05 : 0.2 }}
          onClick={handleOverlayClick}
        >
          <motion.div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            style={{
              ...styles.modal,
              ...(isMobile ? styles.modalMobile : {}),
            }}
            initial={{ opacity: 0, scale: 0.95, y: isMobile ? 30 : 0 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: isMobile ? 30 : 0 }}
            transition={{
              type: 'spring' as const,
              damping: 25,
              stiffness: 300,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              ref={closeBtnRef}
              style={styles.closeBtn}
              onClick={onClose}
              aria-label="Close modal"
            >
              ×
            </button>

            {/* Product Image Section */}
            <div
              style={{
                ...styles.imageSection,
                ...(isMobile ? styles.imageSectionMobile : {}),
              }}
            >
              <img
                src={product.image}
                alt={product.name}
                style={styles.image}
              />
            </div>

            {/* Details Section */}
            <div
              style={{
                ...styles.detailsSection,
                ...(isMobile ? styles.detailsSectionMobile : {}),
              }}
            >
              {product.tag && (
                <span
                  style={{
                    ...styles.tag,
                    backgroundColor: getTagColor(product.tag).bg,
                    color: getTagColor(product.tag).color,
                  }}
                >
                  {product.tag}
                </span>
              )}

              <h2 id="modal-title" style={styles.title}>
                {product.name}
              </h2>

              <div style={styles.ratingRow}>
                {product.rating > 0 ? (
                  <>
                    <span style={styles.stars}>{renderStars(product.rating)}</span>
                    <span style={{ fontWeight: 600 }}>{product.rating.toFixed(1)}</span>
                    <span>• {product.booked_count.toLocaleString()} bookings</span>
                  </>
                ) : (
                  <>
                    <span style={{ color: '#06b6d4', fontWeight: 600 }}>⭐ New Arrival</span>
                    <span>• {product.booked_count.toLocaleString()} bookings</span>
                  </>
                )}
              </div>

              <div style={styles.priceRow}>
                <span style={styles.price}>₹{product.per_day_rent}</span>
                <span style={styles.priceUnit}>/ day</span>
              </div>

              <div style={styles.availabilityBadge}>
                <span
                  style={{
                    ...styles.statusDot,
                    backgroundColor: product.out_of_stock ? '#ef4444' : '#22c55e',
                    boxShadow: product.out_of_stock
                      ? '0 0 8px rgba(239, 68, 68, 0.6)'
                      : '0 0 8px rgba(34, 197, 94, 0.6)',
                  }}
                />
                <span
                  style={{
                    color: product.out_of_stock ? '#ef4444' : '#22c55e',
                  }}
                >
                  {product.out_of_stock ? 'Currently Out of Stock' : 'Available for Immediate Delivery'}
                </span>
              </div>

              <div style={styles.includesTitle}>Rental Includes</div>
              <ul style={styles.includesList}>
                {getIncludes(product.name).map((item, idx) => (
                  <li key={idx} style={styles.includesItem}>
                    <span style={styles.checkIcon}>✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div style={{ marginTop: 'auto' }}>
                <button
                  style={{
                    ...styles.ctaPrimary,
                    ...(product.out_of_stock ? styles.ctaUnavailable : styles.ctaAvailable),
                  }}
                  disabled={product.out_of_stock}
                  aria-label={product.out_of_stock ? 'Product unavailable' : `Rent ${product.name} now`}
                  onClick={() => {
                    onClose();
                    navigate(`/rent/${product.id}`);
                  }}
                >
                  {product.out_of_stock ? 'Out of Stock' : 'Rent This Console'}
                </button>

                <button
                  style={styles.ctaSecondary}
                  onClick={() => navigate(`/rent/${product.id}`)}
                  aria-label="Add to wishlist"
                >
                  <span>♥</span> Add to Wishlist
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProductModal;

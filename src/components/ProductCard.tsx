import React, { useState, useRef, useCallback, MouseEvent } from 'react';
import { motion } from 'framer-motion';
import { Product } from '../types/product';
import { useIsMobile, usePrefersReducedMotion } from '../hooks/useMediaQuery';

interface ProductCardProps {
  product: Product;
  index: number;
  onSelect: (product: Product) => void;
}

function formatCount(count: number): string {
  if (count >= 10000) return '10K+';
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    perspective: '800px',
    cursor: 'pointer',
    width: '100%',
  },
  card: {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    borderRadius: '20px',
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    transition: 'all 0.3s ease',
  },
  imageContainer: {
    width: '100%',
    aspectRatio: '16 / 10',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    transition: 'transform 0.4s ease',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
    background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
    pointerEvents: 'none',
  },
  skeleton: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(90deg, #1f2022 0%, #2b2d31 50%, #1f2022 100%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite linear',
  },
  tag: {
    position: 'absolute',
    top: '12px',
    left: '12px',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 600,
    color: '#fff',
    zIndex: 2,
    backdropFilter: 'blur(4px)',
  },
  outOfStockOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  outOfStockBadge: {
    background: 'rgba(239, 68, 68, 0.8)',
    color: 'white',
    padding: '8px 16px',
    borderRadius: '20px',
    fontWeight: 'bold',
    fontSize: '14px',
    backdropFilter: 'blur(4px)',
  },
  content: {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    flex: 1,
  },
  title: {
    margin: 0,
    fontSize: '15px',
    fontWeight: 600,
    color: '#fff',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    lineHeight: '1.4',
  },
  statsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  priceRow: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '4px',
    marginTop: 'auto',
  },
  price: {
    fontSize: '18px',
    fontWeight: 700,
    color: '#a855f7', // Accent color
    margin: 0,
  },
  priceUnit: {
    fontSize: '13px',
    color: 'rgba(255, 255, 255, 0.5)',
    paddingBottom: '2px',
  },
  button: {
    width: '100%',
    padding: '12px',
    borderRadius: '12px',
    border: 'none',
    fontWeight: 600,
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    marginTop: '4px',
  },
  buttonAvailable: {
    background: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)',
    color: '#fff',
  },
  buttonUnavailable: {
    background: 'rgba(255, 255, 255, 0.1)',
    color: 'rgba(255, 255, 255, 0.4)',
    cursor: 'not-allowed',
  },
  highlight: {
    position: 'absolute',
    inset: 0,
    borderRadius: '20px',
    pointerEvents: 'none',
    zIndex: 3,
    transition: 'opacity 0.3s ease',
  },
};

const tagColors: Record<string, string> = {
  'Trending': 'rgba(249, 115, 22, 0.8)', // orange
  'New': 'rgba(6, 182, 212, 0.8)', // cyan
  'Vote to Launch': 'rgba(168, 85, 247, 0.8)', // purple
};

const ProductCard: React.FC<ProductCardProps> = ({ product, index, onSelect }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const isMobile = useIsMobile();
  const prefersReducedMotion = usePrefersReducedMotion();

  const handleMouseMove = useCallback((e: MouseEvent<HTMLDivElement>) => {
    if (isMobile || prefersReducedMotion || !cardRef.current) return;
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePosition({ x, y });

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = -((y - centerY) / centerY) * 6; // max ±6 deg
    const rotateY = ((x - centerX) / centerX) * 6;
    setRotate({ x: rotateX, y: rotateY });
  }, [isMobile, prefersReducedMotion]);

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotate({ x: 0, y: 0 });
  };

  const getTagColor = (tag: string) => {
    return tagColors[tag] || 'rgba(255, 255, 255, 0.2)';
  };

  const cardTransform = !isMobile && !prefersReducedMotion && isHovered 
    ? `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)` 
    : 'none';

  return (
    <motion.div
      initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: prefersReducedMotion ? 0 : index * 0.05 }}
      style={styles.container}
      role="article"
      aria-label={`Product card for ${product.name}`}
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={() => !product.out_of_stock && onSelect(product)}
        style={{
          ...styles.card,
          transform: cardTransform,
          backdropFilter: isHovered && !isMobile ? 'blur(10px)' : 'none',
          opacity: product.out_of_stock ? 0.7 : 1,
        }}
      >
        {/* Dynamic Highlight Gradient */}
        {!isMobile && !prefersReducedMotion && isHovered && (
          <div
            style={{
              ...styles.highlight,
              background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255,255,255,0.1) 0%, transparent 40%)`,
            }}
          />
        )}

        <div style={styles.imageContainer}>
          {!imgLoaded && !imgError && <div style={styles.skeleton} />}
          
          <img
            src={product.image}
            alt={product.name}
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
            style={{
              ...styles.image,
              transform: isHovered && !prefersReducedMotion ? 'scale(1.05)' : 'scale(1)',
              opacity: imgLoaded ? 1 : 0,
              display: imgError ? 'none' : 'block',
            }}
          />
          
          {imgError && (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.3)' }}>
              Image not available
            </div>
          )}

          <div style={styles.imageOverlay} />

          {product.tag && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + (index * 0.05) }}
              style={{
                ...styles.tag,
                backgroundColor: getTagColor(product.tag),
              }}
            >
              {product.tag}
            </motion.div>
          )}
        </div>

        {product.out_of_stock && (
          <div style={styles.outOfStockOverlay}>
            <div style={styles.outOfStockBadge}>Out of Stock</div>
          </div>
        )}

        <div style={styles.content}>
          <h3 style={styles.title} title={product.name}>
            {product.name}
          </h3>

          <div style={styles.statsRow}>
            <span>{product.rating > 0 ? `★ ${product.rating.toFixed(1)}` : '⭐ New'}</span>
            {product.booked_count && product.booked_count > 0 && (
              <span>• 🔥 {formatCount(product.booked_count)} booked</span>
            )}
          </div>

          <div style={styles.priceRow}>
            <p style={styles.price}>₹{product.per_day_rent}</p>
            <span style={styles.priceUnit}>/day</span>
          </div>

          <button
            style={{
              ...styles.button,
              ...(product.out_of_stock ? styles.buttonUnavailable : styles.buttonAvailable),
            }}
            disabled={product.out_of_stock}
            aria-label={product.out_of_stock ? "Unavailable" : `Rent ${product.name} now`}
            onClick={(e) => {
              e.stopPropagation();
              if (!product.out_of_stock) onSelect(product);
            }}
          >
            {product.out_of_stock ? 'Unavailable' : 'Rent Now'}
          </button>
        </div>
      </div>
      
      {/* Global CSS for skeleton animation, ideally placed in a global stylesheet, but injected safely here */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}} />
    </motion.div>
  );
};

export default ProductCard;

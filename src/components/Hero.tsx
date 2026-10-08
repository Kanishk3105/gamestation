import React from 'react';
import { motion } from 'framer-motion';
import { usePrefersReducedMotion, useIsMobile } from '../hooks/useMediaQuery';

interface HeroProps {
  onBrowseCatalog: () => void;
  onViewTrending: () => void;
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'relative',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(180deg, #0a0a0f 0%, #12121a 100%)',
    overflow: 'hidden',
    padding: '2rem',
    boxSizing: 'border-box',
    color: '#ffffff',
  },
  containerMobile: {
    minHeight: '80vh',
    flexDirection: 'column',
    padding: '6rem 1rem 4rem 1rem',
  },
  gridOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
    backgroundSize: '40px 40px',
    zIndex: 1,
    pointerEvents: 'none',
  },
  orb: {
    position: 'absolute',
    borderRadius: '50%',
    filter: 'blur(100px)',
    zIndex: 0,
    pointerEvents: 'none',
  },
  contentWrapper: {
    position: 'relative',
    zIndex: 2,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    maxWidth: '1200px',
    width: '100%',
    gap: '4rem',
  },
  contentWrapperMobile: {
    flexDirection: 'column',
    gap: '3rem',
    textAlign: 'center',
  },
  textContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '1.5rem',
  },
  textContentMobile: {
    alignItems: 'center',
  },
  badge: {
    padding: '0.5rem 1rem',
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(10px)',
    borderRadius: '20px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    fontSize: '0.875rem',
    fontWeight: 500,
    color: '#e2e8f0',
  },
  headline: {
    fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
    lineHeight: 1.1,
    fontWeight: 800,
    margin: 0,
    letterSpacing: '-0.02em',
  },
  gradientText: {
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #06b6d4)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    color: 'transparent',
    display: 'inline-block',
  },
  subtitle: {
    fontSize: '1.125rem',
    lineHeight: 1.6,
    color: '#94a3b8',
    maxWidth: '500px',
    margin: 0,
  },
  ctaGroup: {
    display: 'flex',
    gap: '1rem',
    marginTop: '0.5rem',
    flexWrap: 'wrap',
  },
  ctaPrimary: {
    padding: '0.875rem 2rem',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'opacity 0.2s, transform 0.2s',
    boxShadow: '0 4px 14px 0 rgba(99, 102, 241, 0.39)',
  },
  ctaSecondary: {
    padding: '0.875rem 2rem',
    background: 'transparent',
    color: 'white',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  statsRow: {
    display: 'flex',
    gap: '2.5rem',
    marginTop: '2rem',
    paddingTop: '2rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    width: '100%',
  },
  statsRowMobile: {
    justifyContent: 'center',
    gap: '1.5rem',
    flexWrap: 'wrap',
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  statValue: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: '#ffffff',
  },
  statLabel: {
    fontSize: '0.875rem',
    color: '#64748b',
  },
  imageContainer: {
    flex: 1,
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '400px',
  },
  imageContainerMobile: {
    minHeight: '300px',
    width: '100%',
  },
  image: {
    width: '100%',
    maxWidth: '500px',
    height: 'auto',
    objectFit: 'contain',
    filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.5))',
    position: 'relative',
    zIndex: 2,
  },
  glow: {
    position: 'absolute',
    bottom: '0',
    width: '70%',
    height: '20px',
    background: 'radial-gradient(ellipse at center, rgba(99, 102, 241, 0.4) 0%, transparent 70%)',
    filter: 'blur(15px)',
    borderRadius: '50%',
    zIndex: 1,
  }
};

const Hero: React.FC<HeroProps> = ({ onBrowseCatalog, onViewTrending }) => {
  const isMobile = useIsMobile();
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <div style={{ ...styles.container, ...(isMobile ? styles.containerMobile : {}) }}>
      {/* Background elements */}
      <div style={styles.gridOverlay} />
      
      {/* Floating Orbs */}
      <motion.div
        style={{ ...styles.orb, top: '5%', left: '15%', width: '400px', height: '400px', background: 'rgba(99, 102, 241, 0.15)' }}
        animate={prefersReducedMotion ? undefined : {
          x: [0, 80, 0, -40, 0],
          y: [0, -40, 40, 0, 0],
          scale: [1, 1.1, 0.9, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut' as const,
        }}
      />
      <motion.div
        style={{ ...styles.orb, bottom: '15%', right: '5%', width: '500px', height: '500px', background: 'rgba(139, 92, 246, 0.10)' }}
        animate={prefersReducedMotion ? undefined : {
          x: [0, -60, 0, 60, 0],
          y: [0, 60, -30, 0, 0],
          scale: [1, 0.9, 1.1, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'easeInOut' as const,
        }}
      />
      <motion.div
        style={{ ...styles.orb, top: '40%', left: '45%', width: '350px', height: '350px', background: 'rgba(6, 182, 212, 0.08)' }}
        animate={prefersReducedMotion ? undefined : {
          x: [0, 40, -40, 0, 0],
          y: [0, 40, -40, 0, 0],
          scale: [1, 1.15, 0.85, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'easeInOut' as const,
        }}
      />

      {/* Main Content */}
      <div style={{ ...styles.contentWrapper, ...(isMobile ? styles.contentWrapperMobile : {}) }}>
        <div style={{ ...styles.textContent, ...(isMobile ? styles.textContentMobile : {}) }}>
          <div style={styles.badge}>🎮 Premium Gaming Rentals</div>
          
          <h1 style={styles.headline}>
            Rent Premium<br />
            <span style={styles.gradientText}>Gaming Consoles</span>
          </h1>
          
          <p style={styles.subtitle}>
            Experience next-gen gaming without the commitment. Rent PS5 consoles, combos, and accessories at affordable daily rates.
          </p>
          
          <div style={{ ...styles.ctaGroup, ...(isMobile ? { justifyContent: 'center' } : {}) }}>
            <motion.button 
              whileHover={prefersReducedMotion ? {} : { scale: 1.05 }} 
              whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
              style={styles.ctaPrimary} 
              onClick={onBrowseCatalog}
            >
              Browse Catalog
            </motion.button>
            
            <motion.button 
              whileHover={prefersReducedMotion ? {} : { backgroundColor: 'rgba(255, 255, 255, 0.1)' }} 
              whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
              style={styles.ctaSecondary} 
              onClick={onViewTrending}
            >
              View Trending
            </motion.button>
          </div>

          <div style={{ ...styles.statsRow, ...(isMobile ? styles.statsRowMobile : {}) }}>
            <div style={styles.statItem}>
              <span style={styles.statValue}>23+</span>
              <span style={styles.statLabel}>Consoles</span>
            </div>
            <div style={styles.statItem}>
              <span style={styles.statValue}>10K+</span>
              <span style={styles.statLabel}>Bookings</span>
            </div>
            <div style={styles.statItem}>
              <span style={styles.statValue}>4.8★</span>
              <span style={styles.statLabel}>Average Rating</span>
            </div>
          </div>
        </div>

        <div style={{ ...styles.imageContainer, ...(isMobile ? styles.imageContainerMobile : {}) }}>
          <motion.div 
            style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
            animate={prefersReducedMotion ? undefined : { y: [0, -20, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' as const }}
          >
            <img 
              src="https://images.sharepal.in/categories/gaming-consoles/ps5/ps5-with-100-games-with-1-controller/ps5-with-100-games-with-1-controller-on-rent-sharepal-1.webp" 
              alt="PlayStation 5 Console" 
              style={styles.image} 
            />
            <div style={styles.glow} />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Hero;

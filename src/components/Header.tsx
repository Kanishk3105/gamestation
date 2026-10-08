import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useIsMobile } from '../hooks/useMediaQuery';

interface HeaderProps {
  onSearchClick: () => void;
  onScrollToSection: (section: string) => void;
}

const styles: Record<string, React.CSSProperties> = {
  headerWrapper: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  },
  headerScroll: {
    backgroundColor: 'rgba(10, 10, 10, 0.75)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
  },
  headerTop: {
    backgroundColor: 'transparent',
    borderBottom: '1px solid transparent',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    transition: 'height 0.3s ease',
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    fontSize: '24px',
    letterSpacing: '-0.5px',
  },
  logoGame: {
    fontWeight: 800,
    color: '#ffffff',
  },
  logoStation: {
    fontWeight: 800,
    color: '#6366f1',
  },
  desktopNav: {
    display: 'flex',
    gap: '32px',
    alignItems: 'center',
  },
  navButton: {
    background: 'none',
    border: 'none',
    color: '#a1a1aa',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'color 0.2s ease',
    padding: '8px 0',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  searchBtn: {
    background: 'none',
    border: 'none',
    color: '#ffffff',
    cursor: 'pointer',
    padding: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'opacity 0.2s ease',
  },
  ctaBtn: {
    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
    color: '#ffffff',
    border: 'none',
    padding: '10px 24px',
    borderRadius: '100px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    boxShadow: '0 4px 14px 0 rgba(99, 102, 241, 0.39)',
  },
  hamburger: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '18px',
    width: '24px',
    padding: 0,
    zIndex: 101,
  },
  hamburgerLine: {
    width: '100%',
    height: '2px',
    backgroundColor: '#ffffff',
    borderRadius: '2px',
  },
  mobileMenu: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100vh',
    backgroundColor: 'rgba(10, 10, 10, 0.95)',
    backdropFilter: 'blur(30px)',
    WebkitBackdropFilter: 'blur(30px)',
    zIndex: 99,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mobileNavList: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '32px',
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  mobileNavItem: {
    color: '#ffffff',
    fontSize: '28px',
    fontWeight: 600,
    textDecoration: 'none',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
  }
};

const navItems = ['Catalog', 'Trending', 'New Arrivals'];

const Header: React.FC<HeaderProps> = ({ onSearchClick, onScrollToSection }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const headerStyle = {
    ...styles.headerWrapper,
    ...(isScrolled ? styles.headerScroll : styles.headerTop)
  };

  const containerStyle = {
    ...styles.container,
    height: isScrolled ? '64px' : '88px',
  };

  const toggleMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleNavClick = (section: string) => {
    onScrollToSection(section.toLowerCase().replace(' ', '-'));
    setIsMobileMenuOpen(false);
  };

  const SearchIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"></circle>
      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
  );

  return (
    <header style={headerStyle}>
      <div style={containerStyle}>
        {/* Logo */}
        <div style={styles.logoContainer} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <span style={styles.logoGame}>GAME</span>
          <span style={styles.logoStation}>STATION</span>
        </div>

        {/* Desktop Navigation */}
        {!isMobile && (
          <nav style={styles.desktopNav} aria-label="Main Navigation">
            {navItems.map((item) => (
              <button 
                key={item} 
                style={styles.navButton}
                onClick={() => handleNavClick(item)}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#a1a1aa')}
                aria-label={`Go to ${item}`}
              >
                {item}
              </button>
            ))}
          </nav>
        )}

        {/* Actions */}
        <div style={styles.actions}>
          <button 
            style={styles.searchBtn} 
            onClick={onSearchClick}
            aria-label="Search products"
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.7')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            <SearchIcon />
          </button>

          {!isMobile && (
            <button 
              style={styles.ctaBtn}
              onClick={() => onScrollToSection('rent')}
              aria-label="Rent Now"
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              Rent Now
            </button>
          )}

          {/* Mobile Hamburger */}
          {isMobile && (
            <button 
              style={styles.hamburger} 
              onClick={toggleMenu}
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMobileMenuOpen}
            >
              <motion.div 
                style={styles.hamburgerLine}
                animate={{ rotate: isMobileMenuOpen ? 45 : 0, y: isMobileMenuOpen ? 8 : 0 }}
                transition={{ duration: 0.2 }}
              />
              <motion.div 
                style={styles.hamburgerLine}
                animate={{ opacity: isMobileMenuOpen ? 0 : 1 }}
                transition={{ duration: 0.2 }}
              />
              <motion.div 
                style={styles.hamburgerLine}
                animate={{ rotate: isMobileMenuOpen ? -45 : 0, y: isMobileMenuOpen ? -8 : 0 }}
                transition={{ duration: 0.2 }}
              />
            </button>
          )}
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobile && isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={styles.mobileMenu}
          >
            <ul style={styles.mobileNavList}>
              {navItems.map((item, i) => (
                <motion.li
                  key={item}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ delay: i * 0.1, duration: 0.3 }}
                >
                  <button 
                    style={styles.mobileNavItem}
                    onClick={() => handleNavClick(item)}
                    aria-label={`Go to ${item}`}
                  >
                    {item}
                  </button>
                </motion.li>
              ))}
              <motion.li
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ delay: navItems.length * 0.1, duration: 0.3 }}
                style={{ marginTop: '24px' }}
              >
                <button 
                  style={styles.ctaBtn}
                  onClick={() => handleNavClick('rent')}
                  aria-label="Rent Now"
                >
                  Rent Now
                </button>
              </motion.li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;

import React, { useState, useRef, useEffect, CSSProperties } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  resultCount: number;
  totalCount: number;
}

const styles: Record<string, CSSProperties> = {
  container: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    zIndex: 50,
    width: '100%',
    maxWidth: '400px'
  },
  searchButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    cursor: 'pointer',
    color: '#fff',
    transition: 'all 0.2s ease',
  },
  searchContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    height: '44px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '12px',
    overflow: 'hidden',
    boxSizing: 'border-box',
    width: '100%',
  },
  input: {
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
    border: 'none',
    color: '#fff',
    padding: '0 40px',
    fontSize: '15px',
    outline: 'none',
  },
  iconLeft: {
    position: 'absolute',
    left: '12px',
    color: 'rgba(255, 255, 255, 0.5)',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconRight: {
    position: 'absolute',
    right: '12px',
    color: 'rgba(255, 255, 255, 0.5)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'none',
    border: 'none',
    padding: 0,
  },
  resultCount: {
    position: 'absolute',
    top: '48px',
    right: '0',
    fontSize: '12px',
    color: 'rgba(255, 255, 255, 0.5)',
    whiteSpace: 'nowrap',
  }
};

const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const SearchBar: React.FC<SearchBarProps> = ({ value, onChange, isOpen, onToggle, resultCount, totalCount }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onToggle();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onToggle]);

  return (
    <div style={styles.container} role="search">
      <AnimatePresence initial={false} mode="wait">
        {!isOpen ? (
          <motion.button
            key="search-btn"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            style={styles.searchButton}
            onClick={onToggle}
            aria-label="Open search"
          >
            <SearchIcon />
          </motion.button>
        ) : (
          <motion.div
            key="search-input"
            initial={{ width: 44, opacity: 0 }}
            animate={{ width: '100%', opacity: 1 }}
            exit={{ width: 44, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            style={{
              ...styles.searchContainer,
              border: `1px solid ${isFocused ? 'rgba(139, 92, 246, 0.8)' : 'rgba(255, 255, 255, 0.1)'}`,
              transition: 'border-color 0.2s ease'
            }}
          >
            <div style={styles.iconLeft}>
              <SearchIcon />
            </div>
            
            <input
              ref={inputRef}
              style={styles.input}
              placeholder="Search consoles, games, combos..."
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              aria-label="Search products"
            />
            
            {value && (
              <button style={styles.iconRight} onClick={() => onChange('')} aria-label="Clear search">
                <CloseIcon />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && value && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={styles.resultCount}
          >
            {resultCount} of {totalCount} products
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;

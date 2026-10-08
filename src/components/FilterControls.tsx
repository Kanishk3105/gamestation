import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FilterState, SortOption } from '../types/product';
import { allTags, priceRange } from '../data/products';
import { useIsMobile } from '../hooks/useMediaQuery';

interface FilterControlsProps {
  filters: FilterState;
  onUpdateFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  onResetFilters: () => void;
  onToggleTag: (tag: string) => void;
  activeFilterCount: number;
  resultCount: number;
  totalCount: number;
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
    width: '100%',
    marginBottom: '32px',
  },
  desktopTopRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap' as const,
    gap: '16px',
  },
  desktopFilterBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    flexWrap: 'wrap' as const,
  },
  controlGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap' as const,
  },
  groupLabel: {
    fontSize: '12px',
    fontWeight: 600,
    color: 'rgba(255, 255, 255, 0.4)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    marginRight: '4px',
  },
  pillButton: (active: boolean) => ({
    background: active ? '#6366f1' : 'rgba(255, 255, 255, 0.04)',
    color: active ? '#ffffff' : 'rgba(255, 255, 255, 0.7)',
    border: `1px solid ${active ? '#6366f1' : 'rgba(255, 255, 255, 0.1)'}`,
    borderRadius: '100px',
    padding: '7px 16px',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    backdropFilter: 'blur(8px)',
  }),
  tagChip: (tag: string, active: boolean) => {
    let color = '#ffffff';
    if (tag === 'Trending') color = '#f97316';
    if (tag === 'New') color = '#06b6d4';
    if (tag === 'Vote to Launch') color = '#a855f7';
    
    return {
      background: active ? color : 'rgba(255, 255, 255, 0.04)',
      color: active ? '#ffffff' : color,
      border: `1px solid ${active ? color : `${color}40`}`,
      borderRadius: '100px',
      padding: '6px 14px',
      fontSize: '13px',
      fontWeight: 500,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      backdropFilter: 'blur(8px)',
    };
  },
  priceControl: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    padding: '6px 14px',
    backdropFilter: 'blur(8px)',
  },
  slider: {
    accentColor: '#6366f1',
    cursor: 'pointer',
    width: '100px',
  },
  priceLabel: {
    fontSize: '13px',
    color: 'rgba(255, 255, 255, 0.8)',
    whiteSpace: 'nowrap' as const,
    minWidth: '95px',
  },
  selectWrapper: {
    position: 'relative' as const,
    display: 'inline-block',
  },
  select: {
    appearance: 'none' as const,
    background: 'rgba(18, 18, 26, 0.9)',
    color: 'rgba(255, 255, 255, 0.9)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '12px',
    padding: '9px 36px 9px 14px',
    fontSize: '13px',
    fontWeight: 500,
    outline: 'none',
    cursor: 'pointer',
    backdropFilter: 'blur(10px)',
  },
  chevron: {
    position: 'absolute' as const,
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    pointerEvents: 'none' as const,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  activeFiltersRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap' as const,
  },
  activeFilterChip: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'rgba(99, 102, 241, 0.15)',
    color: '#c7d2fe',
    border: '1px solid rgba(99, 102, 241, 0.35)',
    borderRadius: '8px',
    padding: '4px 10px',
    fontSize: '12px',
    fontWeight: 500,
  },
  clearButton: {
    background: 'transparent',
    border: 'none',
    color: 'rgba(255, 255, 255, 0.6)',
    cursor: 'pointer',
    padding: '0',
    display: 'flex',
    alignItems: 'center',
  },
  clearAllText: {
    color: '#818cf8',
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    textDecoration: 'underline',
    marginLeft: '6px',
  },
  resultCount: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: '13px',
  },
  mobileHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '12px',
    width: '100%',
  },
  mobileFilterBtn: {
    flex: 1,
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    color: '#ffffff',
    borderRadius: '12px',
    padding: '10px 16px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    backdropFilter: 'blur(10px)',
  },
  badge: {
    background: '#6366f1',
    color: '#ffffff',
    borderRadius: '9999px',
    padding: '2px 7px',
    fontSize: '11px',
    fontWeight: 700,
  },
  drawerOverlay: {
    position: 'fixed' as const,
    inset: 0,
    background: 'rgba(0, 0, 0, 0.75)',
    backdropFilter: 'blur(8px)',
    zIndex: 199,
  },
  drawer: {
    position: 'fixed' as const,
    bottom: 0,
    left: 0,
    right: 0,
    background: 'rgba(18, 18, 26, 0.98)',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    borderTopLeftRadius: '24px',
    borderTopRightRadius: '24px',
    padding: '24px',
    zIndex: 200,
    maxHeight: '85vh',
    overflowY: 'auto' as const,
    boxShadow: '0 -10px 40px rgba(0,0,0,0.6)',
  },
  drawerHandle: {
    width: '40px',
    height: '4px',
    background: 'rgba(255, 255, 255, 0.2)',
    borderRadius: '2px',
    margin: '0 auto 24px',
  },
  drawerSection: {
    marginBottom: '24px',
  },
  drawerTitle: {
    color: '#ffffff',
    fontSize: '15px',
    fontWeight: 600,
    marginBottom: '12px',
  },
  drawerFooter: {
    display: 'flex',
    gap: '12px',
    marginTop: '32px',
  },
  resetBtn: {
    flex: 1,
    padding: '14px',
    background: 'transparent',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    color: '#ffffff',
    borderRadius: '12px',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: '14px',
  },
  applyBtn: {
    flex: 1,
    padding: '14px',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    border: 'none',
    color: '#ffffff',
    borderRadius: '12px',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: '14px',
  },
  starContainer: {
    display: 'flex',
    gap: '6px',
    alignItems: 'center',
  },
  starBtn: (active: boolean) => ({
    background: 'transparent',
    border: 'none',
    color: active ? '#fbbf24' : 'rgba(255, 255, 255, 0.2)',
    cursor: 'pointer',
    fontSize: '22px',
    padding: '0 2px',
    transition: 'color 0.15s ease',
  }),
};

const FilterControls: React.FC<FilterControlsProps> = ({
  filters,
  onUpdateFilter,
  onResetFilters,
  onToggleTag,
  activeFilterCount,
  resultCount,
  totalCount,
}) => {
  const isMobile = useIsMobile();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const sortOptions = [
    { value: 'popularity', label: 'Most Popular' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'newest', label: 'Newest Arrivals' },
  ];

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onUpdateFilter('sort', e.target.value as SortOption);
  };

  const renderSortSelect = () => (
    <div style={styles.selectWrapper}>
      <select 
        style={styles.select} 
        value={filters.sort || 'popularity'} 
        onChange={handleSortChange}
        aria-label="Sort products"
      >
        {sortOptions.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <svg style={styles.chevron} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M6 9l6 6 6-6"/>
      </svg>
    </div>
  );

  const renderRatingStars = () => (
    <div style={styles.starContainer}>
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          style={styles.starBtn((filters.minRating || 0) >= star)}
          onClick={() => onUpdateFilter('minRating', filters.minRating === star ? 0 : star)}
          aria-label={`Filter by minimum ${star} stars`}
        >
          ★
        </button>
      ))}
      {filters.minRating > 0 && (
        <span style={{ fontSize: '12px', color: '#fbbf24', marginLeft: '4px' }}>
          ({filters.minRating}+★)
        </span>
      )}
    </div>
  );

  const renderAvailabilityPills = () => (
    <div style={styles.controlGroup}>
      <button 
        style={styles.pillButton(filters.availability === 'all' || !filters.availability)}
        onClick={() => onUpdateFilter('availability', 'all')}
      >
        All
      </button>
      <button 
        style={styles.pillButton(filters.availability === 'available')}
        onClick={() => onUpdateFilter('availability', 'available')}
      >
        Available
      </button>
      <button 
        style={styles.pillButton(filters.availability === 'out-of-stock')}
        onClick={() => onUpdateFilter('availability', 'out-of-stock')}
      >
        Out of Stock
      </button>
    </div>
  );

  const renderTagChips = () => (
    <div style={styles.controlGroup}>
      {allTags.map(tag => {
        const isActive = filters.tags?.includes(tag) || false;
        return (
          <button
            key={tag}
            style={styles.tagChip(tag, isActive)}
            onClick={() => onToggleTag(tag)}
            aria-label={`Filter by tag ${tag}`}
          >
            {tag}
          </button>
        );
      })}
    </div>
  );

  const renderPriceSlider = () => (
    <div style={styles.priceControl}>
      <span style={styles.priceLabel}>
        Max ₹{Math.round(filters.priceRange[1])}/day
      </span>
      <input
        type="range"
        min={Math.floor(priceRange[0])}
        max={Math.ceil(priceRange[1])}
        step={5}
        value={filters.priceRange[1]}
        onChange={(e) => onUpdateFilter('priceRange', [filters.priceRange[0], Number(e.target.value)])}
        style={styles.slider}
        aria-label="Maximum daily rent filter"
      />
    </div>
  );

  const activeFilters = [];
  if (filters.availability && filters.availability !== 'all') {
    activeFilters.push({
      key: 'availability',
      label: `Availability: ${filters.availability === 'available' ? 'Available' : 'Out of Stock'}`,
      onRemove: () => onUpdateFilter('availability', 'all')
    });
  }
  if (filters.minRating && filters.minRating > 0) {
    activeFilters.push({
      key: 'rating',
      label: `${filters.minRating}+ Stars`,
      onRemove: () => onUpdateFilter('minRating', 0)
    });
  }
  if (filters.priceRange[1] < priceRange[1]) {
    activeFilters.push({
      key: 'price',
      label: `Max: ₹${Math.round(filters.priceRange[1])}/day`,
      onRemove: () => onUpdateFilter('priceRange', [priceRange[0], priceRange[1]])
    });
  }
  filters.tags?.forEach(tag => {
    activeFilters.push({
      key: tag,
      label: tag,
      onRemove: () => onToggleTag(tag)
    });
  });

  return (
    <div style={styles.container}>
      {isMobile ? (
        <>
          <div style={styles.mobileHeader}>
            <button style={styles.mobileFilterBtn} onClick={() => setDrawerOpen(true)}>
              <span>Filters</span>
              {activeFilterCount > 0 && <span style={styles.badge}>{activeFilterCount}</span>}
            </button>
            {renderSortSelect()}
          </div>
          
          <AnimatePresence>
            {drawerOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={styles.drawerOverlay}
                  onClick={() => setDrawerOpen(false)}
                />
                <motion.div
                  initial={{ y: '100%' }}
                  animate={{ y: 0 }}
                  exit={{ y: '100%' }}
                  transition={{ type: 'spring' as const, damping: 25, stiffness: 200 }}
                  style={styles.drawer}
                >
                  <div style={styles.drawerHandle} />
                  
                  <div style={styles.drawerSection}>
                    <div style={styles.drawerTitle}>Availability</div>
                    {renderAvailabilityPills()}
                  </div>
                  
                  <div style={styles.drawerSection}>
                    <div style={styles.drawerTitle}>Tags</div>
                    {renderTagChips()}
                  </div>

                  <div style={styles.drawerSection}>
                    <div style={styles.drawerTitle}>Max Daily Rent</div>
                    {renderPriceSlider()}
                  </div>
                  
                  <div style={styles.drawerSection}>
                    <div style={styles.drawerTitle}>Minimum Rating</div>
                    {renderRatingStars()}
                  </div>
                  
                  <div style={styles.drawerFooter}>
                    <button style={styles.resetBtn} onClick={() => { onResetFilters(); setDrawerOpen(false); }}>Reset</button>
                    <button style={styles.applyBtn} onClick={() => setDrawerOpen(false)}>Apply</button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </>
      ) : (
        <>
          <div style={styles.desktopTopRow}>
            <div style={styles.desktopFilterBar}>
              {renderAvailabilityPills()}
              {renderTagChips()}
              {renderPriceSlider()}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={styles.groupLabel}>Min:</span>
                {renderRatingStars()}
              </div>
            </div>
            {renderSortSelect()}
          </div>
        </>
      )}

      {/* Active Filters Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div style={styles.activeFiltersRow}>
          {activeFilters.map(filter => (
            <div key={filter.key} style={styles.activeFilterChip}>
              {filter.label}
              <button style={styles.clearButton} onClick={filter.onRemove} aria-label={`Remove filter ${filter.label}`}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
          ))}
          {activeFilterCount > 0 && (
            <button style={styles.clearAllText} onClick={onResetFilters}>
              Clear All ({activeFilterCount})
            </button>
          )}
        </div>
        <div style={styles.resultCount}>
          Showing <strong style={{ color: '#ffffff' }}>{resultCount}</strong> of {totalCount} consoles
        </div>
      </div>
    </div>
  );
};

export default FilterControls;

import { useCallback, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import SearchBar from '../components/SearchBar';
import FilterControls from '../components/FilterControls';
import ProductGrid from '../components/ProductGrid';
import EmptyState from '../components/EmptyState';
import type { Product } from '../types/product';

export function HomePage() {
  const {
    products: filteredProducts,
    filters,
    updateFilter,
    resetFilters,
    toggleTag,
    activeFilterCount,
    totalCount,
    resultCount,
  } = useProducts();
  const [searchOpen, setSearchOpen] = useState(false);
  const catalogRef = useRef<HTMLElement>(null);
  const navigate = useNavigate();

  const handleBrowseCatalog = useCallback(() => {
    catalogRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const handleViewTrending = useCallback(() => {
    catalogRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    resetFilters();
    setTimeout(() => toggleTag('Trending'), 80);
  }, [resetFilters, toggleTag]);

  const handleSearchToggle = useCallback(() => {
    setSearchOpen((prev) => {
      const next = !prev;
      if (next) catalogRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      else updateFilter('search', '');
      return next;
    });
  }, [updateFilter]);

  const onSelectProduct = (product: Product) => {
    if (!product.out_of_stock) navigate(`/rent/${product.id}`);
  };

  return (
    <>
      <section className="gs-home-intro">
        <div className="gs-home-intro-content">
          <p className="gs-kicker">Gaming rentals, made simple</p>
          <h1>Play more. <span>Own less.</span></h1>
          <p className="gs-lede">
            Rent a PlayStation 5 or gaming bundle by the day. Choose your dates and we’ll take care of delivery and pickup.
          </p>
          <div className="gs-home-actions">
            <button className="gs-btn gs-btn-primary" onClick={handleBrowseCatalog}>Browse games</button>
            <button className="gs-btn gs-btn-ghost" onClick={handleViewTrending}>Trending games</button>
          </div>
        </div>
      </section>

      <section ref={catalogRef} id="catalog" className="gs-catalog">
        <div className="gs-catalog-wrap">
          <div className="gs-catalog-head">
            <div>
              <h2>Gaming catalog</h2>
              <p className="gs-muted">Filter the live inventory. Out of stock kits stay visible, never bookable.</p>
            </div>
            <SearchBar
              value={filters.search}
              onChange={(val) => updateFilter('search', val)}
              isOpen={searchOpen}
              onToggle={handleSearchToggle}
              resultCount={resultCount}
              totalCount={totalCount}
            />
          </div>
          <FilterControls
            filters={filters}
            onUpdateFilter={updateFilter}
            onResetFilters={resetFilters}
            onToggleTag={toggleTag}
            activeFilterCount={activeFilterCount}
            resultCount={resultCount}
            totalCount={totalCount}
          />
          <AnimatePresence mode="wait">
            {filteredProducts.length > 0 ? (
              <ProductGrid key="grid" products={filteredProducts} onSelectProduct={onSelectProduct} />
            ) : (
              <EmptyState key="empty" onReset={resetFilters} />
            )}
          </AnimatePresence>
        </div>
      </section>

      <section id="how" className="gs-story gs-story-alt">
        <h2>How renting works</h2>
        <ol className="gs-how">
          <li>Choose a kit and lock delivery / return dates.</li>
          <li>The pricing engine quotes days × rate × quantity.</li>
          <li>Sign in with email or phone OTP.</li>
          <li>Confirm a test payment. The order is created once, even if you retry.</li>
        </ol>
      </section>

      <section id="faq" className="gs-story">
        <h2>Questions</h2>
        <details><summary>Is the catalogue real?</summary><p>Yes. It is seeded from product-list.json — 23 packages, original prices and stock flags.</p></details>
        <details><summary>Will I be charged?</summary><p>Locally, payments use an explicit development provider. The UI will never claim a live gateway succeeded.</p></details>
        <details><summary>Can I rent out-of-stock kits?</summary><p>No. They remain in the catalogue, dimmed, with Rent disabled.</p></details>
      </section>
    </>
  );
}

import { useState, useMemo, useCallback } from 'react';
import { products as allProducts } from '../data/products';
import { Product, FilterState } from '../types/product';

const defaultFilters: FilterState = {
  search: '',
  availability: 'all',
  tags: [],
  priceRange: [
    Math.min(...allProducts.map(p => p.per_day_rent)),
    Math.max(...allProducts.map(p => p.per_day_rent)),
  ],
  minRating: 0,
  sort: 'popularity',
};

export function useProducts() {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const updateFilter = useCallback(<K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const toggleTag = useCallback((tag: string) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag],
    }));
  }, []);

  const filteredProducts = useMemo(() => {
    let result = [...allProducts];

    // Search
    if (filters.search.trim()) {
      const query = filters.search.toLowerCase().trim();
      result = result.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.tag.toLowerCase().includes(query)
      );
    }

    // Availability
    if (filters.availability === 'available') {
      result = result.filter(p => !p.out_of_stock);
    } else if (filters.availability === 'out-of-stock') {
      result = result.filter(p => p.out_of_stock);
    }

    // Tags
    if (filters.tags.length > 0) {
      result = result.filter(p => filters.tags.includes(p.tag));
    }

    // Price range
    result = result.filter(
      p => p.per_day_rent >= filters.priceRange[0] && p.per_day_rent <= filters.priceRange[1]
    );

    // Rating
    if (filters.minRating > 0) {
      result = result.filter(p => p.rating >= filters.minRating);
    }

    // Sort
    switch (filters.sort) {
      case 'popularity':
        result.sort((a, b) => b.booked_count - a.booked_count);
        break;
      case 'price-asc':
        result.sort((a, b) => a.per_day_rent - b.per_day_rent);
        break;
      case 'price-desc':
        result.sort((a, b) => b.per_day_rent - a.per_day_rent);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        result.sort((a, b) => b.id - a.id);
        break;
    }

    return result;
  }, [filters]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.availability !== 'all') count++;
    if (filters.tags.length > 0) count++;
    if (filters.minRating > 0) count++;
    if (filters.priceRange[0] !== defaultFilters.priceRange[0] ||
        filters.priceRange[1] !== defaultFilters.priceRange[1]) count++;
    return count;
  }, [filters]);

  return {
    products: filteredProducts,
    allProducts,
    filters,
    updateFilter,
    resetFilters,
    toggleTag,
    selectedProduct,
    setSelectedProduct,
    activeFilterCount,
    totalCount: allProducts.length,
    resultCount: filteredProducts.length,
  };
}

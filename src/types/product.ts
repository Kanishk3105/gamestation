export interface Product {
  id: number;
  name: string;
  image: string;
  rating: number;
  booked_count: number;
  tag: string;
  per_day_rent: number;
  out_of_stock: boolean;
}

export interface ProductData {
  products: Product[];
}

export type SortOption = 'popularity' | 'price-asc' | 'price-desc' | 'rating' | 'newest';

export interface FilterState {
  search: string;
  availability: 'all' | 'available' | 'out-of-stock';
  tags: string[];
  priceRange: [number, number];
  minRating: number;
  sort: SortOption;
}

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product } from '../types/product';
import ProductCard from './ProductCard';

interface ProductGridProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
}

const gridStyles = `
  .gs-product-grid {
    display: grid;
    grid-template-columns: repeat(1, 1fr);
    gap: 24px;
    width: 100%;
  }
  @media (min-width: 640px) {
    .gs-product-grid { grid-template-columns: repeat(2, 1fr); }
  }
  @media (min-width: 1024px) {
    .gs-product-grid { grid-template-columns: repeat(3, 1fr); }
  }
  @media (min-width: 1200px) {
    .gs-product-grid { grid-template-columns: repeat(4, 1fr); }
  }
`;

const ProductGrid: React.FC<ProductGridProps> = ({ products, onSelectProduct }) => {
  return (
    <div style={{ padding: '0 24px', width: '100%', boxSizing: 'border-box', maxWidth: '1440px', margin: '0 auto' }}>
      <style>{gridStyles}</style>
      <div className="gs-product-grid">
        <AnimatePresence mode="popLayout">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <ProductCard 
                product={product} 
                index={index} 
                onSelect={onSelectProduct} 
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ProductGrid;

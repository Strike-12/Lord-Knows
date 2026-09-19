import React from 'react';
import { ProductCategory } from '../types';
import { SlidersHorizontal } from 'lucide-react';

interface ProductFiltersProps {
  selectedCategory: ProductCategory;
  onSelectCategory: (category: ProductCategory) => void;
  sortBy: 'featured' | 'price-asc' | 'price-desc' | 'rating';
  onSortChange: (sort: 'featured' | 'price-asc' | 'price-desc' | 'rating') => void;
  totalProducts: number;
}

const CATEGORIES: { id: ProductCategory; label: string }[] = [
  { id: 'all', label: 'All Garments' },
  { id: 'hoodies', label: 'Hoodies & Fleece' },
  { id: 'tees', label: 'Graphic Tees' },
  { id: 'outerwear', label: 'Outerwear' },
  { id: 'bottoms', label: 'Trousers & Cargo' },
  { id: 'accessories', label: 'Accessories' }
];

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  selectedCategory,
  onSelectCategory,
  sortBy,
  onSortChange,
  totalProducts
}) => {
  return (
    <div className="w-full bg-neutral-950 border-b border-neutral-900 sticky top-18 z-30 py-3 backdrop-blur-md bg-neutral-950/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        
        {/* Category Pill Buttons */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                id={`filter-cat-${cat.id}`}
                onClick={() => onSelectCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-neutral-100 text-neutral-950 shadow-md'
                    : 'bg-neutral-900/80 text-neutral-400 hover:text-white hover:bg-neutral-800'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Right side controls: Count & Sort */}
        <div className="flex items-center justify-between md:justify-end space-x-4 text-xs">
          <div className="text-neutral-500 font-mono">
            <span>{totalProducts}</span> {totalProducts === 1 ? 'PIECE' : 'PIECES'} FOUND
          </div>

          <div className="flex items-center space-x-2">
            <SlidersHorizontal className="w-3.5 h-3.5 text-neutral-400" />
            <span className="text-neutral-400 uppercase font-mono text-[11px] hidden sm:inline">SORT:</span>
            <select
              id="product-sort-select"
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as any)}
              className="bg-neutral-900 border border-neutral-800 text-neutral-200 text-xs rounded px-2.5 py-1.5 focus:outline-none focus:border-neutral-700 cursor-pointer font-mono"
            >
              <option value="featured">Featured / Curated</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Customer Rating</option>
            </select>
          </div>
        </div>

      </div>
    </div>
  );
};

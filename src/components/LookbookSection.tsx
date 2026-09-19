import React, { useState } from 'react';
import { LOOKBOOK_ITEMS, PRODUCTS } from '../data/products';
import { Product, Currency } from '../types';
import { formatPrice } from '../utils/format';
import { ChevronLeft, ChevronRight, ShoppingBag, Eye } from 'lucide-react';

interface LookbookSectionProps {
  currency: Currency;
  onSelectProduct: (product: Product) => void;
}

export const LookbookSection: React.FC<LookbookSectionProps> = ({
  currency,
  onSelectProduct
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const activeLook = LOOKBOOK_ITEMS[currentIndex];
  const taggedProducts = PRODUCTS.filter((p) => activeLook.taggedProductIds.includes(p.id));

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? LOOKBOOK_ITEMS.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === LOOKBOOK_ITEMS.length - 1 ? 0 : prev + 1));
  };

  return (
    <section id="lookbook" className="w-full bg-neutral-950 border-b border-neutral-900 py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-6 border-b border-neutral-900">
          <div>
            <div className="text-xs font-mono uppercase tracking-widest text-amber-400 mb-2">
              Visual Archives // 2026
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tighter uppercase font-display">
              Editorial Lookbook
            </h2>
          </div>
          <div className="flex items-center space-x-3 mt-4 md:mt-0">
            <span className="text-xs font-mono text-neutral-500">
              FRAME {currentIndex + 1} OF {LOOKBOOK_ITEMS.length}
            </span>
            <div className="flex space-x-2">
              <button
                id="lookbook-prev-btn"
                onClick={handlePrev}
                className="p-2.5 rounded border border-neutral-800 bg-neutral-900 text-neutral-300 hover:text-white hover:border-neutral-700 transition-colors"
                aria-label="Previous look"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                id="lookbook-next-btn"
                onClick={handleNext}
                className="p-2.5 rounded border border-neutral-800 bg-neutral-900 text-neutral-300 hover:text-white hover:border-neutral-700 transition-colors"
                aria-label="Next look"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Editorial Feature */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Large Photo Stage */}
          <div className="lg:col-span-8 relative aspect-[16/10] sm:aspect-[16/9] lg:aspect-auto lg:h-[620px] rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800">
            <img
              src={activeLook.image}
              alt={activeLook.title}
              className="w-full h-full object-cover object-center filter contrast-110"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-transparent" />
            
            {/* Overlay Text */}
            <div className="absolute bottom-6 left-6 right-6 sm:left-8 sm:bottom-8 max-w-xl">
              <span className="text-[11px] font-mono font-bold tracking-widest text-amber-400 uppercase bg-neutral-950/80 px-2.5 py-1 rounded border border-amber-400/20">
                {activeLook.season}
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight uppercase mt-3 mb-2 font-display">
                {activeLook.title}
              </h3>
              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-md">
                {activeLook.subtitle}
              </p>
            </div>
          </div>

          {/* Right: Tagged Garments "Shop This Look" */}
          <div className="lg:col-span-4 flex flex-col justify-between bg-neutral-900/50 border border-neutral-800/80 rounded-xl p-6">
            <div>
              <div className="flex items-center space-x-2 text-xs font-mono uppercase tracking-wider text-neutral-400 mb-4 pb-3 border-b border-neutral-800">
                <ShoppingBag className="w-4 h-4 text-white" />
                <span>Garments in this Frame ({taggedProducts.length})</span>
              </div>

              <div className="space-y-4">
                {taggedProducts.map((prod) => (
                  <div
                    key={prod.id}
                    id={`lookbook-product-${prod.id}`}
                    onClick={() => onSelectProduct(prod)}
                    className="flex items-center space-x-3 p-2.5 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-neutral-700 cursor-pointer transition-all group"
                  >
                    <img
                      src={prod.images[0]}
                      alt={prod.name}
                      className="w-16 h-16 rounded object-cover bg-neutral-950 flex-shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-mono text-neutral-500 uppercase">{prod.category}</div>
                      <h4 className="text-xs font-bold text-white truncate group-hover:text-amber-300 transition-colors">
                        {prod.name}
                      </h4>
                      <div className="text-xs font-mono text-neutral-300 mt-0.5">
                        {formatPrice(prod.price, currency)}
                      </div>
                    </div>
                    <Eye className="w-4 h-4 text-neutral-500 group-hover:text-white transition-colors" />
                  </div>
                ))}
              </div>
            </div>

            {/* Lookbook Quote Note */}
            <div className="mt-8 pt-6 border-t border-neutral-800 text-[11px] font-mono text-neutral-400">
              <span className="text-neutral-200 font-semibold">STYLING NOTE:</span> Garments are sized generously with architectural drop shoulders. We recommend true-to-size for intentional streetwear silhouette.
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};

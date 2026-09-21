import React, { useState } from 'react';
import { Product, ProductSize, Currency } from '../types';
import { formatPrice } from '../utils/format';
import { Heart, Eye, Check, Star } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  currency: Currency;
  isWishlisted: boolean;
  onToggleWishlist: (productId: string) => void;
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product, size: ProductSize, color: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  currency,
  isWishlisted,
  onToggleWishlist,
  onQuickView,
  onAddToCart
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [selectedSize, setSelectedSize] = useState<ProductSize>(product.sizes[0]);
  const [selectedColor, setSelectedColor] = useState<string>(product.colors[0]?.name || '');
  const [addedAnimation, setAddedAnimation] = useState(false);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product, selectedSize, selectedColor);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1200);
  };

  const currentImage = isHovered && product.images.length > 1 ? product.images[1] : product.images[0];

  return (
    <div
      id={`product-card-${product.id}`}
      className="group relative flex flex-col bg-neutral-900/40 border border-neutral-800/80 hover:border-neutral-700 transition-all rounded-lg overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Visual Image Container */}
      <div 
        className="relative w-full aspect-[4/5] bg-neutral-900 overflow-hidden cursor-pointer"
        onClick={() => onQuickView(product)}
      >
        <img
          src={currentImage}
          alt={product.name}
          className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
          referrerPolicy="no-referrer"
        />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          {product.isNewDrop && (
            <span className="bg-amber-400 text-neutral-950 text-[10px] font-mono font-black px-2 py-0.5 uppercase tracking-wider rounded">
              Drop 04
            </span>
          )}
          {product.fabricGsm && (
            <span className="bg-neutral-950/80 backdrop-blur-sm text-neutral-300 border border-neutral-700 text-[10px] font-mono px-2 py-0.5 rounded">
              {product.fabricGsm}
            </span>
          )}
          {product.stockRemaining && product.stockRemaining <= 10 && (
            <span className="bg-rose-950/90 text-rose-300 border border-rose-800/80 text-[9px] font-mono px-2 py-0.5 rounded animate-pulse">
              Only {product.stockRemaining} Left
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          id={`wishlist-btn-${product.id}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product.id);
          }}
          className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-md transition-all z-10 ${
            isWishlisted
              ? 'bg-rose-600 text-white'
              : 'bg-neutral-950/60 text-neutral-300 hover:text-white hover:bg-neutral-900'
          }`}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className="w-4 h-4 fill-current" />
        </button>

        {/* Quick View Button on Desktop Hover */}
        <div className="absolute inset-x-3 bottom-3 hidden lg:flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
          <button
            id={`quickview-btn-${product.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(product);
            }}
            className="w-full py-2.5 bg-neutral-950/90 hover:bg-neutral-900 text-white text-xs font-semibold uppercase tracking-wider rounded border border-neutral-700 backdrop-blur-md flex items-center justify-center space-x-2"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Garment Details</span>
          </button>
        </div>
      </div>

      {/* Product Details Info */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Rating & Category */}
          <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 mb-1">
            <span className="uppercase">{product.category}</span>
            <div className="flex items-center space-x-1 text-amber-400">
              <Star className="w-3 h-3 fill-current" />
              <span>{product.rating}</span>
              <span className="text-neutral-500">({product.reviewsCount})</span>
            </div>
          </div>

          {/* Product Title */}
          <h3 
            onClick={() => onQuickView(product)}
            className="text-sm sm:text-base font-bold text-white tracking-tight hover:text-neutral-300 cursor-pointer transition-colors line-clamp-1 mb-1 font-display"
          >
            {product.name}
          </h3>

          {/* Price */}
          <div className="flex items-center space-x-2 mb-3">
            <span className="text-sm sm:text-base font-mono font-bold text-neutral-100">
              {formatPrice(product.price, currency)}
            </span>
            {product.originalPrice && (
              <span className="text-xs font-mono line-through text-neutral-500">
                {formatPrice(product.originalPrice, currency)}
              </span>
            )}
          </div>

          {/* Color Choices */}
          <div className="flex items-center space-x-1.5 mb-3">
            {product.colors.map((c) => (
              <button
                key={c.name}
                id={`color-swatch-${product.id}-${c.name.replace(/\s+/g, '-').toLowerCase()}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedColor(c.name);
                }}
                title={c.name}
                className={`w-3.5 h-3.5 rounded-full border transition-transform ${
                  selectedColor === c.name
                    ? 'ring-2 ring-white ring-offset-2 ring-offset-neutral-900 scale-110 border-transparent'
                    : 'border-neutral-600 hover:scale-110'
                }`}
                style={{ backgroundColor: c.hex }}
              />
            ))}
            <span className="text-[10px] font-mono text-neutral-400 ml-1 truncate">
              {selectedColor}
            </span>
          </div>
        </div>

        {/* Quick Size Selector & Add to Bag */}
        <div className="pt-2 border-t border-neutral-800/80">
          <div className="flex items-center justify-between gap-1 mb-2">
            <span className="text-[10px] font-mono text-neutral-400 uppercase">Size:</span>
            <div className="flex items-center gap-1">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  id={`size-btn-${product.id}-${s}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedSize(s);
                  }}
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded border transition-colors ${
                    selectedSize === s
                      ? 'bg-neutral-100 text-neutral-950 font-bold border-neutral-100'
                      : 'border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-600'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <button
            id={`quick-add-${product.id}`}
            onClick={handleQuickAdd}
            disabled={addedAnimation}
            className={`w-full py-2 rounded text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
              addedAnimation
                ? 'bg-emerald-600 text-white'
                : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-100 active:scale-98'
            }`}
          >
            {addedAnimation ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Added to Bag</span>
              </>
            ) : (
              <span>Quick Add • {selectedSize}</span>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

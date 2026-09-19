import React, { useState } from 'react';
import { Product, ProductSize, Currency } from '../types';
import { formatPrice } from '../utils/format';
import { X, Check, ShieldCheck, Ruler, Truck, RefreshCw, Heart, Star } from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  currency: Currency;
  isWishlisted: boolean;
  onClose: () => void;
  onToggleWishlist: (productId: string) => void;
  onAddToCart: (product: Product, size: ProductSize, color: string) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen,
  currency,
  isWishlisted,
  onClose,
  onToggleWishlist,
  onAddToCart
}) => {
  if (!isOpen || !product) return null;

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<ProductSize>(product.sizes[0]);
  const [selectedColor, setSelectedColor] = useState<string>(product.colors[0]?.name || '');
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const handleAdd = () => {
    onAddToCart(product, selectedSize, selectedColor);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-sm">
      <div 
        className="relative w-full max-w-4xl bg-neutral-950 border border-neutral-800 rounded-xl overflow-hidden shadow-2xl my-auto animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          id="close-product-modal-btn"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-neutral-900/80 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-full transition-colors border border-neutral-700"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          
          {/* Left: Gallery */}
          <div className="bg-neutral-900 flex flex-col justify-between p-4 border-b md:border-b-0 md:border-r border-neutral-800">
            <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-neutral-950 mb-3">
              <img
                src={product.images[activeImageIndex] || product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover object-center"
                referrerPolicy="no-referrer"
              />
              {product.isLimitedRun && (
                <div className="absolute top-3 left-3 bg-neutral-950/90 text-amber-400 border border-amber-500/30 text-[10px] font-mono font-bold px-2.5 py-1 rounded uppercase tracking-wider">
                  Limited Batch Run
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex items-center space-x-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    id={`modal-thumb-${idx}`}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-16 h-16 rounded overflow-hidden border-2 transition-all ${
                      activeImageIndex === idx ? 'border-white scale-105' : 'border-neutral-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="Thumbnail" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Info & Purchase Controls */}
          <div className="p-6 sm:p-8 flex flex-col justify-between max-h-[85vh] overflow-y-auto">
            <div>
              {/* Category & Rating */}
              <div className="flex items-center justify-between text-xs font-mono text-neutral-400 mb-2">
                <span className="uppercase tracking-wider">{product.category} // ARCHIVE</span>
                <div className="flex items-center space-x-1 text-amber-400">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span className="font-bold">{product.rating}</span>
                  <span className="text-neutral-500">({product.reviewsCount} verified reviews)</span>
                </div>
              </div>

              {/* Title */}
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-2 font-display">
                {product.name}
              </h2>

              {/* Price */}
              <div className="flex items-center space-x-3 mb-4">
                <span className="text-xl font-mono font-bold text-white">
                  {formatPrice(product.price, currency)}
                </span>
                {product.originalPrice && (
                  <span className="text-sm font-mono line-through text-neutral-500">
                    {formatPrice(product.originalPrice, currency)}
                  </span>
                )}
                {product.fabricGsm && (
                  <span className="text-[11px] font-mono text-neutral-300 bg-neutral-900 border border-neutral-800 px-2 py-0.5 rounded">
                    {product.fabricGsm}
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-sm text-neutral-300 leading-relaxed mb-6 font-normal">
                {product.description}
              </p>

              {/* Color Selection */}
              <div className="mb-5">
                <div className="flex items-center justify-between text-xs font-mono mb-2">
                  <span className="text-neutral-400 uppercase">COLOR:</span>
                  <span className="text-white font-medium">{selectedColor}</span>
                </div>
                <div className="flex items-center space-x-2">
                  {product.colors.map((c) => (
                    <button
                      key={c.name}
                      id={`modal-color-${c.name.replace(/\s+/g, '-').toLowerCase()}`}
                      onClick={() => setSelectedColor(c.name)}
                      className={`flex items-center space-x-2 px-3 py-1.5 rounded border text-xs font-mono transition-all ${
                        selectedColor === c.name
                          ? 'border-white bg-neutral-900 text-white'
                          : 'border-neutral-800 text-neutral-400 hover:border-neutral-700'
                      }`}
                    >
                      <span 
                        className="w-3 h-3 rounded-full border border-neutral-700" 
                        style={{ backgroundColor: c.hex }} 
                      />
                      <span>{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Selection */}
              <div className="mb-6">
                <div className="flex items-center justify-between text-xs font-mono mb-2">
                  <span className="text-neutral-400 uppercase">SIZE:</span>
                  <button
                    id="toggle-size-guide-btn"
                    onClick={() => setShowSizeGuide(!showSizeGuide)}
                    className="text-neutral-300 hover:text-white underline flex items-center space-x-1"
                  >
                    <Ruler className="w-3.5 h-3.5" />
                    <span>{showSizeGuide ? 'Hide Measurements' : 'Size Chart'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                  {product.sizes.map((sz) => (
                    <button
                      key={sz}
                      id={`modal-size-btn-${sz}`}
                      onClick={() => setSelectedSize(sz)}
                      className={`py-2 rounded text-xs font-mono font-bold transition-all border ${
                        selectedSize === sz
                          ? 'bg-white text-neutral-950 border-white shadow'
                          : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:border-neutral-700'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>

                {/* Sizing & Measurement Table Drawer */}
                {showSizeGuide && (
                  <div className="mt-3 p-3 bg-neutral-900 border border-neutral-800 rounded text-[11px] font-mono text-neutral-300">
                    <div className="font-bold text-white mb-1.5 uppercase">Garment Specs (Inches)</div>
                    <div className="grid grid-cols-4 gap-2 border-b border-neutral-800 pb-1 text-neutral-500 font-semibold">
                      <span>Size</span>
                      <span>Chest</span>
                      <span>Length</span>
                      <span>Sleeve</span>
                    </div>
                    <div className="space-y-1 pt-1">
                      <div className="grid grid-cols-4 gap-2"><span>S</span><span>24.5"</span><span>28.0"</span><span>24.0"</span></div>
                      <div className="grid grid-cols-4 gap-2"><span>M</span><span>25.5"</span><span>28.5"</span><span>24.5"</span></div>
                      <div className="grid grid-cols-4 gap-2"><span>L</span><span>26.5"</span><span>29.0"</span><span>25.0"</span></div>
                      <div className="grid grid-cols-4 gap-2"><span>XL</span><span>27.5"</span><span>29.5"</span><span>25.5"</span></div>
                    </div>
                    <div className="text-[10px] text-neutral-400 mt-2 italic">
                      *Model is 6'1" / 185cm wearing size L. Boxy relaxed drape.
                    </div>
                  </div>
                )}
              </div>

              {/* Garment Details Bullet list */}
              <div className="mb-6 pt-4 border-t border-neutral-900">
                <div className="text-xs font-mono text-neutral-400 uppercase mb-2">Material &amp; Craft Details:</div>
                <ul className="space-y-1.5 text-xs text-neutral-300 font-mono">
                  {product.details.map((detail, i) => (
                    <li key={i} className="flex items-start space-x-2">
                      <span className="text-amber-400 mt-0.5">•</span>
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-neutral-900 space-y-3">
              <div className="flex items-center space-x-3">
                <button
                  id="modal-add-to-bag-btn"
                  onClick={handleAdd}
                  disabled={isAdded}
                  className={`flex-1 py-3.5 px-6 rounded font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                    isAdded
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white text-neutral-950 hover:bg-neutral-200'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Added to Bag</span>
                    </>
                  ) : (
                    <span>Add to Bag • {selectedSize} • {formatPrice(product.price, currency)}</span>
                  )}
                </button>

                <button
                  id="modal-wishlist-toggle-btn"
                  onClick={() => onToggleWishlist(product.id)}
                  className={`p-3.5 rounded border transition-colors ${
                    isWishlisted 
                      ? 'border-rose-600 bg-rose-950/40 text-rose-400' 
                      : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white'
                  }`}
                  aria-label="Wishlist toggle"
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                </button>
              </div>

              {/* Assurance badges */}
              <div className="grid grid-cols-3 gap-2 pt-2 text-[10px] font-mono text-neutral-500 text-center">
                <div className="flex items-center justify-center space-x-1">
                  <Truck className="w-3 h-3 text-neutral-400" />
                  <span>Complimentary Shipping</span>
                </div>
                <div className="flex items-center justify-center space-x-1">
                  <RefreshCw className="w-3 h-3 text-neutral-400" />
                  <span>14-Day Returns</span>
                </div>
                <div className="flex items-center justify-center space-x-1">
                  <ShieldCheck className="w-3 h-3 text-neutral-400" />
                  <span>Authentic Garment</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Product, Currency } from '../types';
import { formatPrice } from '../utils/format';
import { X, Trash2, ShoppingBag, Heart } from 'lucide-react';

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  wishlistProducts: Product[];
  currency: Currency;
  onRemove: (productId: string) => void;
  onMoveToBag: (product: Product) => void;
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({
  isOpen,
  onClose,
  wishlistProducts,
  currency,
  onRemove,
  onMoveToBag
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm">
      <div 
        className="w-full max-w-md bg-neutral-950 border-l border-neutral-800 h-full flex flex-col animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Heart className="w-4 h-4 text-rose-500 fill-current" />
            <h3 className="font-bold text-base text-white tracking-wide uppercase font-display">
              Saved Pieces ({wishlistProducts.length})
            </h3>
          </div>
          <button
            id="close-wishlist-btn"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {wishlistProducts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-neutral-500">
              <Heart className="w-12 h-12 mb-3 text-neutral-700 stroke-1" />
              <p className="text-sm font-mono text-neutral-400 mb-2 uppercase">Your Wishlist Is Empty</p>
              <p className="text-xs text-neutral-500 max-w-xs">
                Save garments you want to track across drops and collection releases.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {wishlistProducts.map((p) => (
                <div 
                  key={p.id}
                  id={`wishlist-item-${p.id}`}
                  className="flex items-center space-x-3 p-3 rounded-lg bg-neutral-900 border border-neutral-800"
                >
                  <img
                    src={p.images[0]}
                    alt={p.name}
                    className="w-18 h-18 rounded object-cover bg-neutral-950 flex-shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-mono text-neutral-500 uppercase">{p.category}</div>
                    <h4 className="text-xs font-bold text-white truncate">{p.name}</h4>
                    <div className="text-xs font-mono text-neutral-300 mt-1">
                      {formatPrice(p.price, currency)}
                    </div>
                    <button
                      id={`wishlist-move-btn-${p.id}`}
                      onClick={() => onMoveToBag(p)}
                      className="mt-2 text-[11px] font-mono text-neutral-200 hover:text-white flex items-center space-x-1 underline"
                    >
                      <ShoppingBag className="w-3 h-3" />
                      <span>Select Size &amp; Add</span>
                    </button>
                  </div>
                  <button
                    id={`wishlist-delete-btn-${p.id}`}
                    onClick={() => onRemove(p.id)}
                    className="p-2 text-neutral-500 hover:text-rose-400 transition-colors"
                    aria-label="Remove from wishlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { CartItem, Currency } from '../types';
import { formatPrice } from '../utils/format';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, Tag, ShieldCheck } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  currency: Currency;
  onUpdateQuantity: (cartItemId: string, delta: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onOpenCheckout: (discountPercent: number) => void;
}

const FREE_SHIPPING_THRESHOLD_USD = 200;

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  currency,
  onUpdateQuantity,
  onRemoveItem,
  onOpenCheckout
}) => {
  if (!isOpen) return null;

  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');

  // Subtotal calculation
  const subtotalUSD = cartItems.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );

  const discountUSD = (subtotalUSD * appliedDiscount) / 100;
  const isFreeShipping = subtotalUSD >= FREE_SHIPPING_THRESHOLD_USD;
  const shippingUSD = isFreeShipping || subtotalUSD === 0 ? 0 : 20;
  const totalUSD = subtotalUSD - discountUSD + shippingUSD;

  const freeShippingDifference = Math.max(0, FREE_SHIPPING_THRESHOLD_USD - subtotalUSD);
  const freeShippingProgress = Math.min(100, (subtotalUSD / FREE_SHIPPING_THRESHOLD_USD) * 100);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError('');
    setPromoSuccess('');
    
    if (promoCode.trim().toUpperCase() === 'LORD10') {
      setAppliedDiscount(10);
      setPromoSuccess('10% VIP discount applied!');
    } else if (promoCode.trim().toUpperCase() === 'ARCHIVE20') {
      setAppliedDiscount(20);
      setPromoSuccess('20% Archival discount applied!');
    } else {
      setPromoError('Invalid code. Try "LORD10"');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm">
      <div 
        className="w-full max-w-md bg-neutral-950 border-l border-neutral-800 h-full flex flex-col animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="w-5 h-5 text-white" />
            <h3 className="font-bold text-base text-white tracking-wide uppercase font-display">
              Shopping Bag ({cartItems.reduce((a, b) => a + b.quantity, 0)})
            </h3>
          </div>
          <button
            id="close-cart-btn"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded transition-colors"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Tracker */}
        <div className="bg-neutral-900/90 px-5 py-3 border-b border-neutral-800 text-xs font-mono">
          <div className="flex items-center justify-between mb-1.5 text-neutral-300">
            {isFreeShipping ? (
              <span className="text-emerald-400 font-bold flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Complimentary Shipping Unlocked</span>
              </span>
            ) : (
              <span>
                Add <strong className="text-white">{formatPrice(freeShippingDifference, currency)}</strong> more for free worldwide delivery
              </span>
            )}
            <span className="text-neutral-500">{Math.round(freeShippingProgress)}%</span>
          </div>
          <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${isFreeShipping ? 'bg-emerald-400' : 'bg-white'}`}
              style={{ width: `${freeShippingProgress}%` }}
            />
          </div>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-5">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-neutral-500">
              <ShoppingBag className="w-12 h-12 mb-3 text-neutral-700 stroke-1" />
              <p className="text-sm font-mono text-neutral-300 mb-2 uppercase font-bold">Your Bag Is Empty</p>
              <p className="text-xs text-neutral-500 max-w-xs mb-6">
                Explore the latest Collection 04 drop and secure your limited garments before allocations expire.
              </p>
              <button
                id="cart-empty-explore-btn"
                onClick={onClose}
                className="px-6 py-2.5 bg-white text-neutral-950 font-bold text-xs uppercase tracking-wider rounded hover:bg-neutral-200 transition-colors"
              >
                Browse Collection
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div 
                  key={item.id}
                  id={`cart-item-${item.id}`}
                  className="flex space-x-3 p-3 rounded-lg bg-neutral-900 border border-neutral-800"
                >
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-20 h-24 rounded object-cover bg-neutral-950 flex-shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between">
                        <h4 className="text-xs font-bold text-white truncate pr-2 font-display">
                          {item.product.name}
                        </h4>
                        <button
                          id={`cart-remove-${item.id}`}
                          onClick={() => onRemoveItem(item.id)}
                          className="text-neutral-500 hover:text-rose-400 p-0.5"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-[11px] font-mono text-neutral-400 mt-0.5 space-x-2">
                        <span>Size: <strong className="text-neutral-200">{item.selectedSize}</strong></span>
                        <span>•</span>
                        <span>{item.selectedColor}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-neutral-800/80">
                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-2 bg-neutral-950 border border-neutral-800 rounded px-1.5 py-0.5">
                        <button
                          id={`qty-minus-${item.id}`}
                          onClick={() => onUpdateQuantity(item.id, -1)}
                          className="text-neutral-400 hover:text-white p-0.5"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-mono font-bold text-white px-1">
                          {item.quantity}
                        </span>
                        <button
                          id={`qty-plus-${item.id}`}
                          onClick={() => onUpdateQuantity(item.id, 1)}
                          className="text-neutral-400 hover:text-white p-0.5"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Line Item Total */}
                      <div className="text-xs font-mono font-bold text-white">
                        {formatPrice(item.product.price * item.quantity, currency)}
                      </div>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer with Totals & Checkout */}
        {cartItems.length > 0 && (
          <div className="p-5 border-t border-neutral-800 bg-neutral-950 space-y-4">
            
            {/* Promo code form */}
            <form onSubmit={handleApplyPromo} className="flex space-x-2">
              <div className="relative flex-1">
                <Tag className="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-2.5" />
                <input
                  id="promo-code-input"
                  type="text"
                  placeholder="Promo code (e.g. LORD10)"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded px-2.5 pl-8 py-2 text-xs font-mono text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-600 uppercase"
                />
              </div>
              <button
                id="apply-promo-btn"
                type="submit"
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-xs font-mono text-white rounded font-medium cursor-pointer"
              >
                Apply
              </button>
            </form>

            {promoSuccess && (
              <div className="text-[11px] font-mono text-emerald-400">{promoSuccess}</div>
            )}
            {promoError && (
              <div className="text-[11px] font-mono text-rose-400">{promoError}</div>
            )}

            {/* Calculations Breakdown */}
            <div className="space-y-1.5 text-xs font-mono border-t border-neutral-900 pt-3">
              <div className="flex justify-between text-neutral-400">
                <span>Subtotal</span>
                <span>{formatPrice(subtotalUSD, currency)}</span>
              </div>
              {appliedDiscount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>VIP Discount ({appliedDiscount}%)</span>
                  <span>-{formatPrice(discountUSD, currency)}</span>
                </div>
              )}
              <div className="flex justify-between text-neutral-400">
                <span>Shipping</span>
                <span>
                  {isFreeShipping ? (
                    <span className="text-emerald-400 font-bold uppercase">Free</span>
                  ) : (
                    formatPrice(shippingUSD, currency)
                  )}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-neutral-800">
                <span>Estimated Total</span>
                <span>{formatPrice(totalUSD, currency)}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              id="cart-proceed-checkout-btn"
              onClick={() => onOpenCheckout(appliedDiscount)}
              className="w-full py-4 bg-white text-neutral-950 font-extrabold text-xs uppercase tracking-widest hover:bg-neutral-200 rounded transition-all flex items-center justify-center space-x-2 shadow-lg shadow-black/40 cursor-pointer active:scale-98"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center text-[10px] font-mono text-neutral-500">
              Tax calculated during checkout • SSL Encrypted 256-bit
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

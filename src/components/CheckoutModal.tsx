import React, { useState } from 'react';
import { CartItem, Currency } from '../types';
import { formatPrice } from '../utils/format';
import { X, CheckCircle2, ShieldCheck, Truck, CreditCard, Lock } from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  currency: Currency;
  discountPercent: number;
  onOrderSuccess: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  currency,
  discountPercent,
  onOrderSuccess
}) => {
  if (!isOpen) return null;

  const [step, setStep] = useState<'form' | 'success'>('form');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  // Form states
  const [email, setEmail] = useState('collector@lordknows.studio');
  const [firstName, setFirstName] = useState('Alex');
  const [lastName, setLastName] = useState('Vance');
  const [address, setAddress] = useState('442 Broadway, Floor 4');
  const [city, setCity] = useState('New York');
  const [country, setCountry] = useState('United States');
  const [postalCode, setPostalCode] = useState('10013');
  const [cardNumber, setCardNumber] = useState('•••• •••• •••• 4242');
  const [cardExp, setCardExp] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('884');

  const subtotalUSD = cartItems.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );
  const discountUSD = (subtotalUSD * discountPercent) / 100;
  const isFreeShipping = subtotalUSD >= 200;
  const shippingUSD = isFreeShipping ? 0 : 20;
  const totalUSD = subtotalUSD - discountUSD + shippingUSD;

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      const generatedOrder = `LK-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      setOrderNumber(generatedOrder);
      setIsSubmitting(false);
      setStep('success');
      onOrderSuccess();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-black/85 backdrop-blur-md">
      <div 
        className="relative w-full max-w-2xl bg-neutral-950 border border-neutral-800 rounded-xl overflow-hidden shadow-2xl my-auto animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="font-display font-black text-lg text-white uppercase tracking-tight">
              Lord Knows
            </span>
            <span className="text-[10px] font-mono bg-neutral-900 border border-neutral-700 text-neutral-300 px-2 py-0.5 rounded">
              EXPRESS CHECKOUT
            </span>
          </div>
          <button
            id="checkout-close-btn"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === 'form' ? (
          <form onSubmit={handleSubmitOrder} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
            
            {/* Order Brief */}
            <div className="bg-neutral-900/60 border border-neutral-800 rounded-lg p-4">
              <div className="flex justify-between items-center text-xs font-mono text-neutral-300 mb-2">
                <span>{cartItems.length} Garment Item(s) Selected</span>
                <span className="font-bold text-white">{formatPrice(totalUSD, currency)}</span>
              </div>
              <div className="flex -space-x-2 overflow-hidden py-1">
                {cartItems.map((item) => (
                  <img
                    key={item.id}
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="inline-block h-10 w-10 rounded-md ring-2 ring-neutral-950 object-cover"
                    referrerPolicy="no-referrer"
                  />
                ))}
              </div>
            </div>

            {/* Contact & Shipping */}
            <div>
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-400 mb-3 flex items-center space-x-1.5">
                <Truck className="w-4 h-4 text-white" />
                <span>Shipping Destination</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                <div className="sm:col-span-2">
                  <label className="block text-neutral-400 text-[10px] mb-1">EMAIL FOR DISPATCH TRACKING</label>
                  <input
                    id="checkout-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-2 text-white focus:outline-none focus:border-white"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 text-[10px] mb-1">FIRST NAME</label>
                  <input
                    id="checkout-firstname"
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-2 text-white focus:outline-none focus:border-white"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 text-[10px] mb-1">LAST NAME</label>
                  <input
                    id="checkout-lastname"
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-2 text-white focus:outline-none focus:border-white"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-neutral-400 text-[10px] mb-1">STREET ADDRESS</label>
                  <input
                    id="checkout-address"
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-2 text-white focus:outline-none focus:border-white"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 text-[10px] mb-1">CITY</label>
                  <input
                    id="checkout-city"
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-2 text-white focus:outline-none focus:border-white"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 text-[10px] mb-1">POSTAL CODE</label>
                  <input
                    id="checkout-postal"
                    type="text"
                    required
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-2 text-white focus:outline-none focus:border-white"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-neutral-400 text-[10px] mb-1">COUNTRY / REGION</label>
                  <select
                    id="checkout-country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-2 text-white focus:outline-none focus:border-white"
                  >
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Canada">Canada</option>
                    <option value="Germany">Germany</option>
                    <option value="France">France</option>
                    <option value="Japan">Japan</option>
                    <option value="Australia">Australia</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div>
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-400 mb-3 flex items-center space-x-1.5">
                <CreditCard className="w-4 h-4 text-white" />
                <span>Payment Method (256-bit Secure)</span>
              </h4>
              <div className="p-4 bg-neutral-900/60 border border-neutral-800 rounded-lg space-y-3 text-xs font-mono">
                <div>
                  <label className="block text-neutral-400 text-[10px] mb-1">CARD NUMBER</label>
                  <div className="relative">
                    <input
                      id="checkout-card-num"
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-white focus:outline-none focus:border-white"
                    />
                    <Lock className="w-3.5 h-3.5 text-neutral-500 absolute right-3 top-3" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-neutral-400 text-[10px] mb-1">EXPIRATION (MM/YY)</label>
                    <input
                      id="checkout-card-exp"
                      type="text"
                      value={cardExp}
                      onChange={(e) => setCardExp(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-white focus:outline-none focus:border-white"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-400 text-[10px] mb-1">SECURITY CODE (CVC)</label>
                    <input
                      id="checkout-card-cvc"
                      type="text"
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-white focus:outline-none focus:border-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Order Action */}
            <div className="pt-2">
              <button
                id="submit-order-btn"
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-white text-neutral-950 font-bold text-xs uppercase tracking-widest hover:bg-neutral-200 rounded transition-all cursor-pointer shadow-lg shadow-black/50 active:scale-98 flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <span>Authorizing Payment &amp; Reserving Units...</span>
                ) : (
                  <span>Authorize &amp; Complete Order • {formatPrice(totalUSD, currency)}</span>
                )}
              </button>
              <div className="flex items-center justify-center space-x-2 mt-3 text-[10px] font-mono text-neutral-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Protected by Lord Knows Secure Checkout Guarantee</span>
              </div>
            </div>

          </form>
        ) : (
          /* Order Confirmation Screen */
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-emerald-950/80 border border-emerald-600/40 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <div className="text-xs font-mono text-amber-400 uppercase tracking-widest mb-1">
                Allocation Confirmed
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-white uppercase font-display">
                Order Received
              </h3>
              <p className="text-xs font-mono text-neutral-400 mt-2">
                Order Reference: <strong className="text-white">{orderNumber}</strong>
              </p>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-5 text-left text-xs font-mono space-y-2 max-w-md mx-auto">
              <div className="flex justify-between">
                <span className="text-neutral-500">Dispatched To:</span>
                <span className="text-white">{firstName} {lastName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Destination:</span>
                <span className="text-white">{city}, {country}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Confirmation Sent To:</span>
                <span className="text-white">{email}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-neutral-800 text-sm font-bold">
                <span className="text-white">Amount Paid:</span>
                <span className="text-emerald-400">{formatPrice(totalUSD, currency)}</span>
              </div>
            </div>

            <p className="text-xs text-neutral-400 max-w-sm mx-auto">
              Your garments are currently staged for hand-inspection in our studio. 
              You will receive automated tracking information upon courier handover.
            </p>

            <button
              id="close-confirmation-btn"
              onClick={onClose}
              className="px-8 py-3 bg-white text-neutral-950 font-bold text-xs uppercase tracking-widest rounded hover:bg-neutral-200 transition-colors"
            >
              Return to Storefront
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

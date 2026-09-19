import React, { useState } from 'react';
import { ShoppingBag, Heart, Search, X, Globe, Menu } from 'lucide-react';
import { Currency } from '../types';

interface NavbarProps {
  currency: Currency;
  onCurrencyChange: (c: Currency) => void;
  cartCount: number;
  wishlistCount: number;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeSection: string;
  onNavigate: (section: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currency,
  onCurrencyChange,
  cartCount,
  wishlistCount,
  onOpenCart,
  onOpenWishlist,
  searchQuery,
  onSearchChange,
  onNavigate
}) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-neutral-950/90 backdrop-blur-md border-b border-neutral-900">
      {/* Top Banner Marquee */}
      <div className="bg-neutral-900 border-b border-neutral-800 text-[11px] font-mono tracking-widest text-neutral-300 py-1.5 px-4 text-center overflow-hidden">
        <div className="inline-flex items-center space-x-6 animate-pulse">
          <span>WORLDWIDE COMPLIMENTARY SHIPPING OVER $200</span>
          <span>•</span>
          <span className="text-amber-400 font-semibold">DROP 04 // LIVE</span>
          <span>•</span>
          <span>LIMITED UNITS CRAFTED IN PORTUGAL</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          
          {/* Mobile Menu Button */}
          <div className="flex items-center lg:hidden">
            <button
              id="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-neutral-400 hover:text-white transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Brand Wordmark */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onNavigate('shop')}>
            <div className="text-left">
              <span className="font-display text-2xl sm:text-3xl font-extrabold tracking-tighter text-white uppercase block leading-none">
                Lord Knows
              </span>
              <span className="text-[9px] font-mono tracking-[0.3em] text-neutral-400 uppercase">
                Studio Apparel
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-8 text-xs uppercase tracking-widest font-semibold text-neutral-300">
            <button
              id="nav-shop-btn"
              onClick={() => onNavigate('shop')}
              className="hover:text-white transition-colors cursor-pointer py-1 border-b-2 border-transparent hover:border-white"
            >
              Collection
            </button>
            <button
              id="nav-lookbook-btn"
              onClick={() => onNavigate('lookbook')}
              className="hover:text-white transition-colors cursor-pointer py-1 border-b-2 border-transparent hover:border-white"
            >
              Lookbook
            </button>
            <button
              id="nav-manifesto-btn"
              onClick={() => onNavigate('about')}
              className="hover:text-white transition-colors cursor-pointer py-1 border-b-2 border-transparent hover:border-white"
            >
              Ethos
            </button>
            <button
              id="nav-vip-btn"
              onClick={() => onNavigate('vip')}
              className="hover:text-amber-400 text-neutral-400 transition-colors cursor-pointer py-1"
            >
              VIP Drops
            </button>
          </nav>

          {/* Right Action Icons & Currency */}
          <div className="flex items-center space-x-4">
            
            {/* Search Toggle */}
            <div className="relative">
              {isSearchOpen ? (
                <div className="flex items-center bg-neutral-900 border border-neutral-700 rounded-md px-2.5 py-1">
                  <Search className="w-3.5 h-3.5 text-neutral-400 mr-2" />
                  <input
                    id="navbar-search-input"
                    type="text"
                    placeholder="Search garments..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    autoFocus
                    className="bg-transparent text-xs text-white placeholder-neutral-500 focus:outline-none w-32 sm:w-48"
                  />
                  <button
                    id="close-search-btn"
                    onClick={() => {
                      setIsSearchOpen(false);
                      onSearchChange('');
                    }}
                    className="text-neutral-400 hover:text-white ml-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  id="open-search-btn"
                  onClick={() => setIsSearchOpen(true)}
                  className="p-2 text-neutral-300 hover:text-white transition-colors"
                  aria-label="Search garments"
                >
                  <Search className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Currency Selector */}
            <div className="hidden sm:flex items-center space-x-1 border border-neutral-800 rounded px-2 py-1 bg-neutral-900/60 text-[11px] font-mono text-neutral-300">
              <Globe className="w-3 h-3 text-neutral-400" />
              <select
                id="currency-selector"
                value={currency}
                onChange={(e) => onCurrencyChange(e.target.value as Currency)}
                className="bg-transparent text-neutral-200 focus:outline-none cursor-pointer pr-1"
                aria-label="Select currency"
              >
                <option value="USD" className="bg-neutral-900 text-white">USD ($)</option>
                <option value="EUR" className="bg-neutral-900 text-white">EUR (€)</option>
                <option value="GBP" className="bg-neutral-900 text-white">GBP (£)</option>
                <option value="JPY" className="bg-neutral-900 text-white">JPY (¥)</option>
              </select>
            </div>

            {/* Wishlist Button */}
            <button
              id="wishlist-toggle-btn"
              onClick={onOpenWishlist}
              className="relative p-2 text-neutral-300 hover:text-white transition-colors"
              aria-label="View wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-neutral-800 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center border border-neutral-700">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button
              id="cart-toggle-btn"
              onClick={onOpenCart}
              className="relative p-2 bg-neutral-100 text-neutral-950 hover:bg-white rounded font-medium flex items-center space-x-2 transition-transform active:scale-95"
              aria-label="View shopping bag"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="text-xs font-mono font-bold tracking-wider">
                BAG ({cartCount})
              </span>
            </button>
          </div>

        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-neutral-900 py-4 space-y-3">
            <button
              id="mobile-nav-collection"
              onClick={() => {
                onNavigate('shop');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left px-3 py-2 text-sm font-semibold tracking-wider uppercase text-neutral-200 hover:bg-neutral-900 rounded"
            >
              Collection
            </button>
            <button
              id="mobile-nav-lookbook"
              onClick={() => {
                onNavigate('lookbook');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left px-3 py-2 text-sm font-semibold tracking-wider uppercase text-neutral-200 hover:bg-neutral-900 rounded"
            >
              Lookbook
            </button>
            <button
              id="mobile-nav-about"
              onClick={() => {
                onNavigate('about');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left px-3 py-2 text-sm font-semibold tracking-wider uppercase text-neutral-200 hover:bg-neutral-900 rounded"
            >
              Ethos & Craft
            </button>
            <button
              id="mobile-nav-vip"
              onClick={() => {
                onNavigate('vip');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left px-3 py-2 text-sm font-semibold tracking-wider uppercase text-amber-400 hover:bg-neutral-900 rounded"
            >
              VIP Drops
            </button>
            <div className="pt-2 border-t border-neutral-900 flex items-center justify-between px-3">
              <span className="text-xs text-neutral-400">Currency:</span>
              <select
                id="mobile-currency-selector"
                value={currency}
                onChange={(e) => onCurrencyChange(e.target.value as Currency)}
                className="bg-neutral-900 text-xs text-neutral-200 border border-neutral-700 rounded px-2 py-1"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="JPY">JPY (¥)</option>
              </select>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

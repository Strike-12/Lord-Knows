import { useState, useMemo, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { ProductFilters } from './components/ProductFilters';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { WishlistDrawer } from './components/WishlistDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { LookbookSection } from './components/LookbookSection';
import { BrandManifesto } from './components/BrandManifesto';
import { DropNewsletter } from './components/DropNewsletter';
import { Footer } from './components/Footer';
import { Toast, ToastMessage } from './components/Toast';
import { PRODUCTS } from './data/products';
import { Product, ProductCategory, ProductSize, CartItem, Currency } from './types';

export function App() {
  // Navigation
  const [activeSection, setActiveSection] = useState('shop');
  
  // Currency
  const [currency, setCurrency] = useState<Currency>(() => {
    return (localStorage.getItem('lk_currency') as Currency) || 'USD';
  });

  // Cart State
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('lk_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Wishlist State
  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('lk_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

  // Product Selection & Modal
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Checkout Modal
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [appliedCheckoutDiscount, setAppliedCheckoutDiscount] = useState(0);

  // Filters & Search
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');

  // Notification Toast
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Persist Cart
  useEffect(() => {
    localStorage.setItem('lk_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Persist Wishlist
  useEffect(() => {
    localStorage.setItem('lk_wishlist', JSON.stringify(wishlistIds));
  }, [wishlistIds]);

  // Persist Currency
  useEffect(() => {
    localStorage.setItem('lk_currency', currency);
  }, [currency]);

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    let list = [...PRODUCTS];

    // Category filter
    if (selectedCategory !== 'all') {
      list = list.filter((p) => p.category === selectedCategory);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query) ||
          (p.fabricGsm && p.fabricGsm.toLowerCase().includes(query))
      );
    }

    // Sorting
    if (sortBy === 'price-asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    }

    return list;
  }, [selectedCategory, searchQuery, sortBy]);

  // Cart operations
  const handleAddToCart = (product: Product, size: ProductSize, color: string) => {
    const itemKey = `${product.id}-${size}-${color}`;
    
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === itemKey);
      if (existing) {
        return prev.map((item) =>
          item.id === itemKey ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        {
          id: itemKey,
          product,
          selectedSize: size,
          selectedColor: color,
          quantity: 1
        }
      ];
    });

    setToast({
      id: String(Date.now()),
      type: 'cart',
      title: 'Added to Bag',
      subtitle: `${product.name} • ${size} • ${color}`
    });
  };

  const handleUpdateQuantity = (cartItemId: string, delta: number) => {
    setCartItems((prev) => {
      return prev
        .map((item) => {
          if (item.id === cartItemId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const handleRemoveItem = (cartItemId: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== cartItemId));
  };

  // Wishlist operations
  const handleToggleWishlist = (productId: string) => {
    setWishlistIds((prev) => {
      const exists = prev.includes(productId);
      const updated = exists ? prev.filter((id) => id !== productId) : [...prev, productId];
      
      const product = PRODUCTS.find((p) => p.id === productId);
      if (!exists && product) {
        setToast({
          id: String(Date.now()),
          type: 'wishlist',
          title: 'Saved to Wishlist',
          subtitle: product.name
        });
      }
      return updated;
    });
  };

  const wishlistProducts = useMemo(() => {
    return PRODUCTS.filter((p) => wishlistIds.includes(p.id));
  }, [wishlistIds]);

  const handleOpenDetail = (product: Product) => {
    setSelectedProduct(product);
    setIsDetailOpen(true);
  };

  const handleOpenCheckout = (discount: number) => {
    setAppliedCheckoutDiscount(discount);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleOrderSuccess = () => {
    setCartItems([]);
    setToast({
      id: String(Date.now()),
      type: 'info',
      title: 'Order Confirmed',
      subtitle: 'Dispatch notifications will be transmitted via email.'
    });
  };

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    if (sectionId === 'shop') {
      const el = document.getElementById('collection-grid');
      el?.scrollIntoView({ behavior: 'smooth' });
    } else {
      const el = document.getElementById(sectionId);
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col selection:bg-neutral-100 selection:text-neutral-900">
      
      {/* Navigation */}
      <Navbar
        currency={currency}
        onCurrencyChange={setCurrency}
        cartCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)}
        wishlistCount={wishlistIds.length}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeSection={activeSection}
        onNavigate={scrollToSection}
      />

      {/* Hero Section */}
      <HeroBanner
        onExploreClick={() => scrollToSection('shop')}
        onLookbookClick={() => scrollToSection('lookbook')}
      />

      {/* Sticky Filter & Category Bar */}
      <ProductFilters
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        sortBy={sortBy}
        onSortChange={setSortBy}
        totalProducts={filteredProducts.length}
      />

      {/* Main Collection Grid */}
      <main id="collection-grid" className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        
        {/* Active Search / Category Indicator */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between mb-8 pb-4 border-b border-neutral-900 gap-2">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-white font-display">
              {selectedCategory === 'all' ? 'Drop 04 // Complete Allocation' : `${selectedCategory} Collection`}
            </h2>
            {searchQuery && (
              <p className="text-xs font-mono text-neutral-400 mt-1">
                Showing results matching query <span className="text-white">"{searchQuery}"</span>
              </p>
            )}
          </div>
          <div className="text-xs font-mono text-neutral-500">
            ALL GARMENTS CUT &amp; SEWN TO SPECIFICATION
          </div>
        </div>

        {/* Product Cards Grid */}
        {filteredProducts.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-base font-mono text-neutral-400 mb-2 uppercase">No Garments Found</p>
            <p className="text-xs text-neutral-500 mb-6">
              No pieces match your selected category or query filter.
            </p>
            <button
              id="reset-filters-btn"
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="px-6 py-2.5 bg-neutral-900 border border-neutral-700 hover:bg-neutral-800 text-xs font-mono uppercase text-white rounded transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                currency={currency}
                isWishlisted={wishlistIds.includes(product.id)}
                onToggleWishlist={handleToggleWishlist}
                onQuickView={handleOpenDetail}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        )}

      </main>

      {/* Lookbook Gallery */}
      <LookbookSection
        currency={currency}
        onSelectProduct={handleOpenDetail}
      />

      {/* Brand Craft Manifesto */}
      <BrandManifesto />

      {/* Early Access VIP Drops Dispatch */}
      <DropNewsletter />

      {/* Footer */}
      <Footer onNavigate={scrollToSection} />

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={isDetailOpen}
        currency={currency}
        isWishlisted={selectedProduct ? wishlistIds.includes(selectedProduct.id) : false}
        onClose={() => setIsDetailOpen(false)}
        onToggleWishlist={handleToggleWishlist}
        onAddToCart={handleAddToCart}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        currency={currency}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onOpenCheckout={handleOpenCheckout}
      />

      {/* Wishlist Drawer */}
      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlistProducts={wishlistProducts}
        currency={currency}
        onRemove={handleToggleWishlist}
        onMoveToBag={(product) => {
          setIsWishlistOpen(false);
          handleOpenDetail(product);
        }}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        currency={currency}
        discountPercent={appliedCheckoutDiscount}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* Quick Action Toast */}
      <Toast toast={toast} onDismiss={() => setToast(null)} />

    </div>
  );
}
export default App;

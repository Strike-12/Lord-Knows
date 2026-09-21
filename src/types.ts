export type ProductCategory = 
  | 'all'
  | 'hoodies'
  | 'tees'
  | 'outerwear'
  | 'bottoms'
  | 'accessories';

export type ProductSize = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'OS';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  originalPrice?: number;
  description: string;
  details: string[];
  fabricGsm?: string;
  fit: string;
  sizes: ProductSize[];
  colors: {
    name: string;
    hex: string;
  }[];
  images: string[];
  isNewDrop?: boolean;
  isLimitedRun?: boolean;
  stockRemaining?: number;
  rating: number;
  reviewsCount: number;
}

export interface CartItem {
  id: string;
  product: Product;
  selectedSize: ProductSize;
  selectedColor: string;
  quantity: number;
}

export type Currency = 'USD' | 'EUR' | 'GBP' | 'JPY';

export interface LookbookItem {
  id: string;
  title: string;
  subtitle: string;
  season: string;
  image: string;
  taggedProductIds: string[];
}

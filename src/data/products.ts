import { Product, LookbookItem } from '../types';

export const CURRENCY_RATES = {
  USD: { symbol: '$', rate: 1 },
  EUR: { symbol: '€', rate: 0.92 },
  GBP: { symbol: '£', rate: 0.79 },
  JPY: { symbol: '¥', rate: 154 }
};

export const PRODUCTS: Product[] = [
  {
    id: 'lk-01',
    name: 'DIRECTED BY THE LORD Heavyweight Hoodie',
    category: 'hoodies',
    price: 60,
    originalPrice: 75,
    description: '100% dense 500 GSM Portuguese French terry cotton with zero synthetic polyester. Back features heavy 3D raised matte puff print "DIRECTED BY THE LORD" inside a barbed wire box; front features "STAY HUMBLE - LORD KNOWS" with kangaroo pouch.',
    details: [
      '500 GSM 100% Dense Loopback Cotton Terry (Zero Polyester)',
      'Thick 3D raised tactile matte puff print graphic on back',
      'Barbed wire enclosure framing the sacred mantra',
      'Front "STAY HUMBLE - LORD KNOWS" distressed chest print',
      'Pre-shrunk, double-needle coverstitched seams, drop shoulder cut'
    ],
    fabricGsm: '500 GSM French Terry',
    fit: 'Boxy / Heavyweight Dropped Shoulder Oversized Fit',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Obsidian Black', hex: '#121212' },
      { name: 'Vintage Washed Charcoal', hex: '#262626' }
    ],
    images: [
      '/assets/images/directed_lord_hoodie_puff_1789793017180.jpg',
      '/assets/images/heavy_hero_banner_1789792733978.jpg'
    ],
    isNewDrop: true,
    isLimitedRun: true,
    stockRemaining: 18,
    rating: 5.0,
    reviewsCount: 42
  },
  {
    id: 'lk-02',
    name: 'Iced Out Gothic Cross Heather Grey Zip Hoodie',
    category: 'hoodies',
    price: 60,
    description: 'Custom silver metal YKK zip hoodie in thick 500 GSM cotton loopback fleece. Clear diamond crystal glass rhinestones with raised stitched borders forming cursive "LK" on chest and an ornate gothic cross on back.',
    details: [
      '500 GSM 100% Heavy Combed Cotton Fleece',
      'Faceted diamond glass rhinestones with reinforced heat-press backing',
      'Silver heavy gauge YKK metal zipper',
      'Gothic cursive "LK" chest script & large back cross',
      'Heavy ribbed cuffs and waistband'
    ],
    fabricGsm: '500 GSM Heavyweight Cotton',
    fit: 'Boxy Zip-Up Fit',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Heather Ash Grey', hex: '#9ca3af' }
    ],
    images: [
      '/assets/images/ice_cross_rhinestone_zip_1789793048061.jpg'
    ],
    isNewDrop: true,
    isLimitedRun: true,
    stockRemaining: 14,
    rating: 4.9,
    reviewsCount: 31
  },
  {
    id: 'lk-03',
    name: 'Sapphire Crystal Cross Washed Black Zip Hoodie',
    category: 'hoodies',
    price: 60,
    description: 'Deep royal sapphire blue crystal rhinestones on pitch-washed 500 GSM loopback cotton fleece. Left chest cursive "LK" script and large back gothic cross.',
    details: [
      '500 GSM 100% French Terry Cotton',
      'Deep royal sapphire crystal rhinestones & 3D puff embroidery',
      'Silver metal zipper pull and heavy hardware',
      'Drop shoulder vintage streetwear silhouette',
      'Made with zero synthetic sheen'
    ],
    fabricGsm: '500 GSM Loopback Cotton',
    fit: 'Relaxed Streetwear Zip Fit',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Washed Black', hex: '#1c1c1c' }
    ],
    images: [
      '/assets/images/sapphire_zip_rhinestone_1789793059578.jpg'
    ],
    isNewDrop: true,
    isLimitedRun: true,
    stockRemaining: 12,
    rating: 4.9,
    reviewsCount: 27
  },
  {
    id: 'lk-04',
    name: 'Gothic Triple Cross Mineral Wash Tee',
    category: 'tees',
    price: 50,
    description: '300 GSM dense combed cotton with authentic volcanic stone mineral wash. Front arched 3D puff gothic "LORD KNOWS" lettering, back triple gothic crosses with cursive "LK" script.',
    details: [
      '300 GSM 100% Dense Combed Cotton Jersey',
      'Arched gothic 3D raised matte puff print across chest',
      'Back triple gothic cross silhouettes in dimensional puff ink',
      'Sturdy 1.25" single-stitch ribbed collar',
      'Volcanic pumice mineral stone wash finish'
    ],
    fabricGsm: '300 GSM Heavyweight Jersey',
    fit: 'Boxy Vintage Drop-Shoulder Tee',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Vintage Charcoal', hex: '#262626' }
    ],
    images: [
      '/assets/images/triple_cross_puff_tee_1789793027777.jpg'
    ],
    isNewDrop: true,
    stockRemaining: 35,
    rating: 4.8,
    reviewsCount: 56
  },
  {
    id: 'lk-05',
    name: 'Crown of Thorns "God Before All" Tee',
    category: 'tees',
    price: 50,
    description: '300 GSM dry-hand cotton jersey in vintage ash grey. Front chest features 3D puff "LORD KNOWS" in barbed wire motif; back features circular Crown of Thorns graphic with 3D puff "GOD BEFORE ALL".',
    details: [
      '300 GSM Dry-Hand 100% Cotton Jersey',
      '3D raised puff print & dense chain-stitched lettering',
      'Circular Crown of Thorns sacred graphic on back',
      'Distressed enzyme stone-wash fade',
      'Authentic heavy drape with zero polyester shine'
    ],
    fabricGsm: '300 GSM Heavyweight Cotton',
    fit: 'Drop-Shoulder Boxy Tee',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Ash Grey Vintage Wash', hex: '#8a8d8f' }
    ],
    images: [
      '/assets/images/thorns_god_puff_tee_1789793038407.jpg'
    ],
    isNewDrop: true,
    stockRemaining: 28,
    rating: 4.9,
    reviewsCount: 38
  },
  {
    id: 'lk-06',
    name: 'Sapphire Rhinestone Flared Sweatpants',
    category: 'bottoms',
    price: 50,
    description: '100% heavy 480 GSM cotton fleece flared sweatpants. Extra-thick white cotton rope drawstrings with knotted raw ends and royal sapphire blue crystal cursive "Lord" on one leg and "Knows" on the other.',
    details: [
      '480 GSM Heavyweight 100% Cotton Fleece',
      'Chunky white cotton rope drawstrings at elastic waist',
      'Flared wide-leg silhouette that stacks effortlessly on shoes',
      'Royal sapphire blue crystal rhinestones down outer calves',
      'Deep side pockets and rear welt pocket'
    ],
    fabricGsm: '480 GSM Cotton Fleece',
    fit: 'Flared Wide-Leg Stacked Fit',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Obsidian Black', hex: '#111111' }
    ],
    images: [
      '/assets/images/sapphire_flare_sweatpants_1789793069428.jpg'
    ],
    isNewDrop: true,
    isLimitedRun: true,
    stockRemaining: 16,
    rating: 5.0,
    reviewsCount: 34
  },
  {
    id: 'lk-07',
    name: 'Stardust Rhinestone Raw-Hem Shorts',
    category: 'bottoms',
    price: 55,
    description: 'Raw frayed hem 100% cotton fleece sweatshorts. Thick white rope drawstrings with silver metal aglets, scattered crystal rhinestone stardust specks, and raised 3D puff gothic cursive "Lord Knows" on thigh.',
    details: [
      '450 GSM Heavy French Terry Cotton',
      'Chunky white rope drawstrings with metal aglets',
      'Natural raw cut frayed bottom edge',
      'Scattered multi-faceted stardust crystal rhinestones',
      'Gothic cursive "Lord Knows" 3D puff print on thigh'
    ],
    fabricGsm: '450 GSM Cotton',
    fit: 'Relaxed Above-The-Knee Fit',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Charcoal Black', hex: '#1a1a1a' }
    ],
    images: [
      '/assets/images/stardust_fleece_shorts_1789793085648.jpg'
    ],
    isNewDrop: true,
    stockRemaining: 22,
    rating: 4.8,
    reviewsCount: 22
  },
  {
    id: 'lk-08',
    name: 'Duck Canvas Riveted Carpenter Trousers',
    category: 'bottoms',
    price: 50,
    description: 'Rigid 14oz 100% cotton duck canvas work pants in pitch black. Deep square rear utility pockets reinforced at all corners with silver metal rivets, hammer loop, double knees, and tonal cursive "LK" embroidery.',
    details: [
      '14oz Heavy Rigid 100% Cotton Duck Canvas',
      'Silver metal rivets on all utility pocket corners',
      'Double-knee reinforcement panels and hammer loop',
      'Tonal direct embroidery cursive "LK" on hip',
      'Straight wide-leg cut built to last decades'
    ],
    fabricGsm: '14oz Heavy Duck Canvas',
    fit: 'Straight Wide-Leg Carpenter Fit',
    sizes: ['30', '32', '34', '36'],
    colors: [
      { name: 'Pitch Black', hex: '#101010' }
    ],
    images: [
      '/assets/images/heavy_carpenter_pants_1789792706478.jpg'
    ],
    isLimitedRun: true,
    stockRemaining: 15,
    rating: 4.9,
    reviewsCount: 19
  },
  {
    id: 'lk-09',
    name: 'Bouclé Wool "Lord Knows" Heavy Knit Sweater',
    category: 'outerwear',
    price: 65,
    description: 'Chunky heavyweight charcoal black knit sweater crafted from thick wool-cotton yarn. Features 3D tactile fuzzy bouclé chain-stitch embroidery spelling "Lord Knows" across the chest.',
    details: [
      'Heavyweight 100% Wool-Cotton Chunky Yarn Weave',
      'Tactile 3D bouclé chenille chain-stitch cursive lettering',
      'Extra-thick ribbed crewneck collar and cuffs',
      'Relaxed dropped shoulders with natural weight',
      'Zero synthetic polyester gloss'
    ],
    fabricGsm: 'Chunky Knit Wool Blend',
    fit: 'Oversized Boxy Knitwear Fit',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Charcoal Black', hex: '#1e1e1e' }
    ],
    images: [
      '/assets/images/heavy_boucle_sweater_1789792719688.jpg'
    ],
    isLimitedRun: true,
    stockRemaining: 10,
    rating: 5.0,
    reviewsCount: 15
  }
];

export const LOOKBOOK_ITEMS: LookbookItem[] = [
  {
    id: 'look-1',
    title: 'LOOK 01 // DIRECTED BY THE LORD',
    subtitle: '500 GSM loopback cotton with 3D raised matte puff print and barbed wire frame.',
    season: 'Autumn / Winter 2026',
    image: '/assets/images/heavy_hero_banner_1789792733978.jpg',
    taggedProductIds: ['lk-01', 'lk-06']
  },
  {
    id: 'look-2',
    title: 'LOOK 02 // SACRED THREADS',
    subtitle: 'Ash grey 300 GSM vintage washed tee with Crown of Thorns and 3D puff "GOD BEFORE ALL".',
    season: 'Genesis Capsule',
    image: '/assets/images/thorns_god_puff_tee_1789793038407.jpg',
    taggedProductIds: ['lk-05', 'lk-07']
  },
  {
    id: 'look-3',
    title: 'LOOK 03 // GOTHIC ARCHIVE',
    subtitle: 'Mineral wash tee with 3D puff triple gothic crosses and sapphire crystal cross hoodie.',
    season: 'Studio Vault',
    image: '/assets/images/triple_cross_puff_tee_1789793027777.jpg',
    taggedProductIds: ['lk-04', 'lk-03']
  }
];

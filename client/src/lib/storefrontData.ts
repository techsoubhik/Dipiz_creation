export const productCategories = [
  "Clay Jewellery",
  "Resin Art",
  "Bottle Art",
  "Personalized Gifts",
  "Custom Art",
] as const;

export type ProductCategory = (typeof productCategories)[number];
export type PriceFilter = "All" | "Under $50" | "$50 – $100" | "$100 – $175" | "$175+";
export type SortOption = "newest" | "best-selling" | "price-low" | "price-high";

export type Product = {
  id: number;
  name: string;
  edition: string;
  price: number;
  artClass: string;
  accent: string;
  category: ProductCategory;
  checkoutHandle?: string;
  materials: string;
  dimensions: string;
  care: string;
  shipping: string;
  availability: string;
  description: string;
  isNew: boolean;
  salesRank: number;
};

export const products: Product[] = [
  { id: 1, name: "Blush Reverie", edition: "Limited art print · 1 of 50", price: 48, artClass: "art-rose", accent: "Rose", category: "Resin Art", checkoutHandle: "blush-reverie", materials: "Pigmented resin, archival art paper", dimensions: "A5 · 148 × 210 mm", care: "Keep away from direct sunlight and wipe with a dry, soft cloth.", shipping: "Ships in 2–4 business days in protective flat packaging.", availability: "In studio · ready to ship", description: "A soft, layered resin study in rose and parchment tones, made to catch a quiet changing light.", isNew: true, salesRank: 2 },
  { id: 2, name: "Quiet Form", edition: "Hand-finished object · Small batch", price: 68, artClass: "art-stone", accent: "Ivory", category: "Clay Jewellery", checkoutHandle: "quiet-form", materials: "Hand-shaped clay, brass findings", dimensions: "Drop length · 42 mm", care: "Store flat and avoid water, perfume and pressure.", shipping: "Ships in 2–4 business days in a reusable keepsake box.", availability: "In studio · ready to ship", description: "A sculptural pair of clay earrings with a featherlight presence and a warm, understated form.", isNew: false, salesRank: 1 },
  { id: 3, name: "Golden Stillness", edition: "Giclée print · 1 of 30", price: 56, artClass: "art-gold", accent: "Rose gold", category: "Bottle Art", materials: "Hand-painted glass, metallic pigment", dimensions: "Height · 210 mm", care: "Display indoors and clean gently with a dry microfibre cloth.", shipping: "Ships in 3–5 business days in a padded presentation box.", availability: "Limited batch · 6 available", description: "A small-batch painted bottle designed as an object of warmth, shimmer and held memory.", isNew: true, salesRank: 4 },
  { id: 4, name: "Petal Study", edition: "Original mixed media · One of one", price: 124, artClass: "art-petal", accent: "Blush", category: "Personalized Gifts", materials: "Mixed media, deckled cotton paper", dimensions: "8 × 10 in · unframed", care: "Frame behind UV-protective glass and keep in a dry interior space.", shipping: "Ships in 3–5 business days with a signed authenticity card.", availability: "One original available", description: "An intimate original with expressive petal forms, created as a personal gesture for a meaningful space.", isNew: false, salesRank: 3 },
  { id: 5, name: "Little Luck Charm", edition: "Wearable clay token · Small batch", price: 36, artClass: "art-gold", accent: "Warm gold", category: "Clay Jewellery", materials: "Polymer clay, gold-toned stainless steel", dimensions: "Charm · 18 mm", care: "Avoid moisture and store in the included soft pouch.", shipping: "Ships in 2–4 business days in a gift-ready pouch.", availability: "In studio · ready to ship", description: "A tiny wearable token for everyday luck, shaped and finished by hand in a limited studio batch.", isNew: true, salesRank: 5 },
  { id: 6, name: "Rosé Botanical", edition: "Resin art tile · 1 of 20", price: 78, artClass: "art-rose", accent: "Botanical rose", category: "Resin Art", materials: "Layered resin, dried botanical elements", dimensions: "100 × 100 mm", care: "Display away from direct heat and bright sun.", shipping: "Ships in 3–5 business days in a protective gift box.", availability: "Limited batch · 8 available", description: "A small resin artwork with botanical movement suspended beneath a glass-like surface.", isNew: false, salesRank: 6 },
  { id: 7, name: "Keepsake Bottle", edition: "Painted object · One of one", price: 96, artClass: "art-petal", accent: "Dusty petal", category: "Bottle Art", materials: "Repurposed glass bottle, mineral paint, varnish", dimensions: "Height · 250 mm", care: "For decorative indoor use; gently dust only.", shipping: "Ships in 3–5 business days in a reinforced presentation box.", availability: "One original available", description: "A reimagined glass bottle painted in warm, flowing layers—an everyday vessel made entirely decorative.", isNew: false, salesRank: 8 },
  { id: 8, name: "A Name to Keep", edition: "Personalized paper keepsake", price: 64, artClass: "art-stone", accent: "Personalized", category: "Personalized Gifts", materials: "Archival paper, hand-torn details, ink", dimensions: "5 × 7 in · framed option available", care: "Keep dry and frame away from direct sunlight.", shipping: "Personalized and dispatched in 5–7 business days.", availability: "Made to order", description: "A quiet paper keepsake made with a chosen name, date or short line—created for giving and remembering.", isNew: true, salesRank: 7 },
  { id: 9, name: "A Small World", edition: "Custom art commission", price: 180, artClass: "art-rose", accent: "Commission", category: "Custom Art", materials: "Mixed media selected with you", dimensions: "From A4 · custom sizing available", care: "Care guidance is supplied with every commission.", shipping: "Commission timeline and shipping are confirmed after consultation.", availability: "2 commission places this month", description: "A collaborative original made around your colours, place, memory or feeling—crafted in close conversation.", isNew: false, salesRank: 9 },
  { id: 10, name: "Still Day", edition: "Custom object commission", price: 220, artClass: "art-gold", accent: "Commission", category: "Custom Art", materials: "Clay, resin or glass selected with you", dimensions: "Custom dimensions", care: "Care guidance is supplied with every commission.", shipping: "Commission timeline and shipping are confirmed after consultation.", availability: "2 commission places this month", description: "A one-of-one art object for a treasured shelf, table or celebration—made from a shared starting point.", isNew: true, salesRank: 10 },
];

export type BagItem = Product & { quantity: number };

export function calculateBagTotal(items: BagItem[]) {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
}

export function filterProducts({
  query = "",
  category = "All",
  price = "All",
  sort = "newest",
}: {
  query?: string;
  category?: ProductCategory | "All";
  price?: PriceFilter;
  sort?: SortOption;
} = {}) {
  const normalizedQuery = query.trim().toLowerCase();
  const matchesPrice = (product: Product) => {
    if (price === "Under $50") return product.price < 50;
    if (price === "$50 – $100") return product.price >= 50 && product.price <= 100;
    if (price === "$100 – $175") return product.price > 100 && product.price <= 175;
    if (price === "$175+") return product.price > 175;
    return true;
  };

  const filtered = products.filter((product) => {
    const matchesSearch = !normalizedQuery || [product.name, product.category, product.materials, product.description]
      .join(" ")
      .toLowerCase()
      .includes(normalizedQuery);
    return matchesSearch && (category === "All" || product.category === category) && matchesPrice(product);
  });

  return [...filtered].sort((a, b) => {
    if (sort === "best-selling") return a.salesRank - b.salesRank;
    if (sort === "price-low") return a.price - b.price;
    if (sort === "price-high") return b.price - a.price;
    return Number(b.isNew) - Number(a.isNew) || a.id - b.id;
  });
}

export function getProductById(id: number) {
  return products.find((product) => product.id === id);
}

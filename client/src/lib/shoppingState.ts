import type { BagItem, Product } from "./storefrontData";

export function addProductToLocalBag(items: BagItem[], product: Product, quantity = 1): BagItem[] {
  const existing = items.find((item) => item.id === product.id);
  if (!existing) return [...items, { ...product, quantity }];
  return items.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item);
}

export function toggleWishlistItem(items: Set<number>, id: number) {
  const next = new Set(items);
  next.has(id) ? next.delete(id) : next.add(id);
  return next;
}

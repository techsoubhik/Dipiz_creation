import { describe, expect, it } from "vitest";
import { products } from "./storefrontData";
import { addProductToLocalBag, toggleWishlistItem } from "./shoppingState";

describe("shopping interaction state", () => {
  it("toggles a wishlist item without changing the existing collection", () => {
    const saved = new Set([products[0].id]);
    const removed = toggleWishlistItem(saved, products[0].id);
    const added = toggleWishlistItem(removed, products[1].id);

    expect(saved.has(products[0].id)).toBe(true);
    expect(removed.has(products[0].id)).toBe(false);
    expect(added.has(products[1].id)).toBe(true);
  });

  it("quick-adds a product and accumulates repeated cart quantities", () => {
    const firstAdd = addProductToLocalBag([], products[0]);
    const repeatedAdd = addProductToLocalBag(firstAdd, products[0], 2);

    expect(repeatedAdd).toHaveLength(1);
    expect(repeatedAdd[0]?.quantity).toBe(3);
  });
});

import { describe, expect, it } from "vitest";
import { calculateBagTotal, filterProducts, products } from "./storefrontData";

describe("DIPIZ storefront data", () => {
  it("provides complete, purchasable featured pieces", () => {
    expect(products.length).toBeGreaterThanOrEqual(10);
    expect(products.every((product) => product.name.length > 0 && product.price > 0)).toBe(true);
  });

  it("calculates a shopping-bag total from quantities", () => {
    expect(calculateBagTotal([{ ...products[0], quantity: 2 }, { ...products[2], quantity: 1 }])).toBe(152);
  });

  it("filters and sorts pieces by search, category, price, and product priority", () => {
    expect(filterProducts({ query: "botanical" }).map((product) => product.name)).toEqual(["Rosé Botanical"]);
    expect(filterProducts({ category: "Clay Jewellery", price: "Under $50" }).map((product) => product.name)).toEqual(["Little Luck Charm"]);
    expect(filterProducts({ sort: "price-high" })[0]?.name).toBe("Still Day");
    expect(filterProducts({ sort: "best-selling" })[0]?.name).toBe("Quiet Form");
  });
});

/** @vitest-environment jsdom */

import React from "react";
import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import Shop from "./Shop";

const addItem = vi.fn().mockResolvedValue({ checkoutUrl: "https://checkout.example.test/cart" });

vi.mock("wouter", () => ({
  useRoute: () => [true, { id: "1" }],
}));

vi.mock("@/contexts/CartContext", () => ({
  useCart: () => ({ addItem, itemCount: 0 }),
}));

vi.mock("@/lib/trpc", () => ({
  trpc: {
    commerce: {
      products: {
        byHandle: {
          useQuery: () => ({ data: { variants: [{ id: "live-variant", availableForSale: true }] } }),
        },
      },
    },
  },
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("Shop product interactions", () => {
  it("filters the catalog by category and supports wishlist plus Quick Add", async () => {
    const user = userEvent.setup();
    render(<Shop />);

    await user.click(screen.getByRole("button", { name: "Clay Jewellery" }));
    expect(screen.getByText("Quiet Form")).toBeTruthy();
    expect(screen.queryByText("Blush Reverie")).toBeNull();

    await user.click(screen.getByRole("button", { name: "Save Quiet Form to wishlist" }));
    expect(screen.getByRole("button", { name: "Save Quiet Form to wishlist" }).getAttribute("aria-pressed")).toBe("true");

    const productBrowser = document.getElementById("search");
    expect(productBrowser).toBeTruthy();
    const quietFormCard = within(productBrowser!).getByText("Quiet Form").closest("article");
    expect(quietFormCard).toBeTruthy();
    await user.click(within(quietFormCard!).getByRole("button", { name: /Quick Add/i }));
    expect(screen.getByText(/Quiet Form · quick added/)).toBeTruthy();
  });
});

describe("Product detail interactions", () => {
  it("updates quantity, zooms the gallery, and opens Shopify checkout from Buy Now", async () => {
    const { default: ProductDetail } = await import("./ProductDetail");
    const user = userEvent.setup();
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);

    render(<ProductDetail />);
    await user.click(screen.getByRole("button", { name: "Increase quantity" }));
    expect(screen.getByText("2")).toBeTruthy();

    const gallery = screen.getByRole("button", { name: "Toggle image zoom" });
    await user.click(gallery);
    expect(gallery.className).toContain("is-zoomed");

    await user.click(screen.getByRole("button", { name: /Buy Now/i }));
    await waitFor(() => expect(addItem).toHaveBeenCalledWith("live-variant", 2));
    await waitFor(() => expect(openSpy).toHaveBeenCalledWith("https://checkout.example.test/cart", "_blank", "noopener,noreferrer"));
    openSpy.mockRestore();
  });
});

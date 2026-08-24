/** @vitest-environment jsdom */

import React from "react";
import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";

vi.mock("@/components/ui/sonner", () => ({ Toaster: () => null }));

afterEach(cleanup);

describe("mounted app mobile navigation", () => {
  beforeEach(() => window.history.replaceState({}, "", "/"));

  it("takes Wishlist and Cart navigation to the real shop utility sections", async () => {
    const user = userEvent.setup();
    render(<App />);

    const mobileNav = screen.getByRole("navigation", { name: "Mobile store navigation" });
    await user.click(within(mobileNav).getByRole("link", { name: "Shop" }));
    await waitFor(() => expect(window.location.pathname).toBe("/shop"));

    const shopNav = screen.getByRole("navigation", { name: "Mobile store navigation" });
    await user.click(within(shopNav).getByRole("link", { name: "Wishlist" }));
    await waitFor(() => expect(window.location.hash).toBe("#shop-wishlist"));
    const wishlistSection = document.getElementById("shop-wishlist");
    expect(wishlistSection).toBeTruthy();
    expect(wishlistSection?.textContent).toMatch(/Pieces you’re/);

    await user.click(within(screen.getByRole("navigation", { name: "Mobile store navigation" })).getByRole("link", { name: "Cart" }));
    await waitFor(() => expect(window.location.hash).toBe("#shop-cart"));
    const cartSection = document.getElementById("shop-cart");
    expect(cartSection).toBeTruthy();
    expect(cartSection?.textContent).toMatch(/Your calm/);
  });
});

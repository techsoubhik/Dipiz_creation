/** @vitest-environment jsdom */

import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { MobileBottomNav } from "./MobileBottomNav";

describe("MobileBottomNav", () => {
  beforeEach(() => window.history.replaceState({}, "", "/"));

  it("navigates Home, Shop, Wishlist, and Cart through real route and hash changes", async () => {
    const user = userEvent.setup();
    render(<MobileBottomNav active="shop" />);

    expect(screen.getByRole("link", { name: "Home" }).getAttribute("href")).toBe("/");
    expect(screen.getByRole("link", { name: "Shop" }).getAttribute("href")).toBe("/shop");
    expect(screen.getByRole("link", { name: "Wishlist" }).getAttribute("href")).toBe("/shop#shop-wishlist");
    expect(screen.getByRole("link", { name: "Cart" }).getAttribute("href")).toBe("/shop#shop-cart");
    expect(screen.getByRole("link", { name: "Shop" }).getAttribute("aria-current")).toBe("page");

    await user.click(screen.getByRole("link", { name: "Home" }));
    expect(window.location.pathname).toBe("/");
    await user.click(screen.getByRole("link", { name: "Shop" }));
    expect(window.location.pathname).toBe("/shop");
    await user.click(screen.getByRole("link", { name: "Wishlist" }));
    expect(window.location.pathname).toBe("/shop");
    expect(window.location.hash).toBe("#shop-wishlist");
    await user.click(screen.getByRole("link", { name: "Cart" }));
    expect(window.location.pathname).toBe("/shop");
    expect(window.location.hash).toBe("#shop-cart");
  });
});

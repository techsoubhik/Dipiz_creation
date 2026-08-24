// @vitest-environment jsdom
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BrandLogo } from "./BrandLogo";

describe("BrandLogo", () => {
  it("renders the supplied DIPIZ CREATION logo asset with its transparent background", () => {
    render(<BrandLogo variant="shop" />);

    const logo = screen.getByRole("img", { name: "DIPIZ CREATION — Art and Design" });
    expect(logo.getAttribute("src")).toBe("/manus-storage/dipiz-creation-logo-transparent_0ece0553.png");
    expect(logo.classList.contains("dipiz-brand-logo--shop")).toBe(true);
  });
});

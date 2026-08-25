/** @vitest-environment jsdom */

import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import Home from "./Home";
import { DIPIZ_INSTAGRAM_URL } from "@/lib/socialLinks";

afterEach(cleanup);

describe("homepage Instagram follow entry", () => {
  it("renders the owner-approved profile as the official gallery destination", () => {
    render(<Home />);

    const followLink = screen.getByRole("link", { name: /open @dipiz_creation on instagram/i });
    expect(followLink.getAttribute("href")).toBe(DIPIZ_INSTAGRAM_URL);
    expect(followLink.getAttribute("target")).toBe("_blank");
  });
});

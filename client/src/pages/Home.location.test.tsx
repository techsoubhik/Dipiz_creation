/** @vitest-environment jsdom */

import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import Home from "./Home";

afterEach(cleanup);

describe("homepage studio location", () => {
  it("renders the owner-approved public Kolkata studio location in the footer", () => {
    render(<Home />);

    expect(screen.getByText("Studio location: Kolkata, West Bengal 700102, India")).toBeTruthy();
  });
});

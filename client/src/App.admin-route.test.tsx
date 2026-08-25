/** @vitest-environment jsdom */

import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const auth = vi.hoisted(() => ({
  state: { user: null as { id: number; name: string; role: "admin" | "user" } | null, loading: true, isAuthenticated: false },
}));
const invalidate = vi.fn();

vi.mock("@/_core/hooks/useAuth", () => ({
  useAuth: () => ({ ...auth.state, logout: vi.fn() }),
}));
vi.mock("@/components/ui/sonner", () => ({ Toaster: () => null }));
vi.mock("@/lib/trpc", () => ({
  trpc: {
    admin: {
      dashboard: { useQuery: () => ({ data: { summary: { totalSales: 0, totalOrders: 0, newOrders: 0, processingOrders: 0, customOrders: 0 }, notifications: [], recentOrders: [] } }) },
      orders: { list: { useQuery: () => ({ data: [] }) }, byId: { useQuery: () => ({ data: undefined }) }, updateStatus: { useMutation: () => ({ mutate: vi.fn() }) } },
      customOrders: { list: { useQuery: () => ({ data: [] }) }, update: { useMutation: () => ({ mutate: vi.fn() }) } },
      customers: { useQuery: () => ({ data: [] }) },
      operations: { useQuery: () => ({ data: { sales: { totalSales: 0, totalOrders: 0, paidOrders: 0, fulfilledOrders: 0, averageOrderValue: 0, currencyCode: "INR" }, inventory: [], productSettings: [], syncStates: [] } }) },
      notifications: { markRead: { useMutation: () => ({ mutate: vi.fn() }) } },
    },
    commerce: { products: { list: { useQuery: () => ({ data: [] }) } } },
    useUtils: () => ({ admin: { dashboard: { invalidate }, orders: { list: { invalidate }, byId: { invalidate } }, customOrders: { list: { invalidate } } } }),
  },
}));

import App from "./App";

afterEach(() => {
  cleanup();
  auth.state = { user: null, loading: true, isAuthenticated: false };
});

describe("mounted /admin route on mobile", () => {
  beforeEach(() => {
    Object.defineProperty(window, "innerWidth", { configurable: true, value: 390 });
    window.history.replaceState({}, "", "/admin");
  });

  it("replaces the loading state with the private owner overview after auth resolves", () => {
    const view = render(<App />);
    expect(screen.getByText("Opening the studio desk…")).toBeTruthy();

    auth.state = { user: { id: 1, name: "Studio Owner", role: "admin" }, loading: false, isAuthenticated: true };
    view.rerender(<App />);

    expect(screen.queryByText("Opening the studio desk…")).toBeNull();
    expect(screen.getAllByText("Overview").length).toBeGreaterThan(0);
    expect(screen.getByText("New and recent orders")).toBeTruthy();
    expect(screen.getByText("Studio inbox")).toBeTruthy();
  });

  it("shows the private sign-in state to an unauthenticated visitor", () => {
    auth.state = { user: null, loading: false, isAuthenticated: false };
    render(<App />);

    expect(screen.getByText("Private studio access")).toBeTruthy();
    expect(screen.getByRole("button", { name: /secure sign in/i })).toBeTruthy();
  });

  it("keeps a signed-in non-owner account out of the private workspace", () => {
    auth.state = { user: { id: 2, name: "Studio Visitor", role: "user" }, loading: false, isAuthenticated: true };
    render(<App />);

    expect(screen.getByRole("heading")).toBeTruthy();
    expect(screen.getByText("Access")).toBeTruthy();
    expect(screen.getByText("restricted.")).toBeTruthy();
    expect(screen.getByText(/has not been approved for private studio management/i)).toBeTruthy();
  });
});

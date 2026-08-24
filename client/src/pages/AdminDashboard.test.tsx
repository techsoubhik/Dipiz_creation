/** @vitest-environment jsdom */

import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

const invalidate = vi.fn();
const updateCustom = vi.fn();
const updateOrderStatus = vi.fn();

vi.mock("@/_core/hooks/useAuth", () => ({
  useAuth: () => ({
    user: { id: 1, name: "Studio Owner", role: "admin" },
    loading: false,
    isAuthenticated: true,
    logout: vi.fn(),
  }),
}));

vi.mock("@/lib/trpc", () => ({
  trpc: {
    admin: {
      dashboard: { useQuery: () => ({ data: { summary: { totalSales: 0, totalOrders: 0, newOrders: 0, processingOrders: 0, customOrders: 0 }, notifications: [], recentOrders: [] } }) },
      orders: {
        list: { useQuery: () => ({ data: [{ id: 31, orderNumber: "DC-1001", customerName: "Riya", customerEmail: "riya@example.com", customerPhone: "+919000000000", finalTotal: "4800", currencyCode: "INR", paymentStatus: "paid", orderStatus: "new", createdAt: new Date("2026-08-24") }] }) },
        byId: { useQuery: () => ({ data: { order: { id: 31, orderNumber: "DC-1001", customerName: "Riya", customerEmail: "riya@example.com", customerPhone: "+919000000000", deliveryAddress: "Mumbai", subtotal: "4800", shippingCharge: "0", discountAmount: "0", finalTotal: "4800", currencyCode: "INR", orderStatus: "new" }, items: [], timeline: [] } }) },
        updateStatus: { useMutation: () => ({ mutate: updateOrderStatus, isPending: false }) },
      },
      customOrders: { list: { useQuery: () => ({ data: [{ id: 12, name: "Anika", whatsapp: "+15551234567", productType: "Custom Resin Art", occasion: "Birthday", budget: "₹5,000", requiredDate: "2026-12-24", adminStatus: "new", internalNotes: null }] }) }, update: { useMutation: () => ({ mutate: updateCustom }) } },
      customers: { useQuery: () => ({ data: [] }) },
      operations: { useQuery: () => ({ data: { sales: { totalSales: 0, totalOrders: 0, paidOrders: 0, fulfilledOrders: 0, averageOrderValue: 0, currencyCode: "INR" }, inventory: [], productSettings: [], syncStates: [] } }) },
      notifications: { markRead: { useMutation: () => ({ mutate: vi.fn() }) } },
    },
    commerce: { products: { list: { useQuery: () => ({ data: [{ id: "gid://shopify/Product/1", title: "Blush Reverie", productType: "Resin Art", priceRange: { min: { amount: "48", currencyCode: "INR" } }, variants: [{ availableForSale: true }], images: [] }] }) } } },
    useUtils: () => ({ admin: { dashboard: { invalidate }, orders: { list: { invalidate }, byId: { invalidate } }, customOrders: { list: { invalidate } } } }),
  },
}));

import AdminDashboard from "./AdminDashboard";

afterEach(() => {
  cleanup();
  updateCustom.mockClear();
  updateOrderStatus.mockClear();
});

describe("authenticated mobile administration dashboard", () => {
  it("replaces the loading state with private owner overview content", () => {
    Object.defineProperty(window, "innerWidth", { configurable: true, value: 390 });
    render(<AdminDashboard />);

    expect(screen.queryByText("Opening the studio desk…")).toBeNull();
    expect(screen.getAllByText("Overview").length).toBeGreaterThan(0);
    expect(screen.getByText("New and recent orders")).toBeTruthy();
    expect(screen.getByText("Studio inbox")).toBeTruthy();
    expect(screen.getByText("Studio Owner")).toBeTruthy();
  });

  it("saves private notes for a custom request and shows the live storefront catalog", async () => {
    const user = userEvent.setup();
    render(<AdminDashboard />);

    await user.click(screen.getByRole("button", { name: "Custom" }));
    const note = screen.getByLabelText("Private studio note");
    await user.type(note, "Use pearl and soft gold.");
    await user.click(screen.getByRole("button", { name: /Save note/i }));
    expect(updateCustom).toHaveBeenCalledWith({ id: 12, status: "new", internalNotes: "Use pearl and soft gold." });

    await user.click(screen.getByRole("button", { name: "Products" }));
    expect(screen.getByText("Blush Reverie")).toBeTruthy();
    expect(screen.getByText(/₹48/)).toBeTruthy();
  });

  it("updates an order status from the private dashboard order drawer", async () => {
    const user = userEvent.setup();
    render(<AdminDashboard />);

    await user.click(screen.getByRole("button", { name: "Orders" }));
    await user.click(screen.getByText("#DC-1001"));
    const selects = screen.getAllByRole("combobox");
    await user.selectOptions(selects[selects.length - 1], "preparing");

    expect(updateOrderStatus).toHaveBeenCalledWith({ id: 31, status: "preparing" });
  });

  it("shows truthful private operations readiness without inventing sales or inventory", async () => {
    const user = userEvent.setup();
    render(<AdminDashboard />);

    await user.click(screen.getByRole("button", { name: "Operations" }));
    expect(screen.getByText("Sales performance")).toBeTruthy();
    expect(screen.getByText("No sales data yet")).toBeTruthy();
    expect(screen.getByText("No inventory snapshot yet")).toBeTruthy();
    expect(screen.getByText("Synchronization is awaiting setup")).toBeTruthy();
  });
});

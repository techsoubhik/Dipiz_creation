import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getAdminDashboardData: vi.fn().mockResolvedValue({ summary: { totalOrders: 0 }, notifications: [], recentOrders: [] }),
  listAdminOrders: vi.fn().mockResolvedValue([]),
  getAdminOrderById: vi.fn().mockResolvedValue(null),
  updateAdminOrderStatus: vi.fn().mockResolvedValue(undefined),
  listAdminCustomOrders: vi.fn().mockResolvedValue([]),
  updateAdminCustomOrder: vi.fn().mockResolvedValue(undefined),
  listAdminCustomers: vi.fn().mockResolvedValue([]),
  getAdminOperationsData: vi.fn().mockResolvedValue({ sales: { totalSales: 0, totalOrders: 0, paidOrders: 0, fulfilledOrders: 0, averageOrderValue: 0, currencyCode: "INR" }, inventory: [], productSettings: [], syncStates: [] }),
  markAdminNotificationRead: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../db", () => mocks);

import { adminRouter } from "./admin";

const adminContext = { user: { id: 1, role: "admin" } } as never;
const regularUserContext = { user: { id: 2, role: "user" } } as never;

describe("admin router", () => {
  it("rejects non-admin accounts before exposing any dashboard data", async () => {
    const caller = adminRouter.createCaller(regularUserContext);
    await expect(caller.dashboard()).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(mocks.getAdminDashboardData).not.toHaveBeenCalled();
  });

  it("allows an admin to access summaries and update private order statuses", async () => {
    const caller = adminRouter.createCaller(adminContext);
    await expect(caller.dashboard()).resolves.toEqual({ summary: { totalOrders: 0 }, notifications: [], recentOrders: [] });
    await caller.orders.updateStatus({ id: 8, status: "preparing", note: "Handmade work started" });
    expect(mocks.updateAdminOrderStatus).toHaveBeenCalledWith(8, "preparing", "Handmade work started");
  });

  it("keeps operations reporting owner-only and returns truthful empty operations data", async () => {
    const regularCaller = adminRouter.createCaller(regularUserContext);
    await expect(regularCaller.operations()).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(mocks.getAdminOperationsData).not.toHaveBeenCalled();

    const adminCaller = adminRouter.createCaller(adminContext);
    await expect(adminCaller.operations()).resolves.toEqual({ sales: { totalSales: 0, totalOrders: 0, paidOrders: 0, fulfilledOrders: 0, averageOrderValue: 0, currencyCode: "INR" }, inventory: [], productSettings: [], syncStates: [] });
  });
});

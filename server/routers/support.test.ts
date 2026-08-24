import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createTrackingRequest: vi.fn().mockResolvedValue(undefined),
  createAdminNotification: vi.fn().mockResolvedValue(undefined),
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

vi.mock("../db", () => ({ createTrackingRequest: mocks.createTrackingRequest, createAdminNotification: mocks.createAdminNotification }));
vi.mock("../_core/notification", () => ({ notifyOwner: mocks.notifyOwner }));

import { supportRouter } from "./support";

describe("support.requestTracking", () => {
  it("persists an order status request and alerts the studio owner", async () => {
    const caller = supportRouter.createCaller({} as never);
    const result = await caller.requestTracking({ orderNumber: "DC-1024" });

    expect(mocks.createTrackingRequest).toHaveBeenCalledWith({ orderNumber: "DC-1024", status: "new" });
    expect(mocks.notifyOwner).toHaveBeenCalledWith(expect.objectContaining({ title: "DIPIZ order tracking request" }));
    expect(mocks.createAdminNotification).toHaveBeenCalledWith(expect.objectContaining({ kind: "tracking", entityId: "DC-1024" }));
    expect(result).toEqual({ success: true, notificationSent: true });
  });
});

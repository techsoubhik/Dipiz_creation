import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createCustomOrder: vi.fn().mockResolvedValue(undefined),
  createAdminNotification: vi.fn().mockResolvedValue(undefined),
  storagePut: vi.fn().mockResolvedValue({ key: "custom-orders/reference_test.png", url: "/manus-storage/custom-orders/reference_test.png" }),
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

vi.mock("../db", () => ({ createCustomOrder: mocks.createCustomOrder, createAdminNotification: mocks.createAdminNotification }));
vi.mock("../storage", () => ({ storagePut: mocks.storagePut }));
vi.mock("../_core/notification", () => ({ notifyOwner: mocks.notifyOwner }));

import { customOrdersRouter } from "./customOrders";

describe("customOrders.submit", () => {
  it("stores the order, saves reference metadata, and sends an owner handoff", async () => {
    const caller = customOrdersRouter.createCaller({} as never);
    const result = await caller.submit({
      name: "Anika",
      whatsapp: "+15551234567",
      occasion: "A birthday keepsake",
      productType: "Custom Resin Art",
      colorStyle: "Blush, pearl and soft gold",
      budget: "$125 – $200",
      requiredDate: "2026-12-24",
      message: "For a very sentimental friend.",
      referenceImage: { name: "palette.png", mimeType: "image/png", base64: Buffer.from("reference").toString("base64") },
    });

    expect(mocks.storagePut).toHaveBeenCalledWith(
      expect.stringMatching(/^custom-orders\/reference-\d+\.png$/),
      expect.any(Buffer),
      "image/png",
    );
    expect(mocks.createCustomOrder).toHaveBeenCalledWith(expect.objectContaining({
      name: "Anika",
      productType: "Custom Resin Art",
      referenceImageKey: "custom-orders/reference_test.png",
      referenceImageUrl: "/manus-storage/custom-orders/reference_test.png",
      status: "new",
    }));
    expect(mocks.notifyOwner).toHaveBeenCalledWith(expect.objectContaining({ title: "New DIPIZ custom order" }));
    expect(mocks.createAdminNotification).toHaveBeenCalledWith(expect.objectContaining({ kind: "custom_order", headline: "New custom creation request" }));
    expect(result).toEqual({ success: true, notificationSent: true });
  });
});

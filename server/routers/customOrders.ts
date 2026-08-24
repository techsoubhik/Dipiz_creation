import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createAdminNotification, createCustomOrder } from "../db";
import { notifyOwner } from "../_core/notification";
import { storagePut } from "../storage";
import { publicProcedure, router } from "../_core/trpc";

const referenceImageSchema = z.object({
  name: z.string().min(1).max(180),
  mimeType: z.enum(["image/jpeg", "image/png", "image/webp"]),
  base64: z.string().min(1),
}).nullable();

const customOrderInput = z.object({
  name: z.string().trim().min(2).max(120),
  whatsapp: z.string().trim().min(6).max(40),
  occasion: z.string().trim().min(2).max(180),
  productType: z.string().trim().min(2).max(120),
  colorStyle: z.string().trim().min(2).max(3000),
  budget: z.string().trim().min(2).max(64),
  requiredDate: z.string().trim().min(4).max(32),
  message: z.string().trim().min(2).max(3000),
  referenceImage: referenceImageSchema,
});

const extensionForMimeType: Record<"image/jpeg" | "image/png" | "image/webp", string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export const customOrdersRouter = router({
  submit: publicProcedure.input(customOrderInput).mutation(async ({ input }) => {
    let referenceImageKey: string | undefined;
    let referenceImageUrl: string | undefined;

    if (input.referenceImage) {
      const imageBytes = Buffer.from(input.referenceImage.base64, "base64");
      if (imageBytes.length === 0 || imageBytes.length > 5 * 1024 * 1024) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Reference images must be smaller than 5 MB." });
      }
      const extension = extensionForMimeType[input.referenceImage.mimeType];
      const stored = await storagePut(
        `custom-orders/reference-${Date.now()}.${extension}`,
        imageBytes,
        input.referenceImage.mimeType,
      );
      referenceImageKey = stored.key;
      referenceImageUrl = stored.url;
    }

    await createCustomOrder({
      name: input.name,
      whatsapp: input.whatsapp,
      occasion: input.occasion,
      productType: input.productType,
      colorStyle: input.colorStyle,
      budget: input.budget,
      requiredDate: input.requiredDate,
      message: input.message,
      referenceImageKey,
      referenceImageUrl,
      status: "new",
    });

    await createAdminNotification({
      kind: "custom_order",
      headline: "New custom creation request",
      body: `${input.name} requested ${input.productType} for ${input.occasion}.`,
      entityType: "custom_order",
      entityId: `custom-${Date.now()}`,
    });

    const notificationSent = await notifyOwner({
      title: "New DIPIZ custom order",
      content: `${input.name} requested ${input.productType} for ${input.occasion}. Budget: ${input.budget}; required by: ${input.requiredDate}.`,
    });

    return { success: true, notificationSent } as const;
  }),
});

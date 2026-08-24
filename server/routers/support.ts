import { z } from "zod";
import { createAdminNotification, createTrackingRequest } from "../db";
import { notifyOwner } from "../_core/notification";
import { publicProcedure, router } from "../_core/trpc";

export const supportRouter = router({
  requestTracking: publicProcedure
    .input(z.object({ orderNumber: z.string().trim().min(3).max(120) }))
    .mutation(async ({ input }) => {
      await createTrackingRequest({ orderNumber: input.orderNumber, status: "new" });
      await createAdminNotification({
        kind: "tracking",
        headline: "New order tracking request",
        body: `A customer asked for an update on order ${input.orderNumber}.`,
        entityType: "tracking_request",
        entityId: input.orderNumber,
      });
      const notificationSent = await notifyOwner({
        title: "DIPIZ order tracking request",
        content: `A customer requested an update for order ${input.orderNumber}.`,
      });
      return { success: true, notificationSent } as const;
    }),
});

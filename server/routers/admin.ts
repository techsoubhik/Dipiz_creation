import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as db from "../db";
import { adminProcedure, router } from "../_core/trpc";

const orderStatuses = ["new", "confirmed", "processing", "preparing", "shipped", "delivered", "cancelled", "refunded"] as const;
const customStatuses = ["new", "discussing", "confirmed", "creating", "completed", "delivered", "cancelled"] as const;

export const adminRouter = router({
  dashboard: adminProcedure.query(() => db.getAdminDashboardData()),
  orders: router({
    list: adminProcedure.query(() => db.listAdminOrders()),
    byId: adminProcedure.input(z.object({ id: z.number().int().positive() })).query(async ({ input }) => {
      const order = await db.getAdminOrderById(input.id);
      if (!order) throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" });
      return order;
    }),
    updateStatus: adminProcedure.input(z.object({ id: z.number().int().positive(), status: z.enum(orderStatuses), note: z.string().max(1000).optional() })).mutation(({ input }) => db.updateAdminOrderStatus(input.id, input.status, input.note)),
  }),
  customOrders: router({
    list: adminProcedure.query(() => db.listAdminCustomOrders()),
    update: adminProcedure.input(z.object({ id: z.number().int().positive(), status: z.enum(customStatuses), internalNotes: z.string().max(2000).optional() })).mutation(({ input }) => db.updateAdminCustomOrder(input.id, input.status, input.internalNotes)),
  }),
  customers: adminProcedure.query(() => db.listAdminCustomers()),
  operations: adminProcedure.query(() => db.getAdminOperationsData()),
  notifications: router({
    markRead: adminProcedure.input(z.object({ id: z.number().int().positive() })).mutation(({ input }) => db.markAdminNotificationRead(input.id)),
  }),
});

import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { adminNotifications, adminSyncStates, customers, customOrders, InsertCustomOrder, InsertTrackingRequest, InsertUser, inventorySnapshots, orderEvents, orderItems, orders, productAdminSettings, trackingRequests, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function createCustomOrder(order: InsertCustomOrder): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable for custom-order submission");
  await db.insert(customOrders).values(order);
}

export async function createTrackingRequest(request: InsertTrackingRequest): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable for tracking requests");
  await db.insert(trackingRequests).values(request);
}

export async function createAdminNotification(input: {
  kind: "order" | "custom_order" | "tracking";
  headline: string;
  body: string;
  entityType: string;
  entityId: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable for administration notifications");
  await db.insert(adminNotifications).values(input);
}

export async function getAdminDashboardData() {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable for the administration dashboard");
  const [allOrders, custom, notifications, recentOrders] = await Promise.all([
    db.select().from(orders).orderBy(desc(orders.createdAt)),
    db.select().from(customOrders).orderBy(desc(customOrders.createdAt)),
    db.select().from(adminNotifications).orderBy(desc(adminNotifications.createdAt)).limit(8),
    db.select().from(orders).orderBy(desc(orders.createdAt)).limit(6),
  ]);
  const totalSales = allOrders.reduce((total, order) => total + Number(order.finalTotal), 0);
  const count = (status: typeof orders.$inferSelect.orderStatus) => allOrders.filter((order) => order.orderStatus === status).length;
  return {
    summary: {
      totalOrders: allOrders.length,
      newOrders: count("new"),
      processingOrders: count("processing") + count("preparing"),
      customOrders: custom.filter((order) => !["delivered", "cancelled"].includes(order.adminStatus)).length,
      shippedOrders: count("shipped"),
      deliveredOrders: count("delivered"),
      cancelledOrders: count("cancelled"),
      totalSales,
    },
    notifications,
    recentOrders,
  };
}

export async function listAdminOrders() {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable for administration orders");
  return db.select().from(orders).orderBy(desc(orders.createdAt));
}

export async function getAdminOrderById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable for administration orders");
  const order = (await db.select().from(orders).where(eq(orders.id, id)).limit(1))[0];
  if (!order) return null;
  const [items, timeline] = await Promise.all([
    db.select().from(orderItems).where(eq(orderItems.orderId, id)),
    db.select().from(orderEvents).where(eq(orderEvents.orderId, id)).orderBy(desc(orderEvents.occurredAt)),
  ]);
  return { order, items, timeline };
}

export async function updateAdminOrderStatus(id: number, status: NonNullable<typeof orders.$inferInsert.orderStatus>, note?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable for administration orders");
  await db.update(orders).set({ orderStatus: status }).where(eq(orders.id, id));
  await db.insert(orderEvents).values({ orderId: id, status, note: note ?? null });
}

export async function listAdminCustomOrders() {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable for custom order administration");
  return db.select().from(customOrders).orderBy(desc(customOrders.createdAt));
}

export async function updateAdminCustomOrder(id: number, adminStatus: NonNullable<typeof customOrders.$inferInsert.adminStatus>, internalNotes?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable for custom order administration");
  await db.update(customOrders).set({ adminStatus, internalNotes: internalNotes || null }).where(eq(customOrders.id, id));
}

export async function listAdminCustomers() {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable for customer administration");
  return db.select().from(customers).orderBy(desc(customers.latestOrderAt));
}

export async function getAdminOperationsData() {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable for administration operations");
  const [allOrders, inventory, productSettings, syncStates] = await Promise.all([
    db.select().from(orders).orderBy(desc(orders.createdAt)),
    db.select().from(inventorySnapshots).orderBy(desc(inventorySnapshots.updatedAt)),
    db.select().from(productAdminSettings).orderBy(desc(productAdminSettings.updatedAt)),
    db.select().from(adminSyncStates).orderBy(desc(adminSyncStates.updatedAt)),
  ]);
  const paidOrders = allOrders.filter((order) => order.paymentStatus === "paid" || order.paymentStatus === "partially_paid");
  const fulfilledOrders = allOrders.filter((order) => order.orderStatus === "delivered");
  const recognizedOrders = allOrders.filter((order) => !["cancelled", "refunded"].includes(order.orderStatus));
  const totalSales = recognizedOrders.reduce((total, order) => total + Number(order.finalTotal), 0);

  return {
    sales: {
      totalSales,
      totalOrders: allOrders.length,
      paidOrders: paidOrders.length,
      fulfilledOrders: fulfilledOrders.length,
      averageOrderValue: recognizedOrders.length ? totalSales / recognizedOrders.length : 0,
      currencyCode: allOrders[0]?.currencyCode ?? "INR",
    },
    inventory,
    productSettings,
    syncStates,
  };
}

export async function markAdminNotificationRead(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable for administration notifications");
  await db.update(adminNotifications).set({ isRead: true }).where(eq(adminNotifications.id, id));
}

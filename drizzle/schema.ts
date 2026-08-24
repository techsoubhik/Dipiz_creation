import { boolean, decimal, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const customOrders = mysqlTable("customOrders", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  whatsapp: varchar("whatsapp", { length: 40 }).notNull(),
  occasion: varchar("occasion", { length: 180 }).notNull(),
  productType: varchar("productType", { length: 120 }).notNull(),
  colorStyle: text("colorStyle").notNull(),
  budget: varchar("budget", { length: 64 }).notNull(),
  requiredDate: varchar("requiredDate", { length: 32 }).notNull(),
  referenceImageKey: varchar("referenceImageKey", { length: 512 }),
  referenceImageUrl: varchar("referenceImageUrl", { length: 512 }),
  message: text("message").notNull(),
  status: mysqlEnum("status", ["new", "reviewed", "in_progress", "closed"]).default("new").notNull(),
  adminStatus: mysqlEnum("adminStatus", ["new", "discussing", "confirmed", "creating", "completed", "delivered", "cancelled"]).default("new").notNull(),
  internalNotes: text("internalNotes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CustomOrder = typeof customOrders.$inferSelect;
export type InsertCustomOrder = typeof customOrders.$inferInsert;

export const trackingRequests = mysqlTable("trackingRequests", {
  id: int("id").autoincrement().primaryKey(),
  orderNumber: varchar("orderNumber", { length: 120 }).notNull(),
  status: mysqlEnum("status", ["new", "reviewed", "closed"]).default("new").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type InsertTrackingRequest = typeof trackingRequests.$inferInsert;

export const customers = mysqlTable("customers", {
  id: int("id").autoincrement().primaryKey(),
  shopifyCustomerId: varchar("shopifyCustomerId", { length: 128 }).unique(),
  name: varchar("name", { length: 180 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 64 }),
  orderCount: int("orderCount").default(0).notNull(),
  totalSpent: decimal("totalSpent", { precision: 12, scale: 2 }).default("0").notNull(),
  latestOrderAt: timestamp("latestOrderAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  shopifyOrderId: varchar("shopifyOrderId", { length: 128 }).notNull().unique(),
  orderNumber: varchar("orderNumber", { length: 80 }).notNull().unique(),
  customerId: int("customerId"),
  customerName: varchar("customerName", { length: 180 }).notNull(),
  customerEmail: varchar("customerEmail", { length: 320 }),
  customerPhone: varchar("customerPhone", { length: 64 }),
  deliveryAddress: text("deliveryAddress"),
  currencyCode: varchar("currencyCode", { length: 8 }).default("INR").notNull(),
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).default("0").notNull(),
  shippingCharge: decimal("shippingCharge", { precision: 12, scale: 2 }).default("0").notNull(),
  discountAmount: decimal("discountAmount", { precision: 12, scale: 2 }).default("0").notNull(),
  finalTotal: decimal("finalTotal", { precision: 12, scale: 2 }).default("0").notNull(),
  paymentMethod: varchar("paymentMethod", { length: 80 }),
  paymentStatus: mysqlEnum("paymentStatus", ["pending", "paid", "partially_paid", "refunded", "voided"]).default("pending").notNull(),
  orderStatus: mysqlEnum("orderStatus", ["new", "confirmed", "processing", "preparing", "shipped", "delivered", "cancelled", "refunded"]).default("new").notNull(),
  source: varchar("source", { length: 48 }).default("shopify").notNull(),
  shopifyCreatedAt: timestamp("shopifyCreatedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const orderItems = mysqlTable("orderItems", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  shopifyLineItemId: varchar("shopifyLineItemId", { length: 128 }),
  shopifyProductId: varchar("shopifyProductId", { length: 128 }),
  productTitle: varchar("productTitle", { length: 255 }).notNull(),
  variantTitle: varchar("variantTitle", { length: 255 }),
  quantity: int("quantity").default(1).notNull(),
  unitPrice: decimal("unitPrice", { precision: 12, scale: 2 }).default("0").notNull(),
  imageUrl: varchar("imageUrl", { length: 512 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const orderEvents = mysqlTable("orderEvents", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  status: varchar("status", { length: 64 }).notNull(),
  note: text("note"),
  occurredAt: timestamp("occurredAt").defaultNow().notNull(),
});

export const adminNotifications = mysqlTable("adminNotifications", {
  id: int("id").autoincrement().primaryKey(),
  kind: mysqlEnum("kind", ["order", "custom_order", "tracking"]).notNull(),
  headline: varchar("headline", { length: 255 }).notNull(),
  body: text("body").notNull(),
  entityType: varchar("entityType", { length: 64 }).notNull(),
  entityId: varchar("entityId", { length: 128 }).notNull(),
  isRead: boolean("isRead").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const productAdminSettings = mysqlTable("productAdminSettings", {
  id: int("id").autoincrement().primaryKey(),
  shopifyProductId: varchar("shopifyProductId", { length: 128 }).notNull().unique(),
  category: varchar("category", { length: 120 }),
  discountAmount: decimal("discountAmount", { precision: 12, scale: 2 }).default("0").notNull(),
  isNew: boolean("isNew").default(false).notNull(),
  isBestSeller: boolean("isBestSeller").default(false).notNull(),
  customizationEnabled: boolean("customizationEnabled").default(false).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const inventorySnapshots = mysqlTable("inventorySnapshots", {
  id: int("id").autoincrement().primaryKey(),
  shopifyInventoryItemId: varchar("shopifyInventoryItemId", { length: 128 }).notNull().unique(),
  shopifyProductId: varchar("shopifyProductId", { length: 128 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  stock: int("stock").default(0).notNull(),
  outOfStock: boolean("outOfStock").default(false).notNull(),
  notifyWhenAvailable: boolean("notifyWhenAvailable").default(false).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const adminSyncStates = mysqlTable("adminSyncStates", {
  syncKey: varchar("syncKey", { length: 80 }).primaryKey(),
  lastSyncAt: timestamp("lastSyncAt"),
  lastWebhookAt: timestamp("lastWebhookAt"),
  cursor: text("cursor"),
  lastError: text("lastError"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

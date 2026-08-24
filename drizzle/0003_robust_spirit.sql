CREATE TABLE `adminNotifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`kind` enum('order','custom_order','tracking') NOT NULL,
	`headline` varchar(255) NOT NULL,
	`body` text NOT NULL,
	`entityType` varchar(64) NOT NULL,
	`entityId` varchar(128) NOT NULL,
	`isRead` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `adminNotifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `adminSyncStates` (
	`syncKey` varchar(80) NOT NULL,
	`lastSyncAt` timestamp,
	`lastWebhookAt` timestamp,
	`cursor` text,
	`lastError` text,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `adminSyncStates_syncKey` PRIMARY KEY(`syncKey`)
);
--> statement-breakpoint
CREATE TABLE `customers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`shopifyCustomerId` varchar(128),
	`name` varchar(180) NOT NULL,
	`email` varchar(320),
	`phone` varchar(64),
	`orderCount` int NOT NULL DEFAULT 0,
	`totalSpent` decimal(12,2) NOT NULL DEFAULT '0',
	`latestOrderAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `customers_id` PRIMARY KEY(`id`),
	CONSTRAINT `customers_shopifyCustomerId_unique` UNIQUE(`shopifyCustomerId`)
);
--> statement-breakpoint
CREATE TABLE `inventorySnapshots` (
	`id` int AUTO_INCREMENT NOT NULL,
	`shopifyInventoryItemId` varchar(128) NOT NULL,
	`shopifyProductId` varchar(128) NOT NULL,
	`title` varchar(255) NOT NULL,
	`stock` int NOT NULL DEFAULT 0,
	`outOfStock` boolean NOT NULL DEFAULT false,
	`notifyWhenAvailable` boolean NOT NULL DEFAULT false,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `inventorySnapshots_id` PRIMARY KEY(`id`),
	CONSTRAINT `inventorySnapshots_shopifyInventoryItemId_unique` UNIQUE(`shopifyInventoryItemId`)
);
--> statement-breakpoint
CREATE TABLE `orderEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`status` varchar(64) NOT NULL,
	`note` text,
	`occurredAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `orderEvents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orderItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`shopifyLineItemId` varchar(128),
	`shopifyProductId` varchar(128),
	`productTitle` varchar(255) NOT NULL,
	`variantTitle` varchar(255),
	`quantity` int NOT NULL DEFAULT 1,
	`unitPrice` decimal(12,2) NOT NULL DEFAULT '0',
	`imageUrl` varchar(512),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `orderItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`shopifyOrderId` varchar(128) NOT NULL,
	`orderNumber` varchar(80) NOT NULL,
	`customerId` int,
	`customerName` varchar(180) NOT NULL,
	`customerEmail` varchar(320),
	`customerPhone` varchar(64),
	`deliveryAddress` text,
	`currencyCode` varchar(8) NOT NULL DEFAULT 'INR',
	`subtotal` decimal(12,2) NOT NULL DEFAULT '0',
	`shippingCharge` decimal(12,2) NOT NULL DEFAULT '0',
	`discountAmount` decimal(12,2) NOT NULL DEFAULT '0',
	`finalTotal` decimal(12,2) NOT NULL DEFAULT '0',
	`paymentMethod` varchar(80),
	`paymentStatus` enum('pending','paid','partially_paid','refunded','voided') NOT NULL DEFAULT 'pending',
	`orderStatus` enum('new','confirmed','processing','preparing','shipped','delivered','cancelled','refunded') NOT NULL DEFAULT 'new',
	`source` varchar(48) NOT NULL DEFAULT 'shopify',
	`shopifyCreatedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`),
	CONSTRAINT `orders_shopifyOrderId_unique` UNIQUE(`shopifyOrderId`),
	CONSTRAINT `orders_orderNumber_unique` UNIQUE(`orderNumber`)
);
--> statement-breakpoint
CREATE TABLE `productAdminSettings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`shopifyProductId` varchar(128) NOT NULL,
	`category` varchar(120),
	`discountAmount` decimal(12,2) NOT NULL DEFAULT '0',
	`isNew` boolean NOT NULL DEFAULT false,
	`isBestSeller` boolean NOT NULL DEFAULT false,
	`customizationEnabled` boolean NOT NULL DEFAULT false,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `productAdminSettings_id` PRIMARY KEY(`id`),
	CONSTRAINT `productAdminSettings_shopifyProductId_unique` UNIQUE(`shopifyProductId`)
);
--> statement-breakpoint
ALTER TABLE `customOrders` ADD `adminStatus` enum('new','discussing','confirmed','creating','completed','delivered','cancelled') DEFAULT 'new' NOT NULL;--> statement-breakpoint
ALTER TABLE `customOrders` ADD `internalNotes` text;--> statement-breakpoint
ALTER TABLE `customOrders` ADD `updatedAt` timestamp DEFAULT (now()) NOT NULL ON UPDATE CURRENT_TIMESTAMP;
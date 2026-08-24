CREATE TABLE `customOrders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(120) NOT NULL,
	`whatsapp` varchar(40) NOT NULL,
	`occasion` varchar(180) NOT NULL,
	`productType` varchar(120) NOT NULL,
	`colorStyle` text NOT NULL,
	`budget` varchar(64) NOT NULL,
	`requiredDate` varchar(32) NOT NULL,
	`referenceImageKey` varchar(512),
	`referenceImageUrl` varchar(512),
	`message` text NOT NULL,
	`status` enum('new','reviewed','in_progress','closed') NOT NULL DEFAULT 'new',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `customOrders_id` PRIMARY KEY(`id`)
);

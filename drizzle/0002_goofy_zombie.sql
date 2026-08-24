CREATE TABLE `trackingRequests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderNumber` varchar(120) NOT NULL,
	`status` enum('new','reviewed','closed') NOT NULL DEFAULT 'new',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `trackingRequests_id` PRIMARY KEY(`id`)
);

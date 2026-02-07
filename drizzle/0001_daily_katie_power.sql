CREATE TABLE `attendance` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`generation` int NOT NULL,
	`tableNumber` varchar(10) NOT NULL,
	`seatPosition` int NOT NULL,
	`attendedAt` timestamp NOT NULL DEFAULT (now()),
	`syncedToSheet` enum('pending','synced','failed') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `attendance_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `members` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`generation` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `members_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `seats` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`generation` int NOT NULL,
	`tableNumber` varchar(10) NOT NULL,
	`seatPosition` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `seats_id` PRIMARY KEY(`id`)
);

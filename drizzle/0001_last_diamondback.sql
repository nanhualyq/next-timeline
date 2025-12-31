CREATE TABLE `crawler_log` (
	`id` integer PRIMARY KEY NOT NULL,
	`channel_id` integer NOT NULL,
	`timestamp` text DEFAULT (CURRENT_TIMESTAMP),
	`status` text NOT NULL,
	`result` text,
	FOREIGN KEY (`channel_id`) REFERENCES `channel`(`id`) ON UPDATE no action ON DELETE cascade
);

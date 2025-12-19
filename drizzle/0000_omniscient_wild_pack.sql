CREATE TABLE `article` (
	`id` integer PRIMARY KEY NOT NULL,
	`channel_id` integer NOT NULL,
	`title` text NOT NULL,
	`link` text NOT NULL,
	`summary` text,
	`content` text,
	`pub_time` text,
	`cover` text,
	`read` integer DEFAULT false,
	`star` integer DEFAULT false,
	`author` text,
	FOREIGN KEY (`channel_id`) REFERENCES `channel`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `article_link_unique` ON `article` (`link`);--> statement-breakpoint
CREATE TABLE `channel` (
	`id` integer PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`title` text NOT NULL,
	`link` text NOT NULL,
	`description` text,
	`category` text,
	`icon` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `channel_link_unique` ON `channel` (`link`);
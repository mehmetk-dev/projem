ALTER TABLE `projects` ADD `results` text DEFAULT '' NOT NULL;
--> statement-breakpoint
CREATE TABLE `testimonials` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`role` text DEFAULT '' NOT NULL,
	`company` text DEFAULT '' NOT NULL,
	`quote` text NOT NULL,
	`avatar` text,
	`project_id` integer,
	`display_order` integer DEFAULT 0 NOT NULL,
	`published` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	`updated_at` text,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `testimonials_published_idx` ON `testimonials` (`published`);
--> statement-breakpoint
CREATE INDEX `testimonials_order_idx` ON `testimonials` (`display_order`);

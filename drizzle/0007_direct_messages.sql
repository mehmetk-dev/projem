CREATE TABLE `direct_messages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`sender_id` integer NOT NULL,
	`content` text NOT NULL,
	`read_at` text,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`sender_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `direct_messages_user_id_idx` ON `direct_messages` (`user_id`);
--> statement-breakpoint
CREATE INDEX `direct_messages_sender_id_idx` ON `direct_messages` (`sender_id`);
--> statement-breakpoint
CREATE INDEX `direct_messages_created_at_idx` ON `direct_messages` (`created_at`);

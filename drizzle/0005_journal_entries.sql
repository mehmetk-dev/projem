CREATE TABLE `journal_entries` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `user_id` integer NOT NULL,
  `entry_date` text NOT NULL,
  `title` text NOT NULL,
  `content` text DEFAULT '' NOT NULL,
  `mood` text DEFAULT 'calm' NOT NULL,
  `image` text,
  `created_at` text DEFAULT (current_timestamp) NOT NULL,
  `updated_at` text,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
CREATE INDEX `journal_user_id_idx` ON `journal_entries` (`user_id`);
CREATE INDEX `journal_entry_date_idx` ON `journal_entries` (`entry_date`);
CREATE UNIQUE INDEX `journal_user_date_idx` ON `journal_entries` (`user_id`,`entry_date`);

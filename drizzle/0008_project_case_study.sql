ALTER TABLE `projects` ADD `summary` text DEFAULT '' NOT NULL;
--> statement-breakpoint
ALTER TABLE `projects` ADD `client` text DEFAULT '' NOT NULL;
--> statement-breakpoint
ALTER TABLE `projects` ADD `role` text DEFAULT '' NOT NULL;
--> statement-breakpoint
ALTER TABLE `projects` ADD `year` integer;
--> statement-breakpoint
ALTER TABLE `projects` ADD `stack` text DEFAULT '' NOT NULL;
--> statement-breakpoint
ALTER TABLE `projects` ADD `featured` integer DEFAULT false NOT NULL;

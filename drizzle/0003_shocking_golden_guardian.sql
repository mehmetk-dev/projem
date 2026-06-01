CREATE TABLE `spotify_recent_tracks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`spotify_track_id` text NOT NULL,
	`track` text NOT NULL,
	`artist` text NOT NULL,
	`album` text DEFAULT '' NOT NULL,
	`album_image_url` text DEFAULT '' NOT NULL,
	`local_image` text,
	`track_url` text DEFAULT '' NOT NULL,
	`played_at` text NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `spotify_recent_tracks_unique_idx` ON `spotify_recent_tracks` (`spotify_track_id`,`played_at`);--> statement-breakpoint
CREATE INDEX `spotify_recent_tracks_played_at_idx` ON `spotify_recent_tracks` (`played_at`);
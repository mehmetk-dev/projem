CREATE TABLE `rate_limits` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `key_hash` text NOT NULL,
  `count` integer DEFAULT 0 NOT NULL,
  `reset_at` integer NOT NULL,
  `updated_at` text DEFAULT (current_timestamp) NOT NULL
);
CREATE UNIQUE INDEX `rate_limits_key_hash_unique` ON `rate_limits` (`key_hash`);
CREATE INDEX `rate_limits_reset_at_idx` ON `rate_limits` (`reset_at`);

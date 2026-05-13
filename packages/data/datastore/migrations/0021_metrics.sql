CREATE TABLE `metrics` (
  `id` text PRIMARY KEY NOT NULL,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL,
  `name` text NOT NULL,
  `value` real NOT NULL,
  `dimensions` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `metrics_updated_at_idx` ON `metrics` (`updated_at`);
--> statement-breakpoint
CREATE INDEX `metrics_name_created_at_idx` ON `metrics` (`name`, `created_at`);

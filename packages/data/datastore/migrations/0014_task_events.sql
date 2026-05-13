CREATE TABLE `task_events` (
  `id` text PRIMARY KEY NOT NULL,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL,
  `task_id` text NOT NULL,
  `status` text NOT NULL,
  `reason` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `task_events_updated_at_idx` ON `task_events` (`updated_at`);
--> statement-breakpoint
CREATE INDEX `task_events_task_id_idx` ON `task_events` (`task_id`);

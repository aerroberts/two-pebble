CREATE TABLE `memories` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`project_id` text NOT NULL,
	`name` text NOT NULL,
	`path` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `memories_updated_at_idx` ON `memories` (`updated_at`);--> statement-breakpoint
CREATE INDEX `memories_project_id_idx` ON `memories` (`project_id`);
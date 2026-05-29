CREATE TABLE `skills` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`project_id` text NOT NULL,
	`name` text DEFAULT 'Untitled' NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`disk_folder_path` text NOT NULL,
	`archived_at` integer
);
--> statement-breakpoint
CREATE INDEX `skills_updated_at_idx` ON `skills` (`updated_at`);--> statement-breakpoint
CREATE INDEX `skills_project_id_idx` ON `skills` (`project_id`);
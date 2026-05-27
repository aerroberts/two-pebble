CREATE TABLE `known_ides` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`kind` text NOT NULL,
	`display_name` text NOT NULL,
	`executable_path` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `known_ides_updated_at_idx` ON `known_ides` (`updated_at`);
--> statement-breakpoint
ALTER TABLE `app_settings` ADD `default_known_ide_id` text;

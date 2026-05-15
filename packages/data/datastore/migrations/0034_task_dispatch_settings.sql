CREATE TABLE `task_dispatch_settings` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`scope_kind` text NOT NULL,
	`scope_id` text NOT NULL,
	`concurrency` integer NOT NULL DEFAULT 0,
	`dispatch_mode` text NOT NULL DEFAULT 'manual',
	`auto_agent_registry_id` text
);
--> statement-breakpoint
CREATE INDEX `task_dispatch_settings_updated_at_idx` ON `task_dispatch_settings` (`updated_at`);
--> statement-breakpoint
CREATE UNIQUE INDEX `task_dispatch_settings_scope_idx` ON `task_dispatch_settings` (`scope_kind`,`scope_id`);

CREATE TABLE `automations` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`name` text NOT NULL,
	`agent_registry_id` text NOT NULL,
	`message` text DEFAULT '' NOT NULL,
	`interval_unit` text NOT NULL,
	`interval_value` integer DEFAULT 0 NOT NULL,
	`last_ran_at` integer,
	`enabled` integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE INDEX `automations_updated_at_idx` ON `automations` (`updated_at`);
--> statement-breakpoint
CREATE TABLE `heartbeats` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`tick_at` integer NOT NULL,
	`duration_ms` integer NOT NULL,
	`listener_count` integer NOT NULL,
	`reports` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `heartbeats_updated_at_idx` ON `heartbeats` (`updated_at`);
--> statement-breakpoint
CREATE INDEX `heartbeats_tick_at_idx` ON `heartbeats` (`tick_at`);

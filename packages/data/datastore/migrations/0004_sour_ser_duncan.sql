PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_agent_calls` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`agent_id` text NOT NULL,
	`provider` text NOT NULL,
	`model_id` text NOT NULL,
	`status` text NOT NULL,
	`error_message` text NOT NULL,
	`started_at` integer NOT NULL,
	`completed_at` integer NOT NULL,
	`data` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_agent_calls`("id", "created_at", "updated_at", "agent_id", "provider", "model_id", "status", "error_message", "started_at", "completed_at", "data") SELECT "id", "created_at", "updated_at", coalesce("agent_id", ''), "provider", "model_id", "status", coalesce("error_message", ''), "started_at", coalesce("completed_at", 0), coalesce("data", '{}') FROM `agent_calls`;--> statement-breakpoint
DROP TABLE `agent_calls`;--> statement-breakpoint
ALTER TABLE `__new_agent_calls` RENAME TO `agent_calls`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `agent_calls_updated_at_idx` ON `agent_calls` (`updated_at`);--> statement-breakpoint
CREATE TABLE `__new_agents` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`status` text NOT NULL,
	`started_at` integer NOT NULL,
	`completed_at` integer NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_agents`("id", "created_at", "updated_at", "name", "description", "status", "started_at", "completed_at") SELECT "id", "created_at", "updated_at", "name", coalesce("description", ''), "status", "started_at", coalesce("completed_at", 0) FROM `agents`;--> statement-breakpoint
DROP TABLE `agents`;--> statement-breakpoint
ALTER TABLE `__new_agents` RENAME TO `agents`;--> statement-breakpoint
CREATE INDEX `agents_updated_at_idx` ON `agents` (`updated_at`);

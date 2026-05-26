CREATE TABLE `tracked_prs` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`task_id` text NOT NULL,
	`deliverable_id` text NOT NULL,
	`agent_id` text NOT NULL,
	`integration_id` text NOT NULL,
	`repo` text NOT NULL,
	`number` integer NOT NULL,
	`url` text NOT NULL,
	`state` text NOT NULL,
	`checks` text DEFAULT '[]' NOT NULL,
	`last_checked_at` integer NOT NULL,
	`last_event_at` integer,
	`etag` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tracked_prs_repo_number_idx` ON `tracked_prs` (`repo`,`number`);--> statement-breakpoint
CREATE UNIQUE INDEX `tracked_prs_task_deliverable_idx` ON `tracked_prs` (`task_id`,`deliverable_id`);--> statement-breakpoint
CREATE INDEX `tracked_prs_state_idx` ON `tracked_prs` (`state`);--> statement-breakpoint
CREATE INDEX `tracked_prs_agent_idx` ON `tracked_prs` (`agent_id`);

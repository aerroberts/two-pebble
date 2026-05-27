CREATE TABLE `agent_queued_messages` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`agent_id` text NOT NULL,
	`cells` text NOT NULL,
	`last_error` text,
	`sent_at` integer,
	`status` text DEFAULT 'queued' NOT NULL
);
--> statement-breakpoint
CREATE INDEX `agent_queued_messages_updated_at_idx` ON `agent_queued_messages` (`updated_at`);--> statement-breakpoint
CREATE INDEX `aqm_agent_status_created_idx` ON `agent_queued_messages` (`agent_id`,`status`,`created_at`);

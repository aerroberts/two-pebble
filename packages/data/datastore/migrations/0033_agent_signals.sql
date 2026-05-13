CREATE TABLE `agent_signals` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`agent_id` text NOT NULL,
	`capability_id` text NOT NULL,
	`data` text DEFAULT '{}' NOT NULL,
	`description` text NOT NULL,
	`kind` text NOT NULL,
	`name` text NOT NULL,
	`received_at` integer,
	`resolved_at` integer,
	`signal_id` text NOT NULL,
	`status` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `agent_signals_updated_at_idx` ON `agent_signals` (`updated_at`);
--> statement-breakpoint
CREATE UNIQUE INDEX `agent_signals_agent_capability_signal_idx` ON `agent_signals` (`agent_id`,`capability_id`,`signal_id`);
--> statement-breakpoint
CREATE INDEX `agent_signals_agent_status_idx` ON `agent_signals` (`agent_id`,`status`);

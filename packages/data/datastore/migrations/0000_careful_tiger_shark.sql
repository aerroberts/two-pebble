CREATE TABLE `agent_calls` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at_epoch_ms` integer NOT NULL,
	`updated_at_epoch_ms` integer NOT NULL,
	`agent_id` text,
	`provider` text NOT NULL,
	`model_id` text NOT NULL,
	`status` text NOT NULL,
	`error_message` text,
	`started_at_epoch_ms` integer NOT NULL,
	`completed_at_epoch_ms` integer,
	`data` text
);
--> statement-breakpoint
CREATE INDEX `agent_calls_updated_at_epoch_ms_idx` ON `agent_calls` (`updated_at_epoch_ms`);--> statement-breakpoint
CREATE TABLE `agent_integrations` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at_epoch_ms` integer NOT NULL,
	`updated_at_epoch_ms` integer NOT NULL,
	`provider` text NOT NULL,
	`data` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `agent_integrations_updated_at_epoch_ms_idx` ON `agent_integrations` (`updated_at_epoch_ms`);--> statement-breakpoint
CREATE TABLE `agent_traces` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at_epoch_ms` integer NOT NULL,
	`updated_at_epoch_ms` integer NOT NULL,
	`agent_id` text NOT NULL,
	`order_id` integer NOT NULL,
	`type` text NOT NULL,
	`data` text
);
--> statement-breakpoint
CREATE INDEX `agent_traces_updated_at_epoch_ms_idx` ON `agent_traces` (`updated_at_epoch_ms`);--> statement-breakpoint
CREATE TABLE `agents` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at_epoch_ms` integer NOT NULL,
	`updated_at_epoch_ms` integer NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`status` text NOT NULL,
	`started_at_epoch_ms` integer NOT NULL,
	`completed_at_epoch_ms` integer
);
--> statement-breakpoint
CREATE INDEX `agents_updated_at_epoch_ms_idx` ON `agents` (`updated_at_epoch_ms`);
ALTER TABLE `agent_calls` ADD `thread_id` text NOT NULL DEFAULT '';--> statement-breakpoint
ALTER TABLE `agent_calls` ADD `thread_cell_pointer` text NOT NULL DEFAULT '';--> statement-breakpoint
CREATE TABLE `agent_conversation_cells` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`agent_id` text NOT NULL,
	`cell_order_id` integer NOT NULL,
	`content` text NOT NULL,
	`thread_id` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `agent_conversation_cells_updated_at_idx` ON `agent_conversation_cells` (`updated_at`);--> statement-breakpoint
CREATE INDEX `agent_conversation_cells_thread_order_idx` ON `agent_conversation_cells` (`thread_id`,`cell_order_id`);

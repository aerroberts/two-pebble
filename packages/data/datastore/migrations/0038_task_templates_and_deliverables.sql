ALTER TABLE `tasks` ADD `template_id` text;
--> statement-breakpoint
ALTER TABLE `tasks` ADD `additional_context` text NOT NULL DEFAULT '';
--> statement-breakpoint
CREATE TABLE `task_templates` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`board_id` text NOT NULL,
	`name` text NOT NULL,
	`prompt` text NOT NULL DEFAULT ''
);
--> statement-breakpoint
CREATE INDEX `task_templates_updated_at_idx` ON `task_templates` (`updated_at`);
--> statement-breakpoint
CREATE TABLE `task_template_deliverables` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`template_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL DEFAULT '',
	`type` text NOT NULL,
	`order_index` integer NOT NULL DEFAULT 0
);
--> statement-breakpoint
CREATE INDEX `task_template_deliverables_updated_at_idx` ON `task_template_deliverables` (`updated_at`);
--> statement-breakpoint
CREATE TABLE `task_deliverables` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`task_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL DEFAULT '',
	`type` text NOT NULL,
	`order_index` integer NOT NULL DEFAULT 0
);
--> statement-breakpoint
CREATE INDEX `task_deliverables_updated_at_idx` ON `task_deliverables` (`updated_at`);
--> statement-breakpoint
CREATE UNIQUE INDEX `task_deliverables_task_order_idx` ON `task_deliverables` (`task_id`,`order_index`);
--> statement-breakpoint
CREATE TABLE `task_deliverable_submissions` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`task_id` text NOT NULL,
	`deliverable_id` text NOT NULL,
	`payload` text NOT NULL,
	`submitted_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `task_deliverable_submissions_updated_at_idx` ON `task_deliverable_submissions` (`updated_at`);
--> statement-breakpoint
CREATE UNIQUE INDEX `task_deliverable_submissions_task_deliverable_idx` ON `task_deliverable_submissions` (`task_id`,`deliverable_id`);

CREATE TABLE `projects` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`name` text NOT NULL,
	`assistant_agent_registry_id` text,
	`assistant_agent_id` text
);
--> statement-breakpoint
CREATE INDEX `projects_updated_at_idx` ON `projects` (`updated_at`);
--> statement-breakpoint
INSERT INTO `projects` (`id`, `created_at`, `updated_at`, `name`, `assistant_agent_registry_id`, `assistant_agent_id`)
SELECT 'proj_default', unixepoch('now') * 1000, unixepoch('now') * 1000, 'Default', `assistant_agent_registry_id`, `assistant_agent_id`
FROM `app_settings`
LIMIT 1;
--> statement-breakpoint
INSERT INTO `projects` (`id`, `created_at`, `updated_at`, `name`, `assistant_agent_registry_id`, `assistant_agent_id`)
SELECT 'proj_default', unixepoch('now') * 1000, unixepoch('now') * 1000, 'Default', NULL, NULL
WHERE NOT EXISTS (SELECT 1 FROM `projects` WHERE `id` = 'proj_default');
--> statement-breakpoint
ALTER TABLE `agents` ADD `project_id` text NOT NULL DEFAULT 'proj_default';
--> statement-breakpoint
CREATE INDEX `agents_project_id_idx` ON `agents` (`project_id`);
--> statement-breakpoint
ALTER TABLE `agent_registries` ADD `project_id` text NOT NULL DEFAULT 'proj_default';
--> statement-breakpoint
CREATE INDEX `agent_registries_project_id_idx` ON `agent_registries` (`project_id`);
--> statement-breakpoint
ALTER TABLE `documents` ADD `project_id` text NOT NULL DEFAULT 'proj_default';
--> statement-breakpoint
CREATE INDEX `documents_project_id_idx` ON `documents` (`project_id`);
--> statement-breakpoint
ALTER TABLE `task_boards` ADD `project_id` text NOT NULL DEFAULT 'proj_default';
--> statement-breakpoint
CREATE INDEX `task_boards_project_id_idx` ON `task_boards` (`project_id`);
--> statement-breakpoint
UPDATE `app_settings` SET `assistant_agent_registry_id` = NULL, `assistant_agent_id` = NULL;

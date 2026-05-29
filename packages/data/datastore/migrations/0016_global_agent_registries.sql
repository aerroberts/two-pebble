ALTER TABLE `projects` ADD `document_runner_agent_registry_id` text;--> statement-breakpoint
ALTER TABLE `projects` ADD `enabled_agent_registry_ids` text DEFAULT '[]' NOT NULL;--> statement-breakpoint
UPDATE `projects`
SET `enabled_agent_registry_ids` = COALESCE(
  (SELECT json_group_array(`ar`.`id`) FROM `agent_registries` `ar` WHERE `ar`.`project_id` = `projects`.`id`),
  '[]'
);--> statement-breakpoint
UPDATE `projects`
SET `document_runner_agent_registry_id` = (SELECT `s`.`document_runner_agent_registry_id` FROM `app_settings` `s` LIMIT 1)
WHERE EXISTS (
  SELECT 1 FROM `agent_registries` `ar`
  WHERE `ar`.`project_id` = `projects`.`id`
    AND `ar`.`id` = (SELECT `s2`.`document_runner_agent_registry_id` FROM `app_settings` `s2` LIMIT 1)
);--> statement-breakpoint
DROP INDEX IF EXISTS `agent_registries_project_id_idx`;--> statement-breakpoint
ALTER TABLE `agent_registries` DROP COLUMN `project_id`;--> statement-breakpoint
ALTER TABLE `app_settings` DROP COLUMN `document_runner_agent_registry_id`;

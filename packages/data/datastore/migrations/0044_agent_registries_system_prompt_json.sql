CREATE TABLE `__new_agent_registries` (
  `id` text PRIMARY KEY NOT NULL,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL,
  `name` text NOT NULL,
  `inference_profile_id` text,
  `third_party_agent_install_id` text,
  `system_prompt` text NOT NULL DEFAULT '{"type":"doc","content":[]}',
  `capabilities` text NOT NULL DEFAULT '[]',
  `workspace_config` text NOT NULL DEFAULT '{"kind":"cwd"}'
);
--> statement-breakpoint
INSERT INTO `__new_agent_registries` (
  `id`, `created_at`, `updated_at`, `name`, `inference_profile_id`,
  `third_party_agent_install_id`, `system_prompt`, `capabilities`, `workspace_config`
)
SELECT
  `id`, `created_at`, `updated_at`, `name`, `inference_profile_id`,
  `third_party_agent_install_id`, `system_prompt`, `capabilities`, `workspace_config`
FROM `agent_registries`;
--> statement-breakpoint
DROP TABLE `agent_registries`;
--> statement-breakpoint
ALTER TABLE `__new_agent_registries` RENAME TO `agent_registries`;

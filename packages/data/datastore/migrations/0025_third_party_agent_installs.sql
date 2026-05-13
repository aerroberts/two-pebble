CREATE TABLE `third_party_agent_installs` (
  `id` text PRIMARY KEY NOT NULL,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL,
  `framework_id` text NOT NULL,
  `name` text NOT NULL,
  `data` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `third_party_agent_installs_updated_at_idx` ON `third_party_agent_installs` (`updated_at`);
--> statement-breakpoint
INSERT INTO `third_party_agent_installs` (`id`, `created_at`, `updated_at`, `framework_id`, `name`, `data`)
  SELECT `id`, `created_at`, `updated_at`, 'claude-code', `name`, `data`
  FROM `third_party_integrations`
  WHERE `provider` = 'claude-code';
--> statement-breakpoint
CREATE TABLE `__new_agent_registries` (
  `id` text PRIMARY KEY NOT NULL,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL,
  `name` text NOT NULL,
  `kind` text NOT NULL DEFAULT 'pebble',
  `inference_profile_id` text,
  `third_party_agent_install_id` text,
  `system_prompt` text NOT NULL,
  `capabilities` text NOT NULL DEFAULT '[]',
  `workspace_config` text NOT NULL DEFAULT '{"kind":"cwd"}'
);
--> statement-breakpoint
INSERT INTO `__new_agent_registries` (
  `id`, `created_at`, `updated_at`, `name`, `kind`, `inference_profile_id`,
  `third_party_agent_install_id`, `system_prompt`, `capabilities`, `workspace_config`
)
  SELECT
    r.`id`,
    r.`created_at`,
    r.`updated_at`,
    r.`name`,
    CASE WHEN p.`provider` = 'claude-code' THEN 'framework' ELSE 'pebble' END,
    CASE WHEN p.`provider` = 'claude-code' THEN NULL ELSE r.`inference_profile_id` END,
    CASE WHEN p.`provider` = 'claude-code' THEN (
      SELECT i.`id` FROM `third_party_agent_installs` i WHERE i.`framework_id` = 'claude-code' LIMIT 1
    ) ELSE NULL END,
    r.`system_prompt`,
    r.`capabilities`,
    '{"kind":"cwd"}'
  FROM `agent_registries` r
  LEFT JOIN `inference_profiles` p ON p.`id` = r.`inference_profile_id`;
--> statement-breakpoint
DROP TABLE `agent_registries`;
--> statement-breakpoint
ALTER TABLE `__new_agent_registries` RENAME TO `agent_registries`;
--> statement-breakpoint
CREATE INDEX `agent_registries_updated_at_idx` ON `agent_registries` (`updated_at`);
--> statement-breakpoint
DELETE FROM `inference_profiles` WHERE `provider` = 'claude-code';
--> statement-breakpoint
DELETE FROM `third_party_integrations` WHERE `provider` = 'claude-code';

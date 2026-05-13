CREATE TABLE `agent_registries` (
  `id` text PRIMARY KEY NOT NULL,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL,
  `name` text NOT NULL,
  `inference_profile_id` text NOT NULL,
  `system_prompt` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `agent_registries_updated_at_idx` ON `agent_registries` (`updated_at`);

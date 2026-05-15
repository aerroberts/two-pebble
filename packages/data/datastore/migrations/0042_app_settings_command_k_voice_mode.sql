ALTER TABLE `app_settings` DROP COLUMN `assistant_fab_enabled`;
--> statement-breakpoint
ALTER TABLE `app_settings` ADD `assistant_command_k_voice_mode_enabled` integer DEFAULT 0 NOT NULL;

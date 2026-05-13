CREATE TABLE `app_settings` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`default_transcription_profile_id` text,
	`default_speech_profile_id` text
);
--> statement-breakpoint
CREATE INDEX `app_settings_updated_at_idx` ON `app_settings` (`updated_at`);

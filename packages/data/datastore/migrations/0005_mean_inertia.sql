CREATE TABLE `inference_profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`integration_id` text NOT NULL,
	`provider` text NOT NULL,
	`name` text NOT NULL,
	`data` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `inference_profiles_updated_at_idx` ON `inference_profiles` (`updated_at`);
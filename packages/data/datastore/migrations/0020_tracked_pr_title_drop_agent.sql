ALTER TABLE `tracked_prs` ADD `title` text DEFAULT '' NOT NULL;--> statement-breakpoint
DROP INDEX IF EXISTS `tracked_prs_agent_idx`;--> statement-breakpoint
ALTER TABLE `tracked_prs` DROP COLUMN `agent_id`;

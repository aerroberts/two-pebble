ALTER TABLE `agents` ADD `metadata` text NOT NULL DEFAULT '{}';
--> statement-breakpoint
ALTER TABLE `agents` ADD `agent_registry_id` text;

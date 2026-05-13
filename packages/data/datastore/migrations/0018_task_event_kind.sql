ALTER TABLE `task_events` ADD `kind` text NOT NULL DEFAULT 'status';
--> statement-breakpoint
ALTER TABLE `task_events` ADD `data` text NOT NULL DEFAULT '{}';
--> statement-breakpoint
UPDATE `task_events` SET `data` = json_object('status', `status`) WHERE `kind` = 'status';

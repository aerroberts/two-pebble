UPDATE `agents` SET `status` = 'closed' WHERE `status` = 'success';
--> statement-breakpoint
UPDATE `agents` SET `status` = 'failed' WHERE `status` = 'error';
--> statement-breakpoint
UPDATE `agents` SET `status` = 'idle'   WHERE `status` = 'running';

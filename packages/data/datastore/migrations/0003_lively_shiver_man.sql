ALTER TABLE `agent_calls` RENAME COLUMN "created_at_epoch_ms" TO "created_at";--> statement-breakpoint
ALTER TABLE `agent_calls` RENAME COLUMN "updated_at_epoch_ms" TO "updated_at";--> statement-breakpoint
ALTER TABLE `agent_calls` RENAME COLUMN "started_at_epoch_ms" TO "started_at";--> statement-breakpoint
ALTER TABLE `agent_calls` RENAME COLUMN "completed_at_epoch_ms" TO "completed_at";--> statement-breakpoint
ALTER TABLE `agent_traces` RENAME COLUMN "created_at_epoch_ms" TO "created_at";--> statement-breakpoint
ALTER TABLE `agent_traces` RENAME COLUMN "updated_at_epoch_ms" TO "updated_at";--> statement-breakpoint
ALTER TABLE `agents` RENAME COLUMN "created_at_epoch_ms" TO "created_at";--> statement-breakpoint
ALTER TABLE `agents` RENAME COLUMN "updated_at_epoch_ms" TO "updated_at";--> statement-breakpoint
ALTER TABLE `agents` RENAME COLUMN "started_at_epoch_ms" TO "started_at";--> statement-breakpoint
ALTER TABLE `agents` RENAME COLUMN "completed_at_epoch_ms" TO "completed_at";--> statement-breakpoint
ALTER TABLE `third_party_integrations` RENAME COLUMN "created_at_epoch_ms" TO "created_at";--> statement-breakpoint
ALTER TABLE `third_party_integrations` RENAME COLUMN "updated_at_epoch_ms" TO "updated_at";--> statement-breakpoint
DROP INDEX `agent_calls_updated_at_epoch_ms_idx`;--> statement-breakpoint
CREATE INDEX `agent_calls_updated_at_idx` ON `agent_calls` (`updated_at`);--> statement-breakpoint
DROP INDEX `agent_traces_updated_at_epoch_ms_idx`;--> statement-breakpoint
CREATE INDEX `agent_traces_updated_at_idx` ON `agent_traces` (`updated_at`);--> statement-breakpoint
DROP INDEX `agents_updated_at_epoch_ms_idx`;--> statement-breakpoint
CREATE INDEX `agents_updated_at_idx` ON `agents` (`updated_at`);--> statement-breakpoint
DROP INDEX `third_party_integrations_updated_at_epoch_ms_idx`;--> statement-breakpoint
CREATE INDEX `third_party_integrations_updated_at_idx` ON `third_party_integrations` (`updated_at`);
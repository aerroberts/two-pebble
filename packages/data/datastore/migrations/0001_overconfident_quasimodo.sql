ALTER TABLE `agent_integrations` RENAME TO `third_party_integrations`;--> statement-breakpoint
DROP INDEX `agent_integrations_updated_at_epoch_ms_idx`;--> statement-breakpoint
CREATE INDEX `third_party_integrations_updated_at_epoch_ms_idx` ON `third_party_integrations` (`updated_at_epoch_ms`);
CREATE TABLE `agent_calls` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`agent_id` text NOT NULL,
	`provider` text NOT NULL,
	`model_id` text NOT NULL,
	`thread_cell_pointer` text NOT NULL,
	`status` text NOT NULL,
	`error_message` text NOT NULL,
	`started_at` integer NOT NULL,
	`completed_at` integer NOT NULL,
	`data` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `agent_calls_updated_at_idx` ON `agent_calls` (`updated_at`);--> statement-breakpoint
CREATE TABLE `agent_conversation_cells` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`agent_id` text NOT NULL,
	`order_id` integer NOT NULL,
	`content` text NOT NULL,
	`label` text DEFAULT '' NOT NULL,
	`role` text DEFAULT 'user' NOT NULL,
	`thread_id` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `agent_conversation_cells_updated_at_idx` ON `agent_conversation_cells` (`updated_at`);--> statement-breakpoint
CREATE INDEX `agent_conversation_cells_thread_order_idx` ON `agent_conversation_cells` (`thread_id`,`order_id`);--> statement-breakpoint
CREATE TABLE `agent_price_line_items` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`agent_id` text NOT NULL,
	`model_call_id` text,
	`inference_profile_id` text,
	`integration_id` text,
	`provider` text NOT NULL,
	`model_id` text NOT NULL,
	`model_variant_id` text,
	`charge` text NOT NULL,
	`timestamp` integer,
	`quantity` real NOT NULL,
	`price` real NOT NULL,
	`total` real NOT NULL
);
--> statement-breakpoint
CREATE INDEX `agent_price_line_items_updated_at_idx` ON `agent_price_line_items` (`updated_at`);--> statement-breakpoint
CREATE TABLE `agent_registries` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`name` text NOT NULL,
	`inference_profile_id` text,
	`third_party_agent_install_id` text,
	`system_prompt` text DEFAULT '{"type":"doc","content":[]}' NOT NULL,
	`capabilities` text DEFAULT '[]' NOT NULL,
	`workspace_config` text DEFAULT '{"kind":"cwd"}' NOT NULL
);
--> statement-breakpoint
CREATE INDEX `agent_registries_updated_at_idx` ON `agent_registries` (`updated_at`);--> statement-breakpoint
CREATE TABLE `agent_signals` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`agent_id` text NOT NULL,
	`capability_id` text NOT NULL,
	`data` text DEFAULT '{}' NOT NULL,
	`description` text NOT NULL,
	`kind` text NOT NULL,
	`name` text NOT NULL,
	`received_at` integer,
	`resolved_at` integer,
	`signal_id` text NOT NULL,
	`status` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `agent_signals_updated_at_idx` ON `agent_signals` (`updated_at`);--> statement-breakpoint
CREATE UNIQUE INDEX `agent_signals_agent_capability_signal_idx` ON `agent_signals` (`agent_id`,`capability_id`,`signal_id`);--> statement-breakpoint
CREATE INDEX `agent_signals_agent_status_idx` ON `agent_signals` (`agent_id`,`status`);--> statement-breakpoint
CREATE TABLE `agent_traces` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`agent_id` text NOT NULL,
	`order_id` integer NOT NULL,
	`type` text NOT NULL,
	`data` text
);
--> statement-breakpoint
CREATE INDEX `agent_traces_updated_at_idx` ON `agent_traces` (`updated_at`);--> statement-breakpoint
CREATE TABLE `agents` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`workspace_id` text NOT NULL,
	`parent_agent_id` text,
	`parent_response_signal_id` text,
	`agent_registry_id` text,
	`metadata` text DEFAULT '{}' NOT NULL,
	`status` text NOT NULL,
	`started_at` integer NOT NULL,
	`completed_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `agents_updated_at_idx` ON `agents` (`updated_at`);--> statement-breakpoint
CREATE TABLE `app_settings` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`default_transcription_profile_id` text,
	`default_speech_profile_id` text,
	`assistant_agent_registry_id` text,
	`assistant_agent_id` text,
	`assistant_command_k_enabled` integer DEFAULT false NOT NULL,
	`assistant_command_k_voice_mode_enabled` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE INDEX `app_settings_updated_at_idx` ON `app_settings` (`updated_at`);--> statement-breakpoint
CREATE TABLE `automations` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`name` text NOT NULL,
	`agent_registry_id` text NOT NULL,
	`message` text DEFAULT '' NOT NULL,
	`interval_unit` text NOT NULL,
	`interval_value` integer DEFAULT 0 NOT NULL,
	`last_ran_at` integer,
	`enabled` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE INDEX `automations_updated_at_idx` ON `automations` (`updated_at`);--> statement-breakpoint
CREATE TABLE `documents` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`name` text DEFAULT 'Untitled' NOT NULL,
	`content` text DEFAULT '{"type":"doc","content":[]}' NOT NULL,
	`references` text DEFAULT '[]' NOT NULL,
	`archived_at` integer
);
--> statement-breakpoint
CREATE INDEX `documents_updated_at_idx` ON `documents` (`updated_at`);--> statement-breakpoint
CREATE TABLE `heartbeats` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`tick_at` integer NOT NULL,
	`duration_ms` integer NOT NULL,
	`listener_count` integer NOT NULL,
	`reports` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `heartbeats_updated_at_idx` ON `heartbeats` (`updated_at`);--> statement-breakpoint
CREATE INDEX `heartbeats_tick_at_idx` ON `heartbeats` (`tick_at`);--> statement-breakpoint
CREATE TABLE `inference_profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`integration_id` text NOT NULL,
	`kind` text DEFAULT 'intelligence' NOT NULL,
	`name` text NOT NULL,
	`data` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `inference_profiles_updated_at_idx` ON `inference_profiles` (`updated_at`);--> statement-breakpoint
CREATE TABLE `third_party_integrations` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`provider` text NOT NULL,
	`name` text NOT NULL,
	`data` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `third_party_integrations_updated_at_idx` ON `third_party_integrations` (`updated_at`);--> statement-breakpoint
CREATE TABLE `metrics` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`name` text NOT NULL,
	`value` real NOT NULL,
	`dimensions` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `metrics_updated_at_idx` ON `metrics` (`updated_at`);--> statement-breakpoint
CREATE INDEX `metrics_name_created_at_idx` ON `metrics` (`name`,`created_at`);--> statement-breakpoint
CREATE TABLE `repositories` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`name` text NOT NULL,
	`path` text NOT NULL,
	`base_branch` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `repositories_updated_at_idx` ON `repositories` (`updated_at`);--> statement-breakpoint
CREATE TABLE `task_boards` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `task_boards_updated_at_idx` ON `task_boards` (`updated_at`);--> statement-breakpoint
CREATE TABLE `task_deliverable_submissions` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`task_id` text NOT NULL,
	`deliverable_id` text NOT NULL,
	`payload` text NOT NULL,
	`submitted_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `task_deliverable_submissions_updated_at_idx` ON `task_deliverable_submissions` (`updated_at`);--> statement-breakpoint
CREATE UNIQUE INDEX `task_deliverable_submissions_task_deliverable_idx` ON `task_deliverable_submissions` (`task_id`,`deliverable_id`);--> statement-breakpoint
CREATE TABLE `task_deliverables` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`task_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`type` text NOT NULL,
	`order_index` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE INDEX `task_deliverables_updated_at_idx` ON `task_deliverables` (`updated_at`);--> statement-breakpoint
CREATE UNIQUE INDEX `task_deliverables_task_order_idx` ON `task_deliverables` (`task_id`,`order_index`);--> statement-breakpoint
CREATE TABLE `task_dependencies` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`board_id` text NOT NULL,
	`from_id` text NOT NULL,
	`to_id` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `task_dependencies_updated_at_idx` ON `task_dependencies` (`updated_at`);--> statement-breakpoint
CREATE TABLE `task_events` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`task_id` text NOT NULL,
	`kind` text DEFAULT 'status' NOT NULL,
	`status` text NOT NULL,
	`reason` text NOT NULL,
	`data` text DEFAULT '{}' NOT NULL
);
--> statement-breakpoint
CREATE INDEX `task_events_updated_at_idx` ON `task_events` (`updated_at`);--> statement-breakpoint
CREATE TABLE `task_pools` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`board_id` text NOT NULL,
	`parent_pool_id` text,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `task_pools_updated_at_idx` ON `task_pools` (`updated_at`);--> statement-breakpoint
CREATE TABLE `task_template_deliverables` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`template_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`type` text NOT NULL,
	`order_index` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE INDEX `task_template_deliverables_updated_at_idx` ON `task_template_deliverables` (`updated_at`);--> statement-breakpoint
CREATE TABLE `task_templates` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`board_id` text NOT NULL,
	`name` text NOT NULL,
	`prompt` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE INDEX `task_templates_updated_at_idx` ON `task_templates` (`updated_at`);--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`board_id` text NOT NULL,
	`pool_id` text,
	`name` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`template_id` text,
	`additional_context` text DEFAULT '' NOT NULL,
	`owner_id` text,
	`status` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `tasks_updated_at_idx` ON `tasks` (`updated_at`);--> statement-breakpoint
CREATE TABLE `third_party_agent_installs` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`framework_id` text NOT NULL,
	`name` text NOT NULL,
	`data` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `third_party_agent_installs_updated_at_idx` ON `third_party_agent_installs` (`updated_at`);--> statement-breakpoint
CREATE TABLE `workspaces` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`path` text NOT NULL,
	`worktree_id` text
);
--> statement-breakpoint
CREATE INDEX `workspaces_updated_at_idx` ON `workspaces` (`updated_at`);--> statement-breakpoint
CREATE TABLE `worktrees` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`repository_id` text NOT NULL,
	`branch` text NOT NULL,
	`path` text NOT NULL,
	`status` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `worktrees_updated_at_idx` ON `worktrees` (`updated_at`);
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
CREATE INDEX `worktrees_updated_at_idx` ON `worktrees` (`updated_at`);--> statement-breakpoint
CREATE INDEX `worktrees_repository_id_idx` ON `worktrees` (`repository_id`);--> statement-breakpoint
CREATE TABLE `workspaces` (
  `id` text PRIMARY KEY NOT NULL,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL,
  `path` text NOT NULL,
  `worktree_id` text
);
--> statement-breakpoint
CREATE INDEX `workspaces_updated_at_idx` ON `workspaces` (`updated_at`);--> statement-breakpoint
ALTER TABLE `agents` ADD `workspace_id` text NOT NULL DEFAULT 'legacy';

CREATE TABLE `task_boards` (
  `id` text PRIMARY KEY NOT NULL,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL,
  `name` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `task_boards_updated_at_idx` ON `task_boards` (`updated_at`);
--> statement-breakpoint
CREATE TABLE `task_pools` (
  `id` text PRIMARY KEY NOT NULL,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL,
  `board_id` text NOT NULL,
  `parent_pool_id` text,
  `name` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `task_pools_updated_at_idx` ON `task_pools` (`updated_at`);
--> statement-breakpoint
CREATE INDEX `task_pools_board_id_idx` ON `task_pools` (`board_id`);
--> statement-breakpoint
CREATE TABLE `tasks` (
  `id` text PRIMARY KEY NOT NULL,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL,
  `board_id` text NOT NULL,
  `pool_id` text,
  `name` text NOT NULL,
  `status` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `tasks_updated_at_idx` ON `tasks` (`updated_at`);
--> statement-breakpoint
CREATE INDEX `tasks_board_id_idx` ON `tasks` (`board_id`);
--> statement-breakpoint
CREATE TABLE `task_dependencies` (
  `id` text PRIMARY KEY NOT NULL,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL,
  `board_id` text NOT NULL,
  `from_id` text NOT NULL,
  `to_id` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `task_dependencies_updated_at_idx` ON `task_dependencies` (`updated_at`);
--> statement-breakpoint
CREATE INDEX `task_dependencies_board_id_idx` ON `task_dependencies` (`board_id`);

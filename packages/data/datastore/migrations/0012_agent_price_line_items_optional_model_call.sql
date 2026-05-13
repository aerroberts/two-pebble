CREATE TABLE `__new_agent_price_line_items` (
  `id` text PRIMARY KEY NOT NULL,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL,
  `agent_id` text NOT NULL,
  `model_call_id` text,
  `line_item_id` text NOT NULL,
  `timestamp` integer,
  `quantity` real NOT NULL,
  `price` real NOT NULL,
  `total` real NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_agent_price_line_items` SELECT `id`, `created_at`, `updated_at`, `agent_id`, NULLIF(`model_call_id`, ''), `line_item_id`, `timestamp`, `quantity`, `price`, `total` FROM `agent_price_line_items`;
--> statement-breakpoint
DROP TABLE `agent_price_line_items`;
--> statement-breakpoint
ALTER TABLE `__new_agent_price_line_items` RENAME TO `agent_price_line_items`;
--> statement-breakpoint
CREATE INDEX `agent_price_line_items_updated_at_idx` ON `agent_price_line_items` (`updated_at`);

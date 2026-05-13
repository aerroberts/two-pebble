CREATE TABLE `agent_price_line_items` (
  `id` text PRIMARY KEY NOT NULL,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL,
  `agent_id` text NOT NULL,
  `model_call_id` text NOT NULL,
  `line_item_id` text NOT NULL,
  `timestamp` integer,
  `quantity` real NOT NULL,
  `price` real NOT NULL,
  `total` real NOT NULL
);
--> statement-breakpoint
CREATE INDEX `agent_price_line_items_updated_at_idx` ON `agent_price_line_items` (`updated_at`);

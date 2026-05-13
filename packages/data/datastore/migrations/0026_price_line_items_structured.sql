CREATE TABLE `__new_agent_price_line_items` (
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
DROP TABLE `agent_price_line_items`;
--> statement-breakpoint
ALTER TABLE `__new_agent_price_line_items` RENAME TO `agent_price_line_items`;
--> statement-breakpoint
CREATE INDEX `agent_price_line_items_updated_at_idx` ON `agent_price_line_items` (`updated_at`);

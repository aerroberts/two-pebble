CREATE TABLE `documents` (
  `id` text PRIMARY KEY NOT NULL,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL,
  `name` text NOT NULL DEFAULT 'Untitled',
  `content` text NOT NULL DEFAULT '{"type":"doc","content":[]}'
);
--> statement-breakpoint
CREATE INDEX `documents_updated_at_idx` ON `documents` (`updated_at`);

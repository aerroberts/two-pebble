import { text } from 'drizzle-orm/sqlite-core';

import { customTable } from '../table/custom-table';

/**
 * An integration is a way for us to connect to any third-party provider
 * Such as OpenAI, Anthropic, Slack, Discord, etc.
 */
export const integrationsTable = customTable('third_party_integrations', {
  // The provider we are integrating with
  provider: text('provider').notNull(),

  // The user facing name for this integration
  name: text('name').notNull(),

  // What data is associated with this integration
  data: text('data', { mode: 'json' }).notNull(),
});

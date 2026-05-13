import { integer, real, text } from 'drizzle-orm/sqlite-core';

import { customTable } from '../table/custom-table';

/**
 * Provider-emitted price line items for model calls.
 * Each line item is keyed by its structured dimensions (provider, model,
 * optional variant, and charge) so callers can group and chart usage
 * without parsing strings. Inference profile and integration ids are
 * attached at recording time when the call ran under a known profile.
 */
export const agentPriceLineItemsTable = customTable('agent_price_line_items', {
  agentId: text('agent_id').notNull(),
  modelCallId: text('model_call_id'),
  inferenceProfileId: text('inference_profile_id'),
  integrationId: text('integration_id'),
  provider: text('provider').notNull(),
  modelId: text('model_id').notNull(),
  modelVariantId: text('model_variant_id'),
  charge: text('charge').notNull(),
  timestamp: integer('timestamp', { mode: 'number' }),
  quantity: real('quantity').notNull(),
  price: real('price').notNull(),
  total: real('total').notNull(),
});

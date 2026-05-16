import { metrics } from '@two-pebble/metrics';
import type { DatastoreContext } from '../types';

type OperationHandlerInput = {
  agentId: string;
  modelCallId: string | null;
  inferenceProfileId?: string | null;
  integrationId?: string | null;
  provider: string;
  modelId: string;
  modelVariantId?: string | null;
  charge: string;
  timestamp?: number;
  quantity: number;
  price: number;
  total: number;
};

/**
 * Exposes this datastore module contract for package-local callers.
 */
export function agentPriceLineItemsRecordOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    const row = await ctx.database
      .insert(ctx.schema.agentPriceLineItemsTable)
      .values({
        agentId: input.agentId,
        modelCallId: input.modelCallId,
        inferenceProfileId: input.inferenceProfileId ?? null,
        integrationId: input.integrationId ?? null,
        provider: input.provider,
        modelId: input.modelId,
        modelVariantId: input.modelVariantId ?? null,
        charge: input.charge,
        price: input.price,
        quantity: input.quantity,
        timestamp: input.timestamp,
        total: input.total,
      })
      .returning()
      .get();

    emitPricingMetrics(row);

    return {
      id: row.id,
      agentId: row.agentId,
      modelCallId: row.modelCallId,
      inferenceProfileId: row.inferenceProfileId ?? undefined,
      integrationId: row.integrationId ?? undefined,
      provider: row.provider,
      modelId: row.modelId,
      modelVariantId: row.modelVariantId ?? undefined,
      charge: row.charge,
      timestamp: row.timestamp ?? undefined,
      quantity: row.quantity,
      price: row.price,
      total: row.total,
    };
  };
}

interface PricingMetricRow {
  agentId: string;
  modelCallId: string | null;
  inferenceProfileId: string | null;
  integrationId: string | null;
  provider: string;
  modelId: string;
  modelVariantId: string | null;
  charge: string;
  quantity: number;
  total: number;
}

function emitPricingMetrics(row: PricingMetricRow): void {
  const dimensions: Record<string, string> = {
    agentId: row.agentId,
    provider: row.provider,
    modelId: row.modelId,
    charge: row.charge,
  };
  if (row.modelVariantId !== null) {
    dimensions.modelVariantId = row.modelVariantId;
  }
  if (row.inferenceProfileId !== null) {
    dimensions.inferenceProfileId = row.inferenceProfileId;
  }
  if (row.integrationId !== null) {
    dimensions.integrationId = row.integrationId;
  }
  if (row.modelCallId !== null) {
    dimensions.modelCallId = row.modelCallId;
  }

  metrics.emit('pricing.quantity', row.quantity, dimensions);
  metrics.emit('pricing.total', row.total, dimensions);
}

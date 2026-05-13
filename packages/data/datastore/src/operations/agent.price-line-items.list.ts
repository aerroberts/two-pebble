import { asc, eq } from 'drizzle-orm';

import type { DatastoreContext } from '../types';

type OperationHandlerInput = {
  agentId: string;
};

export function agentPriceLineItemsListOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    const rows = await ctx.database
      .select()
      .from(ctx.schema.agentPriceLineItemsTable)
      .where(eq(ctx.schema.agentPriceLineItemsTable.agentId, input.agentId))
      .orderBy(asc(ctx.schema.agentPriceLineItemsTable.createdAt))
      .all();

    return {
      items: rows.map((row) => ({
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
      })),
    };
  };
}

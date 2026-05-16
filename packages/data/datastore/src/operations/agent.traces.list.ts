import type { PebbleAgentTrace } from '@two-pebble/pebble';
import { count, desc, eq } from 'drizzle-orm';

import type { DatastoreContext } from '../types';

type OperationHandlerInput = {
  agentId: string;
  limit: number;
  offset: number;
};

/**
 * Exposes this datastore module contract for package-local callers.
 */
export function agentTracesListOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    const rows = await listAgentTraceRows(ctx, input);
    const total = await countAgentTraceRows(ctx, input);

    return {
      items: rows.map((row) => ({
        agentId: row.agentId,
        createdAt: row.createdAt,
        data: row.data,
        id: row.id,
        orderId: row.orderId,
        type: row.type,
      })) as (PebbleAgentTrace & { agentId: string; createdAt: number; id: string; orderId: number })[],
      page: {
        limit: input.limit,
        offset: input.offset,
        total,
      },
    };
  };
}

function listAgentTraceRows(ctx: DatastoreContext, input: OperationHandlerInput) {
  return ctx.database
    .select()
    .from(ctx.schema.agentTracesTable)
    .where(eq(ctx.schema.agentTracesTable.agentId, input.agentId))
    .orderBy(desc(ctx.schema.agentTracesTable.orderId))
    .limit(input.limit)
    .offset(input.offset)
    .all();
}

async function countAgentTraceRows(ctx: DatastoreContext, input: OperationHandlerInput) {
  return (
    (
      await ctx.database
        .select({ value: count() })
        .from(ctx.schema.agentTracesTable)
        .where(eq(ctx.schema.agentTracesTable.agentId, input.agentId))
        .get()
    )?.value ?? 0
  );
}

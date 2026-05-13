import type { PebbleAgentTrace } from '@two-pebble/pebble';
import { and, asc, eq } from 'drizzle-orm';

import type { DatastoreContext } from '../types';

type OperationHandlerInput = {
  agentId: string;
  type: string;
};

/**
 * Lists every trace of a given type for one agent in order. Used by the
 * rehydrate path to read the durable state-snapshot trail and replay it
 * onto capability slots without paginating through unrelated traces.
 */
export function agentTracesListByTypeOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    const rows = await ctx.database
      .select()
      .from(ctx.schema.agentTracesTable)
      .where(
        and(eq(ctx.schema.agentTracesTable.agentId, input.agentId), eq(ctx.schema.agentTracesTable.type, input.type)),
      )
      .orderBy(asc(ctx.schema.agentTracesTable.orderId))
      .all();
    return {
      items: rows.map((row) => ({
        agentId: row.agentId,
        createdAt: row.createdAt,
        data: row.data,
        id: row.id,
        orderId: row.orderId,
        type: row.type,
      })) as (PebbleAgentTrace & { agentId: string; createdAt: number; id: string; orderId: number })[],
    };
  };
}

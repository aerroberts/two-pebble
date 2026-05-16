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
    const traces = ctx.schema.agentTracesTable;
    const rows = await ctx.database
      .select()
      .from(traces)
      .where(eq(traces.agentId, input.agentId))
      .orderBy(desc(traces.orderId))
      .limit(input.limit)
      .offset(input.offset)
      .all();
    const totalRow = await ctx.database
      .select({ value: count() })
      .from(traces)
      .where(eq(traces.agentId, input.agentId))
      .get();
    const total = totalRow?.value ?? 0;

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

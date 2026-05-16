import { count, desc, eq } from 'drizzle-orm';

import type { AgentCallStatus, DatastoreContext } from '../types';

type OperationHandlerInput = {
  agentId: string;
  limit: number;
  offset: number;
};

/**
 * Exposes this datastore module contract for package-local callers.
 */
export function agentCallsListOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    const calls = ctx.schema.agentCallsTable;
    const rows = await ctx.database
      .select()
      .from(calls)
      .where(eq(calls.agentId, input.agentId))
      .orderBy(desc(calls.startedAt))
      .limit(input.limit)
      .offset(input.offset)
      .all();
    const totalRow = await ctx.database
      .select({ value: count() })
      .from(calls)
      .where(eq(calls.agentId, input.agentId))
      .get();
    const total = totalRow?.value ?? 0;

    return {
      items: rows.map((row) => ({
        agentId: row.agentId,
        completedAt: row.completedAt,
        errorMessage: row.errorMessage,
        id: row.id,
        modelId: row.modelId,
        provider: row.provider,
        startedAt: row.startedAt,
        status: row.status as AgentCallStatus,
        threadCellPointer: row.threadCellPointer,
      })),
      page: {
        limit: input.limit,
        offset: input.offset,
        total,
      },
    };
  };
}

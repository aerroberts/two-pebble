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
    const rows = await listAgentCallRows(ctx, input);
    const total = await countAgentCallRows(ctx, input);

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

function listAgentCallRows(ctx: DatastoreContext, input: OperationHandlerInput) {
  return ctx.database
    .select()
    .from(ctx.schema.agentCallsTable)
    .where(eq(ctx.schema.agentCallsTable.agentId, input.agentId))
    .orderBy(desc(ctx.schema.agentCallsTable.startedAt))
    .limit(input.limit)
    .offset(input.offset)
    .all();
}

async function countAgentCallRows(ctx: DatastoreContext, input: OperationHandlerInput) {
  return (
    (
      await ctx.database
        .select({ value: count() })
        .from(ctx.schema.agentCallsTable)
        .where(eq(ctx.schema.agentCallsTable.agentId, input.agentId))
        .get()
    )?.value ?? 0
  );
}

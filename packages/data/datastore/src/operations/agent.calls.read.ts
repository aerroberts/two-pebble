import { eq } from 'drizzle-orm';

import type { AgentCallStatus, DatastoreContext } from '../types';

type OperationHandlerInput = {
  id: string;
};

/**
 * Exposes this datastore module contract for package-local callers.
 */
export function agentCallsReadOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    const row = await ctx.database
      .select()
      .from(ctx.schema.agentCallsTable)
      .where(eq(ctx.schema.agentCallsTable.id, input.id))
      .get();

    if (row === undefined) {
      throw new Error(`Agent call not found: ${input.id}`);
    }

    return {
      agentId: row.agentId,
      completedAt: row.completedAt,
      data: row.data as object,
      errorMessage: row.errorMessage,
      id: row.id,
      modelId: row.modelId,
      provider: row.provider,
      startedAt: row.startedAt,
      status: row.status as AgentCallStatus,
      threadCellPointer: row.threadCellPointer,
    };
  };
}

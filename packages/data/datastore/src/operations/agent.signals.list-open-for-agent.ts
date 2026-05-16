import { and, asc, eq } from 'drizzle-orm';
import type { AgentSignalRecord, DatastoreContext } from '../types';

type OperationHandlerInput = {
  agentId: string;
};

/**
 * Exposes this datastore module contract for package-local callers.
 */
export function agentSignalsListOpenForAgentOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    const rows = await ctx.database
      .select()
      .from(ctx.schema.agentSignalsTable)
      .where(
        and(eq(ctx.schema.agentSignalsTable.agentId, input.agentId), eq(ctx.schema.agentSignalsTable.status, 'open')),
      )
      .orderBy(asc(ctx.schema.agentSignalsTable.createdAt))
      .all();
    return { items: rows as AgentSignalRecord[] };
  };
}

import { asc, eq } from 'drizzle-orm';
import type { AgentSignalRecord, DatastoreContext } from '../types';

type OperationHandlerInput = {
  agentId: string;
};

export function agentSignalsListForAgentOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    const rows = await ctx.database
      .select()
      .from(ctx.schema.agentSignalsTable)
      .where(eq(ctx.schema.agentSignalsTable.agentId, input.agentId))
      .orderBy(asc(ctx.schema.agentSignalsTable.createdAt))
      .all();
    return { items: rows as AgentSignalRecord[] };
  };
}

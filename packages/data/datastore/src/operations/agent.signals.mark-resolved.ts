import { eq } from 'drizzle-orm';
import type { AgentSignalRecord, DatastoreContext } from '../types';

type OperationHandlerInput = {
  id: string;
};

export function agentSignalsMarkResolvedOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    const row = await ctx.database
      .update(ctx.schema.agentSignalsTable)
      .set({ resolvedAt: Date.now(), status: 'resolved' })
      .where(eq(ctx.schema.agentSignalsTable.id, input.id))
      .returning()
      .get();
    if (row === undefined) throw new Error(`Agent signal not found: ${input.id}`);
    return row as AgentSignalRecord;
  };
}

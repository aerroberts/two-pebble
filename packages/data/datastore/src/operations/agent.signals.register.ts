import { and, eq } from 'drizzle-orm';
import type { AgentSignalRecord, DatastoreContext } from '../types';

type OperationHandlerInput = {
  agentId: string;
  capabilityId: string;
  description: string;
  name: string;
  signalId: string;
};

export function agentSignalsRegisterOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    const existing = await ctx.database
      .select()
      .from(ctx.schema.agentSignalsTable)
      .where(
        and(
          eq(ctx.schema.agentSignalsTable.agentId, input.agentId),
          eq(ctx.schema.agentSignalsTable.capabilityId, input.capabilityId),
          eq(ctx.schema.agentSignalsTable.signalId, input.signalId),
        ),
      )
      .get();
    if (existing !== undefined) {
      return existing as AgentSignalRecord;
    }

    const row = await ctx.database
      .insert(ctx.schema.agentSignalsTable)
      .values({
        agentId: input.agentId,
        capabilityId: input.capabilityId,
        data: {},
        description: input.description,
        kind: 'awaited',
        name: input.name,
        signalId: input.signalId,
        status: 'open',
      })
      .returning()
      .get();
    return row as AgentSignalRecord;
  };
}

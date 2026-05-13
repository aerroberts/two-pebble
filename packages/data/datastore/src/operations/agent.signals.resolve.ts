import type { PebbleJsonValue } from '@two-pebble/pebble';
import { and, eq } from 'drizzle-orm';
import type { AgentSignalRecord, DatastoreContext } from '../types';

type OperationHandlerInput = {
  agentId: string;
  capabilityId: string;
  data: PebbleJsonValue;
  signalId: string;
};

export function agentSignalsResolveOperation(ctx: DatastoreContext) {
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
    if (existing === undefined) {
      throw new Error(`Agent signal not found: ${input.agentId}/${input.capabilityId}/${input.signalId}`);
    }
    if (existing.status === 'resolved') {
      return existing as AgentSignalRecord;
    }

    const row = await ctx.database
      .update(ctx.schema.agentSignalsTable)
      .set({ data: input.data, receivedAt: Date.now(), status: 'received' })
      .where(eq(ctx.schema.agentSignalsTable.id, existing.id))
      .returning()
      .get();
    return row as AgentSignalRecord;
  };
}

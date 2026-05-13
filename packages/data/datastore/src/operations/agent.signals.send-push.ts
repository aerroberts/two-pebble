import type { PebbleJsonValue } from '@two-pebble/pebble';
import type { AgentSignalRecord, DatastoreContext } from '../types';

type OperationHandlerInput = {
  agentId: string;
  capabilityId: string;
  data: PebbleJsonValue;
  description: string;
  name: string;
  signalId: string;
};

export function agentSignalsSendPushOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    const now = Date.now();
    const row = await ctx.database
      .insert(ctx.schema.agentSignalsTable)
      .values({
        agentId: input.agentId,
        capabilityId: input.capabilityId,
        data: input.data,
        description: input.description,
        kind: 'push',
        name: input.name,
        receivedAt: now,
        signalId: input.signalId,
        status: 'received',
      })
      .returning()
      .get();
    return row as AgentSignalRecord;
  };
}

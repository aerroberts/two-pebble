import type { PebbleAgentTrace } from '@two-pebble/pebble';
import type { DatastoreContext } from '../types';

type OperationHandlerInput = {
  agentId: string;
  data: PebbleAgentTrace['data'];
  id: string;
  orderId: number;
  type: PebbleAgentTrace['type'];
};

export function agentTracesRecordOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    const row = await ctx.database
      .insert(ctx.schema.agentTracesTable)
      .values({
        agentId: input.agentId,
        data: input.data,
        id: input.id,
        orderId: input.orderId,
        type: input.type,
      })
      .returning()
      .get();

    return {
      ...input,
      createdAt: row.createdAt,
    } as PebbleAgentTrace & { agentId: string; createdAt: number; id: string; orderId: number };
  };
}

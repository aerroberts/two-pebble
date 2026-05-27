import type { DataCells } from '@two-pebble/pebble';
import type { AgentQueuedMessageRecord, DatastoreContext } from '../types';

type OperationHandlerInput = {
  agentId: string;
  cells: DataCells;
};

/**
 * Exposes this datastore module contract for package-local callers.
 */
export function agentQueuedMessagesEnqueueOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    const row = await ctx.database
      .insert(ctx.schema.agentQueuedMessagesTable)
      .values({
        agentId: input.agentId,
        cells: input.cells,
        status: 'queued',
      })
      .returning()
      .get();
    return row as AgentQueuedMessageRecord;
  };
}

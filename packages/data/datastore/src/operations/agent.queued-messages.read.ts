import { eq } from 'drizzle-orm';
import type { AgentQueuedMessageRecord, DatastoreContext } from '../types';

type OperationHandlerInput = {
  id: string;
};

/**
 * Exposes this datastore module contract for package-local callers.
 */
export function agentQueuedMessagesReadOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    const row = await ctx.database
      .select()
      .from(ctx.schema.agentQueuedMessagesTable)
      .where(eq(ctx.schema.agentQueuedMessagesTable.id, input.id))
      .get();
    if (row === undefined) {
      throw new Error(`Agent queued message not found: ${input.id}`);
    }
    return row as AgentQueuedMessageRecord;
  };
}

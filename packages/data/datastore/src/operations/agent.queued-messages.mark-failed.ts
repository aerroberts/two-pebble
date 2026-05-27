import { and, eq } from 'drizzle-orm';
import type { AgentQueuedMessageRecord, DatastoreContext } from '../types';

type OperationHandlerInput = {
  error: string;
  id: string;
};

/**
 * Exposes this datastore module contract for package-local callers.
 */
export function agentQueuedMessagesMarkFailedOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    const row = await ctx.database
      .update(ctx.schema.agentQueuedMessagesTable)
      .set({ lastError: input.error, status: 'failed' })
      .where(
        and(
          eq(ctx.schema.agentQueuedMessagesTable.id, input.id),
          eq(ctx.schema.agentQueuedMessagesTable.status, 'queued'),
        ),
      )
      .returning()
      .get();
    if (row !== undefined) {
      return row as AgentQueuedMessageRecord;
    }

    const existing = await ctx.database
      .select()
      .from(ctx.schema.agentQueuedMessagesTable)
      .where(eq(ctx.schema.agentQueuedMessagesTable.id, input.id))
      .get();
    if (existing === undefined) {
      throw new Error(`Agent queued message not found: ${input.id}`);
    }
    return existing as AgentQueuedMessageRecord;
  };
}

import { and, asc, eq } from 'drizzle-orm';
import type { AgentQueuedMessageRecord, DatastoreContext } from '../types';

type OperationHandlerInput = {
  agentId: string;
};

/**
 * Exposes this datastore module contract for package-local callers.
 */
export function agentQueuedMessagesPeekNextOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    const row = await ctx.database
      .select()
      .from(ctx.schema.agentQueuedMessagesTable)
      .where(
        and(
          eq(ctx.schema.agentQueuedMessagesTable.agentId, input.agentId),
          eq(ctx.schema.agentQueuedMessagesTable.status, 'queued'),
        ),
      )
      .orderBy(asc(ctx.schema.agentQueuedMessagesTable.createdAt), asc(ctx.schema.agentQueuedMessagesTable.id))
      .limit(1)
      .get();
    return row === undefined ? null : (row as AgentQueuedMessageRecord);
  };
}

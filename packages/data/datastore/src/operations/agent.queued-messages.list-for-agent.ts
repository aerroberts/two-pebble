import { asc, eq } from 'drizzle-orm';
import type { AgentQueuedMessageRecord, DatastoreContext } from '../types';

type OperationHandlerInput = {
  agentId: string;
};

/**
 * Exposes this datastore module contract for package-local callers.
 */
export function agentQueuedMessagesListForAgentOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    const rows = await ctx.database
      .select()
      .from(ctx.schema.agentQueuedMessagesTable)
      .where(eq(ctx.schema.agentQueuedMessagesTable.agentId, input.agentId))
      .orderBy(asc(ctx.schema.agentQueuedMessagesTable.createdAt), asc(ctx.schema.agentQueuedMessagesTable.id))
      .all();
    return { items: rows as AgentQueuedMessageRecord[] };
  };
}

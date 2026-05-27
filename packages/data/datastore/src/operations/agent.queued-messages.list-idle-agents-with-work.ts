import { and, eq } from 'drizzle-orm';
import type { DatastoreContext } from '../types';

type OperationHandlerInput = {
  empty?: never;
};

/**
 * Exposes this datastore module contract for package-local callers.
 */
export function agentQueuedMessagesListIdleAgentsWithWorkOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput = {}) {
    void input;
    const rows = await ctx.database
      .selectDistinct({ agentId: ctx.schema.agentQueuedMessagesTable.agentId })
      .from(ctx.schema.agentQueuedMessagesTable)
      .innerJoin(ctx.schema.agentsTable, eq(ctx.schema.agentQueuedMessagesTable.agentId, ctx.schema.agentsTable.id))
      .where(and(eq(ctx.schema.agentQueuedMessagesTable.status, 'queued'), eq(ctx.schema.agentsTable.status, 'idle')))
      .all();
    return rows.map((row) => row.agentId);
  };
}

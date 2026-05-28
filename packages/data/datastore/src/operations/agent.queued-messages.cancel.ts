import { and, eq } from 'drizzle-orm';
import type { DatastoreContext } from '../types';

type OperationHandlerInput = {
  id: string;
};

/**
 * Exposes this datastore module contract for package-local callers.
 */
export function agentQueuedMessagesCancelOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    const row = await ctx.database
      .delete(ctx.schema.agentQueuedMessagesTable)
      .where(
        and(
          eq(ctx.schema.agentQueuedMessagesTable.id, input.id),
          eq(ctx.schema.agentQueuedMessagesTable.status, 'queued'),
        ),
      )
      .returning({ id: ctx.schema.agentQueuedMessagesTable.id })
      .get();

    return { deleted: row !== undefined, id: input.id };
  };
}

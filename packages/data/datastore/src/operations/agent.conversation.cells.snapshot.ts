import type { DataCells } from '@two-pebble/pebble';
import { and, asc, eq, lte } from 'drizzle-orm';
import type { DatastoreContext } from '../types';

type OperationHandlerInput = {
  orderId?: number;
  threadId: string;
};

/**
 * Exposes this datastore module contract for package-local callers.
 */
export function agentConversationCellsSnapshotOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    const cells = ctx.schema.agentConversationCellsTable;
    const filter =
      input.orderId === undefined
        ? eq(cells.threadId, input.threadId)
        : and(eq(cells.threadId, input.threadId), lte(cells.orderId, input.orderId));

    const rows = await ctx.database.select().from(cells).where(filter).orderBy(asc(cells.orderId));

    return {
      orderId: input.orderId ?? null,
      items: rows.map((row) => ({
        agentId: row.agentId,
        orderId: row.orderId,
        content: row.content as DataCells,
        id: row.id,
        label: row.label,
        role: row.role,
        threadId: row.threadId,
      })),
      threadId: input.threadId,
    };
  };
}

import type { DataCells } from '@two-pebble/pebble';
import { and, asc, eq, lte } from 'drizzle-orm';
import type { DatastoreContext } from '../types';

type OperationHandlerInput = {
  orderId?: number;
  threadId: string;
};

export function agentConversationCellsSnapshotOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    const rows = await ctx.database
      .select()
      .from(ctx.schema.agentConversationCellsTable)
      .where(readSnapshotFilter(ctx, input))
      .orderBy(asc(ctx.schema.agentConversationCellsTable.orderId));

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

function readSnapshotFilter(ctx: DatastoreContext, input: OperationHandlerInput) {
  if (input.orderId === undefined) {
    return eq(ctx.schema.agentConversationCellsTable.threadId, input.threadId);
  }

  return and(
    eq(ctx.schema.agentConversationCellsTable.threadId, input.threadId),
    lte(ctx.schema.agentConversationCellsTable.orderId, input.orderId),
  );
}

import type { ConversationThreadCell, DataCells } from '@two-pebble/pebble';
import type { DatastoreContext } from '../types';

type OperationHandlerInput = {
  agentId: string;
  orderId: number;
  content: DataCells;
  label: string;
  role: ConversationThreadCell['role'];
  threadId: string;
};

export function agentConversationCellsRecordOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    const row = await ctx.database
      .insert(ctx.schema.agentConversationCellsTable)
      .values({
        agentId: input.agentId,
        orderId: input.orderId,
        content: input.content,
        label: input.label,
        role: input.role,
        threadId: input.threadId,
      })
      .returning()
      .get();

    return {
      agentId: row.agentId,
      orderId: row.orderId,
      content: row.content as DataCells,
      label: row.label,
      role: row.role,
      threadId: row.threadId,
    };
  };
}

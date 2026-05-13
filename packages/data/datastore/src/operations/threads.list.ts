import { count, desc, max, min, sql } from 'drizzle-orm';
import type { DatastoreContext } from '../types';

type OperationHandlerInput = {
  empty?: never;
};

type AgentIdListSource = string | null;

export function threadsListOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    void input;
    const cells = ctx.schema.agentConversationCellsTable;
    const rows = await ctx.database
      .select({
        agentIds: sql<string>`group_concat(distinct ${cells.agentId})`.as('agent_ids'),
        cellCount: count().as('cell_count'),
        createdAt: min(cells.createdAt).as('created_at'),
        threadId: cells.threadId,
        updatedAt: max(cells.updatedAt).as('updated_at'),
      })
      .from(cells)
      .groupBy(cells.threadId)
      .orderBy(desc(max(cells.updatedAt)));

    return {
      items: rows.map((row) => ({
        agentIds: parseAgentIds(row.agentIds),
        cellCount: Number(row.cellCount ?? 0),
        createdAt: Number(row.createdAt ?? 0),
        threadId: row.threadId,
        updatedAt: Number(row.updatedAt ?? 0),
      })),
    };
  };
}

function parseAgentIds(value: AgentIdListSource): string[] {
  if (value === null || value.length === 0) {
    return [];
  }
  return value.split(',').filter((id) => id.length > 0);
}

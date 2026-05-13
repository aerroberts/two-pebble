import { count, desc } from 'drizzle-orm';

import type { AgentStatus, DatastoreContext } from '../types';

type OperationHandlerInput = {
  limit: number;
  offset: number;
};

export function agentListOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    const rows = await ctx.database
      .select()
      .from(ctx.schema.agentsTable)
      .orderBy(desc(ctx.schema.agentsTable.startedAt))
      .limit(input.limit)
      .offset(input.offset)
      .all();
    const total = (await ctx.database.select({ value: count() }).from(ctx.schema.agentsTable).get())?.value ?? 0;

    return {
      items: rows.map((row) => ({
        agentRegistryId: row.agentRegistryId,
        completedAt: row.completedAt,
        description: row.description,
        id: row.id,
        metadata: row.metadata,
        name: row.name,
        parentAgentId: row.parentAgentId,
        startedAt: row.startedAt,
        status: row.status as AgentStatus,
      })),
      page: {
        limit: input.limit,
        offset: input.offset,
        total,
      },
    };
  };
}

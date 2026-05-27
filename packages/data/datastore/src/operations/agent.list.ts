import { count, desc, eq } from 'drizzle-orm';

import type { AgentStatus, DatastoreContext } from '../types';

type OperationHandlerInput = {
  limit: number;
  offset: number;
  projectId?: string;
};

/**
 * Exposes this datastore module contract for package-local callers.
 */
export function agentListOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    const query = ctx.database
      .select()
      .from(ctx.schema.agentsTable)
      .orderBy(desc(ctx.schema.agentsTable.startedAt))
      .limit(input.limit)
      .offset(input.offset);
    const rows =
      input.projectId === undefined
        ? await query.all()
        : await query.where(eq(ctx.schema.agentsTable.projectId, input.projectId)).all();
    const total =
      input.projectId === undefined
        ? ((await ctx.database.select({ value: count() }).from(ctx.schema.agentsTable).get())?.value ?? 0)
        : ((
            await ctx.database
              .select({ value: count() })
              .from(ctx.schema.agentsTable)
              .where(eq(ctx.schema.agentsTable.projectId, input.projectId))
              .get()
          )?.value ?? 0);

    return {
      items: rows.map((row) => ({
        agentRegistryId: row.agentRegistryId,
        completedAt: row.completedAt,
        description: row.description,
        id: row.id,
        metadata: row.metadata,
        name: row.name,
        parentAgentId: row.parentAgentId,
        parentResponseSignalId: row.parentResponseSignalId,
        projectId: row.projectId,
        startedAt: row.startedAt,
        status: row.status as AgentStatus,
        workspaceId: row.workspaceId,
      })),
      page: {
        limit: input.limit,
        offset: input.offset,
        total,
      },
    };
  };
}

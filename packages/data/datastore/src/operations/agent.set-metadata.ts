import { eq } from 'drizzle-orm';

import type { AgentStatus, DatastoreContext } from '../types';

type OperationHandlerInput = {
  id: string;
  metadata: string;
};

/**
 * Exposes this datastore module contract for package-local callers.
 */
export function agentSetMetadataOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    const existing = await ctx.database
      .select()
      .from(ctx.schema.agentsTable)
      .where(eq(ctx.schema.agentsTable.id, input.id))
      .get();
    if (existing === undefined) {
      throw new Error(`Agent not found: ${input.id}`);
    }
    const row = await ctx.database
      .update(ctx.schema.agentsTable)
      .set({ metadata: input.metadata })
      .where(eq(ctx.schema.agentsTable.id, input.id))
      .returning()
      .get();
    return {
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
    };
  };
}

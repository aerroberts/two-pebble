import { eq } from 'drizzle-orm';

import type { AgentStatus, DatastoreContext } from '../types';

type OperationHandlerInput = {
  id: string;
};

export function agentReadOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    const row = await ctx.database
      .select()
      .from(ctx.schema.agentsTable)
      .where(eq(ctx.schema.agentsTable.id, input.id))
      .get();

    if (row === undefined) {
      throw new Error(`Agent not found: ${input.id}`);
    }

    return {
      agentRegistryId: row.agentRegistryId,
      completedAt: row.completedAt,
      description: row.description,
      id: row.id,
      metadata: row.metadata,
      name: row.name,
      parentAgentId: row.parentAgentId,
      parentResponseSignalId: row.parentResponseSignalId,
      startedAt: row.startedAt,
      status: row.status as AgentStatus,
      workspaceId: row.workspaceId,
    };
  };
}

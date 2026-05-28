import { eq } from 'drizzle-orm';

import { createUtcNow } from '../table/create-utc-now';
import type { DatastoreContext } from '../types';

type OperationHandlerInput = {
  id: string;
  status: 'idle' | 'running' | 'waiting' | 'interrupted' | 'offline' | 'failed';
};

/**
 * Exposes this datastore module contract for package-local callers.
 */
export function agentSetStatusOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    const existing = await ctx.database
      .select()
      .from(ctx.schema.agentsTable)
      .where(eq(ctx.schema.agentsTable.id, input.id))
      .get();
    if (existing === undefined) {
      throw new Error(`Agent not found: ${input.id}`);
    }
    const isTerminal = input.status === 'failed';
    const completedAt = isTerminal && existing.completedAt === 0 ? createUtcNow() : existing.completedAt;
    const row = await ctx.database
      .update(ctx.schema.agentsTable)
      .set({ status: input.status, completedAt })
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
      status: row.status as OperationHandlerInput['status'],
      workspaceId: row.workspaceId,
    };
  };
}

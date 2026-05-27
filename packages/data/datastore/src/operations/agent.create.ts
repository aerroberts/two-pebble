import { createUtcNow } from '../table/create-utc-now';
import type { DatastoreContext } from '../types';

type OperationHandlerInput = {
  agentRegistryId?: string | null;
  description: string;
  id?: string;
  name: string;
  parentAgentId?: string | null;
  parentResponseSignalId?: string | null;
  projectId?: string;
  workspaceId: string;
};

/**
 * Exposes this datastore module contract for package-local callers.
 */
export function agentCreateOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    const now = createUtcNow();

    const row = await ctx.database
      .insert(ctx.schema.agentsTable)
      .values({
        agentRegistryId: input.agentRegistryId ?? null,
        completedAt: 0,
        description: input.description,
        ...(input.id === undefined ? {} : { id: input.id }),
        metadata: '{}',
        name: input.name,
        parentAgentId: input.parentAgentId ?? null,
        parentResponseSignalId: input.parentResponseSignalId ?? null,
        projectId: input.projectId ?? 'proj_default',
        startedAt: now,
        status: 'idle',
        workspaceId: input.workspaceId,
      })
      .returning()
      .get();

    return {
      agentRegistryId: row.agentRegistryId,
      completedAt: 0,
      description: input.description,
      id: input.id ?? row.id,
      metadata: row.metadata,
      name: input.name,
      parentAgentId: row.parentAgentId,
      parentResponseSignalId: row.parentResponseSignalId,
      projectId: row.projectId,
      startedAt: now,
      status: 'idle' as const,
      workspaceId: input.workspaceId,
    };
  };
}

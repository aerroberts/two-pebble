import { eq } from 'drizzle-orm';
import type { DatastoreContext, ProjectRecord } from '../types';

type OperationHandlerInput = {
  assistantAgentId?: string | null;
  assistantAgentRegistryId?: string | null;
  id: string;
  name?: string;
};

export function projectsUpdateOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    const existing = await ctx.database
      .select()
      .from(ctx.schema.projectsTable)
      .where(eq(ctx.schema.projectsTable.id, input.id))
      .get();
    if (existing === undefined) {
      throw new Error(`Project not found: ${input.id}`);
    }

    const row = await ctx.database
      .update(ctx.schema.projectsTable)
      .set({
        assistantAgentId: input.assistantAgentId === undefined ? existing.assistantAgentId : input.assistantAgentId,
        assistantAgentRegistryId:
          input.assistantAgentRegistryId === undefined
            ? existing.assistantAgentRegistryId
            : input.assistantAgentRegistryId,
        name: input.name ?? existing.name,
      })
      .where(eq(ctx.schema.projectsTable.id, input.id))
      .returning()
      .get();
    return row as ProjectRecord;
  };
}

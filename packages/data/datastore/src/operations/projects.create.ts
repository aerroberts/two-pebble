import type { DatastoreContext, ProjectRecord } from '../types';

type OperationHandlerInput = {
  assistantAgentId?: string | null;
  assistantAgentRegistryId?: string | null;
  name: string;
};

export function projectsCreateOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    const row = await ctx.database
      .insert(ctx.schema.projectsTable)
      .values({
        assistantAgentId: input.assistantAgentId ?? null,
        assistantAgentRegistryId: input.assistantAgentRegistryId ?? null,
        name: input.name,
      })
      .returning()
      .get();
    return row as ProjectRecord;
  };
}

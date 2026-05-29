import type { DatastoreContext, ProjectRecord } from '../types';
import { toProjectRecord } from '../utils/project-record';

type OperationHandlerInput = {
  assistantAgentId?: string | null;
  assistantAgentRegistryId?: string | null;
  documentRunnerAgentRegistryId?: string | null;
  enabledAgentRegistryIds?: string[];
  name: string;
};

export function projectsCreateOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput): Promise<ProjectRecord> {
    const row = await ctx.database
      .insert(ctx.schema.projectsTable)
      .values({
        assistantAgentId: input.assistantAgentId ?? null,
        assistantAgentRegistryId: input.assistantAgentRegistryId ?? null,
        documentRunnerAgentRegistryId: input.documentRunnerAgentRegistryId ?? null,
        enabledAgentRegistryIds: JSON.stringify(input.enabledAgentRegistryIds ?? []),
        name: input.name,
      })
      .returning()
      .get();
    return toProjectRecord(row);
  };
}

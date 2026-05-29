import type { DatastoreContext, SkillRecord } from '../types';

type OperationHandlerInput = {
  diskFolderPath: string;
  description?: string;
  name?: string;
  projectId?: string;
};

/**
 * Inserts a skill metadata row. Folder existence is validated in the daemon
 * handler (via `validateSkillFolder`) before this runs — the datastore never
 * touches disk and treats `diskFolderPath` as an opaque string.
 */
export function skillsCreateOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    const row = await ctx.database
      .insert(ctx.schema.skillsTable)
      .values({
        diskFolderPath: input.diskFolderPath,
        name: input.name ?? 'Untitled',
        projectId: input.projectId ?? 'proj_default',
        ...(input.description === undefined ? {} : { description: input.description }),
      })
      .returning()
      .get();

    return row as SkillRecord;
  };
}

import { eq } from 'drizzle-orm';
import type { DatastoreContext, SkillRecord } from '../types';

type OperationHandlerInput = {
  description?: string;
  diskFolderPath?: string;
  id: string;
  name?: string;
};

/**
 * Updates the supplied skill fields. The daemon handler re-validates the
 * folder before calling this only when `diskFolderPath` changes; the
 * datastore itself never touches disk.
 */
export function skillsUpdateOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    const existing = await ctx.database
      .select()
      .from(ctx.schema.skillsTable)
      .where(eq(ctx.schema.skillsTable.id, input.id))
      .get();

    if (existing === undefined) {
      throw new Error(`Skill not found: ${input.id}`);
    }

    const row = await ctx.database
      .update(ctx.schema.skillsTable)
      .set({
        description: input.description ?? existing.description,
        diskFolderPath: input.diskFolderPath ?? existing.diskFolderPath,
        name: input.name ?? existing.name,
      })
      .where(eq(ctx.schema.skillsTable.id, input.id))
      .returning()
      .get();

    return row as SkillRecord;
  };
}

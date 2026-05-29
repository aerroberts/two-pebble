import { and, eq, isNull } from 'drizzle-orm';
import type { DatastoreContext, SkillRecord } from '../types';

type OperationHandlerInput = {
  id: string;
};

/**
 * Reads a single non-archived skill.
 *
 * Archived rows are excluded so the same `archivedAt IS NULL` filter that
 * gates list queries also gates point reads — a refetch right after
 * archiving cannot silently revive the row in a client cache.
 */
export function skillsReadOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    const row = await ctx.database
      .select()
      .from(ctx.schema.skillsTable)
      .where(and(eq(ctx.schema.skillsTable.id, input.id), isNull(ctx.schema.skillsTable.archivedAt)))
      .get();

    if (row === undefined) {
      throw new Error(`Skill not found: ${input.id}`);
    }

    return row as SkillRecord;
  };
}

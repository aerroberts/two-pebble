import { and, count, desc, eq, isNull } from 'drizzle-orm';
import type { DatastoreContext, SkillRecord } from '../types';

type OperationHandlerInput = {
  limit: number;
  offset: number;
  projectId?: string;
};

/**
 * Lists active (non-archived) skills, newest-updated first.
 */
export function skillsListOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    const where =
      input.projectId === undefined
        ? isNull(ctx.schema.skillsTable.archivedAt)
        : and(eq(ctx.schema.skillsTable.projectId, input.projectId), isNull(ctx.schema.skillsTable.archivedAt));
    const rows = await ctx.database
      .select()
      .from(ctx.schema.skillsTable)
      .where(where)
      .orderBy(desc(ctx.schema.skillsTable.updatedAt))
      .limit(input.limit)
      .offset(input.offset)
      .all();
    const total =
      (await ctx.database.select({ value: count() }).from(ctx.schema.skillsTable).where(where).get())?.value ?? 0;

    return {
      items: rows as SkillRecord[],
      page: {
        limit: input.limit,
        offset: input.offset,
        total,
      },
    };
  };
}

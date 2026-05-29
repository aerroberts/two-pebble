import { count, desc, eq } from 'drizzle-orm';
import type { DatastoreContext, MemoryRecord } from '../types';

type OperationHandlerInput = {
  limit: number;
  offset: number;
  projectId?: string;
};

/**
 * Lists memory collection rows, newest-updated first, optionally scoped to
 * a project. Returns a page envelope matching the other list operations.
 */
export function memoriesListOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    const where = input.projectId === undefined ? undefined : eq(ctx.schema.memoriesTable.projectId, input.projectId);
    const rows = await ctx.database
      .select()
      .from(ctx.schema.memoriesTable)
      .where(where)
      .orderBy(desc(ctx.schema.memoriesTable.updatedAt))
      .limit(input.limit)
      .offset(input.offset)
      .all();
    const total =
      (await ctx.database.select({ value: count() }).from(ctx.schema.memoriesTable).where(where).get())?.value ?? 0;

    return {
      items: rows as MemoryRecord[],
      page: {
        limit: input.limit,
        offset: input.offset,
        total,
      },
    };
  };
}

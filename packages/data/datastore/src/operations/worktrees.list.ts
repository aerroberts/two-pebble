import type { SQL } from 'drizzle-orm';
import { and, count, eq } from 'drizzle-orm';
import type { DatastoreContext, WorktreeRecord, WorktreeStatus } from '../types';

type OperationHandlerInput = {
  limit: number;
  offset: number;
  repositoryId?: string;
  status?: WorktreeStatus;
};

export function worktreesListOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    const filters: SQL[] = [];
    if (input.repositoryId !== undefined) {
      filters.push(eq(ctx.schema.worktreesTable.repositoryId, input.repositoryId));
    }
    if (input.status !== undefined) {
      filters.push(eq(ctx.schema.worktreesTable.status, input.status));
    }
    const where = filters.length === 0 ? undefined : and(...filters);

    const rows = await ctx.database
      .select()
      .from(ctx.schema.worktreesTable)
      .where(where)
      .orderBy(ctx.schema.worktreesTable.updatedAt)
      .limit(input.limit)
      .offset(input.offset)
      .all();
    const total =
      (await ctx.database.select({ value: count() }).from(ctx.schema.worktreesTable).where(where).get())?.value ?? 0;

    return {
      items: rows as WorktreeRecord[],
      page: {
        limit: input.limit,
        offset: input.offset,
        total,
      },
    };
  };
}

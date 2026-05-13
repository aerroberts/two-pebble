import { count } from 'drizzle-orm';
import type { DatastoreContext, WorkspaceRecord } from '../types';

type OperationHandlerInput = {
  limit: number;
  offset: number;
};

export function workspacesListOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    const rows = await ctx.database
      .select()
      .from(ctx.schema.workspacesTable)
      .orderBy(ctx.schema.workspacesTable.updatedAt)
      .limit(input.limit)
      .offset(input.offset)
      .all();
    const total = (await ctx.database.select({ value: count() }).from(ctx.schema.workspacesTable).get())?.value ?? 0;

    return {
      items: rows as WorkspaceRecord[],
      page: {
        limit: input.limit,
        offset: input.offset,
        total,
      },
    };
  };
}

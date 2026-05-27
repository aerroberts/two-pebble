import { asc } from 'drizzle-orm';
import type { DatastoreContext, ProjectRecord } from '../types';

type OperationHandlerInput = Record<string, never>;

export function projectsListOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    void input;
    const rows = await ctx.database
      .select()
      .from(ctx.schema.projectsTable)
      .orderBy(asc(ctx.schema.projectsTable.name))
      .all();
    return { items: rows as ProjectRecord[] };
  };
}

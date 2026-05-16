import { count } from 'drizzle-orm';
import type { DatastoreContext, RepositoryRecord } from '../types';

type OperationHandlerInput = {
  limit: number;
  offset: number;
};

/**
 * Exposes this datastore module contract for package-local callers.
 */
export function repositoriesListOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    const rows = await ctx.database
      .select()
      .from(ctx.schema.repositoriesTable)
      .orderBy(ctx.schema.repositoriesTable.name)
      .limit(input.limit)
      .offset(input.offset)
      .all();
    const total = (await ctx.database.select({ value: count() }).from(ctx.schema.repositoriesTable).get())?.value ?? 0;

    return {
      items: rows as RepositoryRecord[],
      page: {
        limit: input.limit,
        offset: input.offset,
        total,
      },
    };
  };
}

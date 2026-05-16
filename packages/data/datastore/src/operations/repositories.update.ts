import { eq } from 'drizzle-orm';
import type { DatastoreContext, RepositoryRecord } from '../types';

type OperationHandlerInput = {
  baseBranch?: string;
  id: string;
  name?: string;
  path?: string;
};

/**
 * Exposes this datastore module contract for package-local callers.
 */
export function repositoriesUpdateOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    const existing = await ctx.database
      .select()
      .from(ctx.schema.repositoriesTable)
      .where(eq(ctx.schema.repositoriesTable.id, input.id))
      .get();

    if (existing === undefined) {
      throw new Error(`Repository not found: ${input.id}`);
    }

    const row = await ctx.database
      .update(ctx.schema.repositoriesTable)
      .set({
        baseBranch: input.baseBranch ?? existing.baseBranch,
        name: input.name ?? existing.name,
        path: input.path ?? existing.path,
      })
      .where(eq(ctx.schema.repositoriesTable.id, input.id))
      .returning()
      .get();

    return row as RepositoryRecord;
  };
}

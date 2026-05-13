import { eq } from 'drizzle-orm';
import type { DatastoreContext, RepositoryRecord } from '../types';

type OperationHandlerInput = {
  id: string;
};

export function repositoriesReadOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    const row = await ctx.database
      .select()
      .from(ctx.schema.repositoriesTable)
      .where(eq(ctx.schema.repositoriesTable.id, input.id))
      .get();

    if (row === undefined) {
      throw new Error(`Repository not found: ${input.id}`);
    }

    return row as RepositoryRecord;
  };
}

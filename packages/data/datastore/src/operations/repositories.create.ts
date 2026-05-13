import type { DatastoreContext, RepositoryRecord } from '../types';

type OperationHandlerInput = {
  baseBranch: string;
  name: string;
  path: string;
};

export function repositoriesCreateOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    const row = await ctx.database
      .insert(ctx.schema.repositoriesTable)
      .values({
        baseBranch: input.baseBranch,
        name: input.name,
        path: input.path,
      })
      .returning()
      .get();

    return row as RepositoryRecord;
  };
}

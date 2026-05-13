import { eq } from 'drizzle-orm';

import type { DatastoreContext } from '../types';

type OperationHandlerInput = {
  id: string;
};

export function repositoriesDeleteOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    await ctx.database.delete(ctx.schema.repositoriesTable).where(eq(ctx.schema.repositoriesTable.id, input.id)).run();

    return { id: input.id };
  };
}

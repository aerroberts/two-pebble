import { eq } from 'drizzle-orm';

import type { DatastoreContext } from '../types';

type OperationHandlerInput = {
  id: string;
};

export function documentsDeleteOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    await ctx.database.delete(ctx.schema.documentsTable).where(eq(ctx.schema.documentsTable.id, input.id)).run();

    return { id: input.id };
  };
}

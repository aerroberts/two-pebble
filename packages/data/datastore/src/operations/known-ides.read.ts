import { eq } from 'drizzle-orm';

import type { DatastoreContext, KnownIdeRecord } from '../types';

type OperationHandlerInput = {
  id: string;
};

export function knownIdesReadOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    const row = await ctx.database
      .select()
      .from(ctx.schema.knownIdesTable)
      .where(eq(ctx.schema.knownIdesTable.id, input.id))
      .get();

    if (row === undefined) {
      throw new Error(`Known IDE not found: ${input.id}`);
    }

    return row as KnownIdeRecord;
  };
}

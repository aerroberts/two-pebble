import { eq } from 'drizzle-orm';
import type { DatastoreContext, MemoryRecord } from '../types';

type OperationHandlerInput = {
  id: string;
};

/**
 * Reads a single memory collection row by id. Throws when the row is
 * absent so callers can surface an unavailable-collection state.
 */
export function memoriesReadOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    const row = await ctx.database
      .select()
      .from(ctx.schema.memoriesTable)
      .where(eq(ctx.schema.memoriesTable.id, input.id))
      .get();

    if (row === undefined) {
      throw new Error(`Memory not found: ${input.id}`);
    }

    return row as MemoryRecord;
  };
}

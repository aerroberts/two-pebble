import { eq } from 'drizzle-orm';
import type { DatastoreContext, MemoryRecord } from '../types';

type OperationHandlerInput = {
  id: string;
  description?: string;
  name?: string;
  path?: string;
};

/**
 * Updates the mutable fields of a memory collection row.
 */
export function memoriesUpdateOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    const existing = await ctx.database
      .select()
      .from(ctx.schema.memoriesTable)
      .where(eq(ctx.schema.memoriesTable.id, input.id))
      .get();

    if (existing === undefined) {
      throw new Error(`Memory not found: ${input.id}`);
    }

    const row = await ctx.database
      .update(ctx.schema.memoriesTable)
      .set({
        description: input.description ?? existing.description,
        name: input.name ?? existing.name,
        path: input.path ?? existing.path,
      })
      .where(eq(ctx.schema.memoriesTable.id, input.id))
      .returning()
      .get();

    return row as MemoryRecord;
  };
}

import { eq } from 'drizzle-orm';
import type { DatastoreContext, MemoryRecord } from '../types';

type OperationHandlerInput = {
  id: string;
  name?: string;
};

/**
 * Updates the mutable fields of a memory collection row. Only `name` is
 * mutable; `path` and `projectId` are fixed at creation.
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
      .set({ name: input.name ?? existing.name })
      .where(eq(ctx.schema.memoriesTable.id, input.id))
      .returning()
      .get();

    return row as MemoryRecord;
  };
}

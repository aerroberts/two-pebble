import { eq } from 'drizzle-orm';
import type { DatastoreContext, TaskRecord } from '../types';

type OperationHandlerInput = {
  id: string;
  description: string;
};

export function tasksUpdateDescriptionOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    const row = await ctx.database
      .update(ctx.schema.tasksTable)
      .set({ description: input.description })
      .where(eq(ctx.schema.tasksTable.id, input.id))
      .returning()
      .get();
    if (row === undefined) {
      throw new Error(`task "${input.id}" not found`);
    }
    return row as TaskRecord;
  };
}

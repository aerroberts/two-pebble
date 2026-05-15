import { eq } from 'drizzle-orm';
import type { DatastoreContext, TaskTemplateRecord } from '../types';

type OperationHandlerInput = {
  id: string;
};

export function taskTemplatesReadOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    const row = await ctx.database
      .select()
      .from(ctx.schema.taskTemplatesTable)
      .where(eq(ctx.schema.taskTemplatesTable.id, input.id))
      .get();
    if (row === undefined) {
      throw new Error(`task template "${input.id}" not found`);
    }
    return row as TaskTemplateRecord;
  };
}

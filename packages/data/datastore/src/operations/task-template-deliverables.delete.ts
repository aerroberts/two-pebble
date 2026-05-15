import { eq } from 'drizzle-orm';
import type { DatastoreContext } from '../types';

type OperationHandlerInput = {
  id: string;
};

export function taskTemplateDeliverablesDeleteOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    await ctx.database
      .delete(ctx.schema.taskTemplateDeliverablesTable)
      .where(eq(ctx.schema.taskTemplateDeliverablesTable.id, input.id))
      .run();
    return { id: input.id };
  };
}

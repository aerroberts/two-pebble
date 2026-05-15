import { eq } from 'drizzle-orm';
import type { DatastoreContext } from '../types';

type OperationHandlerInput = {
  id: string;
};

export function taskTemplatesDeleteOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    await ctx.database
      .delete(ctx.schema.taskTemplateDeliverablesTable)
      .where(eq(ctx.schema.taskTemplateDeliverablesTable.templateId, input.id))
      .run();
    await ctx.database
      .delete(ctx.schema.taskTemplatesTable)
      .where(eq(ctx.schema.taskTemplatesTable.id, input.id))
      .run();
    return { id: input.id };
  };
}

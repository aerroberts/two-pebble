import { eq } from 'drizzle-orm';
import type { DatastoreContext } from '../types';

type OperationHandlerInput = {
  id: string;
};

export function taskDeliverablesDeleteOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    await ctx.database
      .delete(ctx.schema.taskDeliverableSubmissionsTable)
      .where(eq(ctx.schema.taskDeliverableSubmissionsTable.deliverableId, input.id))
      .run();
    await ctx.database
      .delete(ctx.schema.taskDeliverablesTable)
      .where(eq(ctx.schema.taskDeliverablesTable.id, input.id))
      .run();
    return { id: input.id };
  };
}

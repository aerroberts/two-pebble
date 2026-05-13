import { and, eq } from 'drizzle-orm';
import type { DatastoreContext } from '../types';

type OperationHandlerInput = {
  fromId: string;
  toId: string;
};

export function taskDependenciesDeleteOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    await ctx.database
      .delete(ctx.schema.taskDependenciesTable)
      .where(
        and(
          eq(ctx.schema.taskDependenciesTable.fromId, input.fromId),
          eq(ctx.schema.taskDependenciesTable.toId, input.toId),
        ),
      )
      .run();
    return { fromId: input.fromId, toId: input.toId };
  };
}

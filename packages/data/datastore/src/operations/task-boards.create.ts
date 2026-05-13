import type { DatastoreContext, TaskBoardRecord } from '../types';

type OperationHandlerInput = {
  name: string;
};

export function taskBoardsCreateOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    const row = await ctx.database.insert(ctx.schema.taskBoardsTable).values({ name: input.name }).returning().get();
    return row as TaskBoardRecord;
  };
}

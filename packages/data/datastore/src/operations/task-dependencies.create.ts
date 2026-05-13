import type { DatastoreContext, TaskDependencyRecord } from '../types';

type OperationHandlerInput = {
  boardId: string;
  fromId: string;
  toId: string;
};

export function taskDependenciesCreateOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    const row = await ctx.database
      .insert(ctx.schema.taskDependenciesTable)
      .values({ boardId: input.boardId, fromId: input.fromId, toId: input.toId })
      .returning()
      .get();
    return row as TaskDependencyRecord;
  };
}

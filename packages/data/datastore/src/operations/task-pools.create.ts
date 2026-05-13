import type { DatastoreContext, TaskPoolRecord } from '../types';

type OperationHandlerInput = {
  boardId: string;
  parentPoolId: string | null;
  name: string;
};

export function taskPoolsCreateOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    const row = await ctx.database
      .insert(ctx.schema.taskPoolsTable)
      .values({ boardId: input.boardId, parentPoolId: input.parentPoolId, name: input.name })
      .returning()
      .get();
    return row as TaskPoolRecord;
  };
}

import type { DatastoreContext, TaskRecord } from '../types';

type OperationHandlerInput = {
  boardId: string;
  poolId: string | null;
  name: string;
  description?: string;
  status: string;
};

export function tasksCreateOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    const row = await ctx.database
      .insert(ctx.schema.tasksTable)
      .values({
        boardId: input.boardId,
        poolId: input.poolId,
        name: input.name,
        description: input.description ?? '',
        status: input.status,
      })
      .returning()
      .get();
    return row as TaskRecord;
  };
}

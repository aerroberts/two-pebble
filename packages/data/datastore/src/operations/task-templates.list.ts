import { asc, eq } from 'drizzle-orm';
import type { DatastoreContext, TaskTemplateRecord } from '../types';

type OperationHandlerInput = {
  boardId: string;
};

export function taskTemplatesListOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    const rows = await ctx.database
      .select()
      .from(ctx.schema.taskTemplatesTable)
      .where(eq(ctx.schema.taskTemplatesTable.boardId, input.boardId))
      .orderBy(asc(ctx.schema.taskTemplatesTable.createdAt))
      .all();
    return { items: rows as TaskTemplateRecord[] };
  };
}

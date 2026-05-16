import type { DatastoreContext, TaskTemplateRecord } from '../types';

type OperationHandlerInput = {
  boardId: string;
  name: string;
  prompt?: string;
};

/**
 * Exposes this datastore module contract for package-local callers.
 */
export function taskTemplatesCreateOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    const row = await ctx.database
      .insert(ctx.schema.taskTemplatesTable)
      .values({ boardId: input.boardId, name: input.name, prompt: input.prompt ?? '' })
      .returning()
      .get();
    return row as TaskTemplateRecord;
  };
}

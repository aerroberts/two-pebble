import { eq, inArray } from 'drizzle-orm';
import type { DatastoreContext } from '../types';

type OperationHandlerInput = {
  id: string;
};

export function taskBoardsDeleteOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    const taskRows = await ctx.database
      .select({ id: ctx.schema.tasksTable.id })
      .from(ctx.schema.tasksTable)
      .where(eq(ctx.schema.tasksTable.boardId, input.id))
      .all();
    const taskIds = taskRows.map((row) => row.id);
    if (taskIds.length > 0) {
      await ctx.database
        .delete(ctx.schema.taskEventsTable)
        .where(inArray(ctx.schema.taskEventsTable.taskId, taskIds))
        .run();
      await ctx.database
        .delete(ctx.schema.taskDeliverableSubmissionsTable)
        .where(inArray(ctx.schema.taskDeliverableSubmissionsTable.taskId, taskIds))
        .run();
      await ctx.database
        .delete(ctx.schema.taskDeliverablesTable)
        .where(inArray(ctx.schema.taskDeliverablesTable.taskId, taskIds))
        .run();
    }
    const templateRows = await ctx.database
      .select({ id: ctx.schema.taskTemplatesTable.id })
      .from(ctx.schema.taskTemplatesTable)
      .where(eq(ctx.schema.taskTemplatesTable.boardId, input.id))
      .all();
    const templateIds = templateRows.map((row) => row.id);
    if (templateIds.length > 0) {
      await ctx.database
        .delete(ctx.schema.taskTemplateDeliverablesTable)
        .where(inArray(ctx.schema.taskTemplateDeliverablesTable.templateId, templateIds))
        .run();
    }
    await ctx.database
      .delete(ctx.schema.taskTemplatesTable)
      .where(eq(ctx.schema.taskTemplatesTable.boardId, input.id))
      .run();
    await ctx.database
      .delete(ctx.schema.taskDependenciesTable)
      .where(eq(ctx.schema.taskDependenciesTable.boardId, input.id))
      .run();
    await ctx.database.delete(ctx.schema.tasksTable).where(eq(ctx.schema.tasksTable.boardId, input.id)).run();
    await ctx.database.delete(ctx.schema.taskPoolsTable).where(eq(ctx.schema.taskPoolsTable.boardId, input.id)).run();
    await ctx.database.delete(ctx.schema.taskBoardsTable).where(eq(ctx.schema.taskBoardsTable.id, input.id)).run();
    return { id: input.id };
  };
}

import { count, eq, inArray } from 'drizzle-orm';
import type { DatastoreContext } from '../types';

type OperationHandlerInput = {
  id: string;
};

export function projectsDeleteOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    const total = (await ctx.database.select({ value: count() }).from(ctx.schema.projectsTable).get())?.value ?? 0;
    if (total <= 1) {
      throw new Error('Cannot delete the last project.');
    }

    const boardRows = await ctx.database
      .select({ id: ctx.schema.taskBoardsTable.id })
      .from(ctx.schema.taskBoardsTable)
      .where(eq(ctx.schema.taskBoardsTable.projectId, input.id))
      .all();
    for (const board of boardRows) {
      await ctx.datastore.taskBoards.delete({ id: board.id });
    }

    const agentRows = await ctx.database
      .select({ id: ctx.schema.agentsTable.id })
      .from(ctx.schema.agentsTable)
      .where(eq(ctx.schema.agentsTable.projectId, input.id))
      .all();
    const agentIds = agentRows.map((row) => row.id);
    if (agentIds.length > 0) {
      await ctx.database
        .delete(ctx.schema.agentConversationCellsTable)
        .where(inArray(ctx.schema.agentConversationCellsTable.agentId, agentIds))
        .run();
      await ctx.database
        .delete(ctx.schema.agentSignalsTable)
        .where(inArray(ctx.schema.agentSignalsTable.agentId, agentIds))
        .run();
      await ctx.database
        .delete(ctx.schema.agentCallsTable)
        .where(inArray(ctx.schema.agentCallsTable.agentId, agentIds))
        .run();
      await ctx.database
        .delete(ctx.schema.agentPriceLineItemsTable)
        .where(inArray(ctx.schema.agentPriceLineItemsTable.agentId, agentIds))
        .run();
      await ctx.database
        .delete(ctx.schema.agentTracesTable)
        .where(inArray(ctx.schema.agentTracesTable.agentId, agentIds))
        .run();
    }

    await ctx.database.delete(ctx.schema.agentsTable).where(eq(ctx.schema.agentsTable.projectId, input.id)).run();
    await ctx.database
      .delete(ctx.schema.agentRegistriesTable)
      .where(eq(ctx.schema.agentRegistriesTable.projectId, input.id))
      .run();
    await ctx.database.delete(ctx.schema.documentsTable).where(eq(ctx.schema.documentsTable.projectId, input.id)).run();
    await ctx.database.delete(ctx.schema.projectsTable).where(eq(ctx.schema.projectsTable.id, input.id)).run();
    return { id: input.id };
  };
}

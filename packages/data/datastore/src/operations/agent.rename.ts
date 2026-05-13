import { eq } from 'drizzle-orm';
import type { DatastoreContext } from '../types';

type OperationHandlerInput = {
  id: string;
  name: string;
};

export function agentRenameOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    const row = await ctx.database
      .update(ctx.schema.agentsTable)
      .set({ name: input.name })
      .where(eq(ctx.schema.agentsTable.id, input.id))
      .returning()
      .get();
    if (row === undefined) {
      throw new Error(`agent "${input.id}" not found`);
    }
    return row;
  };
}

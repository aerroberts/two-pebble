import { eq } from 'drizzle-orm';
import type { DatastoreContext, WorkspaceRecord } from '../types';

type OperationHandlerInput = {
  id: string;
};

/**
 * Exposes this datastore module contract for package-local callers.
 */
export function workspacesReadOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    const row = await ctx.database
      .select()
      .from(ctx.schema.workspacesTable)
      .where(eq(ctx.schema.workspacesTable.id, input.id))
      .get();

    if (row === undefined) {
      throw new Error(`Workspace not found: ${input.id}`);
    }

    return row as WorkspaceRecord;
  };
}

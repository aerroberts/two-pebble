import { eq } from 'drizzle-orm';

import type { AutomationRecord, DatastoreContext } from '../types';

type OperationHandlerInput = {
  id: string;
  ranAt: number;
};

/**
 * Exposes this datastore module contract for package-local callers.
 */
export function automationsRecordRunOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput): Promise<AutomationRecord> {
    const row = await ctx.database
      .update(ctx.schema.automationsTable)
      .set({ lastRanAt: input.ranAt })
      .where(eq(ctx.schema.automationsTable.id, input.id))
      .returning()
      .get();
    if (row === undefined) {
      throw new Error(`Automation not found: ${input.id}`);
    }
    return row as AutomationRecord;
  };
}

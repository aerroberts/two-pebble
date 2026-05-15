import { eq } from 'drizzle-orm';

import type { AutomationRecord, DatastoreContext } from '../types';

type OperationHandlerInput = {
  id: string;
};

export function automationsReadOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput): Promise<AutomationRecord | null> {
    const row = await ctx.database
      .select()
      .from(ctx.schema.automationsTable)
      .where(eq(ctx.schema.automationsTable.id, input.id))
      .get();
    return (row as AutomationRecord | undefined) ?? null;
  };
}

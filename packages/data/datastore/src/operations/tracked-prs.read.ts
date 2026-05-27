import { eq } from 'drizzle-orm';
import type { DatastoreContext, TrackedPrRecord } from '../types';

type OperationHandlerInput = {
  id: string;
};

export function trackedPrsReadOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    const row = await ctx.database
      .select()
      .from(ctx.schema.trackedPrsTable)
      .where(eq(ctx.schema.trackedPrsTable.id, input.id))
      .get();
    if (row === undefined) {
      throw new Error(`tracked PR "${input.id}" not found`);
    }
    return row as TrackedPrRecord;
  };
}

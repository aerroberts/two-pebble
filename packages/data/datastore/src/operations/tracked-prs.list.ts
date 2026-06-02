import { and, asc, eq, inArray, lte } from 'drizzle-orm';
import type { DatastoreContext, TrackedPrRecord, TrackedPrState } from '../types';

type OperationHandlerInput = {
  taskId?: string;
  state?: TrackedPrState[];
  pollableBefore?: number;
  limit?: number;
  offset?: number;
};

export function trackedPrsListOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput = {}) {
    const filters = [];
    if (input.taskId !== undefined) {
      filters.push(eq(ctx.schema.trackedPrsTable.taskId, input.taskId));
    }
    if (input.state !== undefined && input.state.length > 0) {
      filters.push(inArray(ctx.schema.trackedPrsTable.state, input.state));
    }
    if (input.pollableBefore !== undefined) {
      filters.push(lte(ctx.schema.trackedPrsTable.lastCheckedAt, input.pollableBefore));
    }
    const rows = await ctx.database
      .select()
      .from(ctx.schema.trackedPrsTable)
      .where(filters.length === 0 ? undefined : and(...filters))
      .orderBy(asc(ctx.schema.trackedPrsTable.updatedAt))
      .limit(input.limit ?? 1000)
      .offset(input.offset ?? 0)
      .all();
    return { items: rows as TrackedPrRecord[] };
  };
}

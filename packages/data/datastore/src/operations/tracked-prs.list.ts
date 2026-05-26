import { and, asc, eq, inArray, or } from 'drizzle-orm';
import type { DatastoreContext, TrackedPrRecord, TrackedPrState } from '../types';

type OperationHandlerInput = {
  taskId?: string;
  agentId?: string;
  states?: TrackedPrState[];
};

/**
 * Exposes this datastore module contract for package-local callers.
 */
export function trackedPrsListOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput = {}) {
    const conditions = [
      input.taskId === undefined ? undefined : eq(ctx.schema.trackedPrsTable.taskId, input.taskId),
      input.agentId === undefined ? undefined : eq(ctx.schema.trackedPrsTable.agentId, input.agentId),
      input.states === undefined || input.states.length === 0
        ? undefined
        : inArray(ctx.schema.trackedPrsTable.state, input.states),
    ].filter((condition) => condition !== undefined);
    const rows = await ctx.database
      .select()
      .from(ctx.schema.trackedPrsTable)
      .where(conditions.length === 0 ? undefined : and(...conditions))
      .orderBy(asc(ctx.schema.trackedPrsTable.createdAt))
      .all();
    return { items: rows as TrackedPrRecord[] };
  };
}

export function trackedPrsListOpenOperation(ctx: DatastoreContext) {
  return async function handler() {
    const rows = await ctx.database
      .select()
      .from(ctx.schema.trackedPrsTable)
      .where(or(eq(ctx.schema.trackedPrsTable.state, 'mergeable'), eq(ctx.schema.trackedPrsTable.state, 'unmergeable')))
      .orderBy(asc(ctx.schema.trackedPrsTable.lastCheckedAt))
      .all();
    return { items: rows as TrackedPrRecord[] };
  };
}

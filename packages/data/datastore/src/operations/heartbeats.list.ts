import { count, desc } from 'drizzle-orm';

import type { DatastoreContext, HeartbeatRecord } from '../types';

type OperationHandlerInput = {
  limit: number;
  offset: number;
};

/**
 * Exposes this datastore module contract for package-local callers.
 */
export function heartbeatsListOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    const rows = await ctx.database
      .select()
      .from(ctx.schema.heartbeatsTable)
      .orderBy(desc(ctx.schema.heartbeatsTable.tickAt))
      .limit(input.limit)
      .offset(input.offset)
      .all();
    const total = (await ctx.database.select({ value: count() }).from(ctx.schema.heartbeatsTable).get())?.value ?? 0;
    return {
      items: rows as HeartbeatRecord[],
      page: { limit: input.limit, offset: input.offset, total },
    };
  };
}

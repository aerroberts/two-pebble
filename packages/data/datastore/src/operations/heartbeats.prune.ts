import { desc, inArray } from 'drizzle-orm';

import type { DatastoreContext } from '../types';

type OperationHandlerInput = {
  retain: number;
};

export function heartbeatsPruneOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    const overflow = await ctx.database
      .select({ id: ctx.schema.heartbeatsTable.id })
      .from(ctx.schema.heartbeatsTable)
      .orderBy(desc(ctx.schema.heartbeatsTable.tickAt), desc(ctx.schema.heartbeatsTable.createdAt))
      .limit(1_000_000)
      .offset(Math.max(0, input.retain))
      .all();
    if (overflow.length === 0) {
      return { deleted: 0 };
    }
    const result = await ctx.database
      .delete(ctx.schema.heartbeatsTable)
      .where(
        inArray(
          ctx.schema.heartbeatsTable.id,
          overflow.map((row) => row.id),
        ),
      )
      .run();
    return { deleted: result.rowsAffected };
  };
}

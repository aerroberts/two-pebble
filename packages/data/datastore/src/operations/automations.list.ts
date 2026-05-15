import { count, desc, eq } from 'drizzle-orm';

import type { AutomationRecord, DatastoreContext } from '../types';

type OperationHandlerInput = {
  agentRegistryId?: string;
  limit: number;
  offset: number;
};

export function automationsListOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    const where =
      input.agentRegistryId === undefined
        ? undefined
        : eq(ctx.schema.automationsTable.agentRegistryId, input.agentRegistryId);
    const rows = await ctx.database
      .select()
      .from(ctx.schema.automationsTable)
      .where(where)
      .orderBy(desc(ctx.schema.automationsTable.createdAt))
      .limit(input.limit)
      .offset(input.offset)
      .all();
    const total =
      (await ctx.database.select({ value: count() }).from(ctx.schema.automationsTable).where(where).get())?.value ?? 0;
    return {
      items: rows as AutomationRecord[],
      page: { limit: input.limit, offset: input.offset, total },
    };
  };
}

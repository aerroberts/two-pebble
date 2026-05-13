import { count } from 'drizzle-orm';
import type { DatastoreContext, IntegrationRecord } from '../types';

type OperationHandlerInput = {
  limit: number;
  offset: number;
};

export function integrationsListOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    const rows = await ctx.database
      .select()
      .from(ctx.schema.integrationsTable)
      .orderBy(ctx.schema.integrationsTable.provider)
      .limit(input.limit)
      .offset(input.offset)
      .all();
    const total = (await ctx.database.select({ value: count() }).from(ctx.schema.integrationsTable).get())?.value ?? 0;

    return {
      items: rows as IntegrationRecord[],
      page: {
        limit: input.limit,
        offset: input.offset,
        total,
      },
    };
  };
}

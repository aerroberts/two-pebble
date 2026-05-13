import { count } from 'drizzle-orm';
import type { DatastoreContext, ThirdPartyAgentInstallRecord } from '../types';

type OperationHandlerInput = {
  limit: number;
  offset: number;
};

export function thirdPartyAgentInstallsListOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    const rows = await ctx.database
      .select()
      .from(ctx.schema.thirdPartyAgentInstallsTable)
      .orderBy(ctx.schema.thirdPartyAgentInstallsTable.frameworkId)
      .limit(input.limit)
      .offset(input.offset)
      .all();
    const total =
      (await ctx.database.select({ value: count() }).from(ctx.schema.thirdPartyAgentInstallsTable).get())?.value ?? 0;

    return {
      items: rows as ThirdPartyAgentInstallRecord[],
      page: {
        limit: input.limit,
        offset: input.offset,
        total,
      },
    };
  };
}

import { count } from 'drizzle-orm';
import type { DatastoreContext } from '../types';
import { attachDerivedAgentRegistryKind } from './agent-registries-utils';

type OperationHandlerInput = {
  limit: number;
  offset: number;
};

export function agentRegistriesListOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    const rows = await ctx.database
      .select()
      .from(ctx.schema.agentRegistriesTable)
      .orderBy(ctx.schema.agentRegistriesTable.name)
      .limit(input.limit)
      .offset(input.offset)
      .all();
    const total =
      (await ctx.database.select({ value: count() }).from(ctx.schema.agentRegistriesTable).get())?.value ?? 0;

    return {
      items: rows.map((row) => attachDerivedAgentRegistryKind(row)),
      page: {
        limit: input.limit,
        offset: input.offset,
        total,
      },
    };
  };
}

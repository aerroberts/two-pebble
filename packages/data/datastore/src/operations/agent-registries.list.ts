import { parseAgentSystemPrompt } from '@two-pebble/datatypes';
import { count } from 'drizzle-orm';
import type { DatastoreContext } from '../types';

type OperationHandlerInput = {
  limit: number;
  offset: number;
};

/**
 * Exposes this datastore module contract for package-local callers.
 * Agent registries are global; projects filter the list client-side via their
 * `enabledAgentRegistryIds`.
 */
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
      items: rows.map((row) => ({
        ...row,
        systemPrompt: parseAgentSystemPrompt(row.systemPrompt),
        kind: row.thirdPartyAgentInstallId !== null ? ('framework' as const) : ('pebble' as const),
      })),
      page: {
        limit: input.limit,
        offset: input.offset,
        total,
      },
    };
  };
}

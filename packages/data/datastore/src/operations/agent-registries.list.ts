import { parseAgentSystemPrompt } from '@two-pebble/datatypes';
import { count, eq } from 'drizzle-orm';
import type { DatastoreContext } from '../types';

type OperationHandlerInput = {
  limit: number;
  offset: number;
  projectId?: string;
};

/**
 * Exposes this datastore module contract for package-local callers.
 */
export function agentRegistriesListOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    const query = ctx.database
      .select()
      .from(ctx.schema.agentRegistriesTable)
      .orderBy(ctx.schema.agentRegistriesTable.name)
      .limit(input.limit)
      .offset(input.offset);
    const rows =
      input.projectId === undefined
        ? await query.all()
        : await query.where(eq(ctx.schema.agentRegistriesTable.projectId, input.projectId)).all();
    const total =
      input.projectId === undefined
        ? ((await ctx.database.select({ value: count() }).from(ctx.schema.agentRegistriesTable).get())?.value ?? 0)
        : ((
            await ctx.database
              .select({ value: count() })
              .from(ctx.schema.agentRegistriesTable)
              .where(eq(ctx.schema.agentRegistriesTable.projectId, input.projectId))
              .get()
          )?.value ?? 0);

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

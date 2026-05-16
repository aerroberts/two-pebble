import { count } from 'drizzle-orm';

import type { DatastoreContext } from '../types';

type OperationHandlerInput = {
  empty?: never;
};

/**
 * Exposes this datastore module contract for package-local callers.
 */
export function datastoreStatusOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    void input;
    const agentCountRow = await ctx.database.select({ agentCount: count() }).from(ctx.schema.agentsTable).get();
    const agentCallCountRow = await ctx.database
      .select({ agentCallCount: count() })
      .from(ctx.schema.agentCallsTable)
      .get();
    const integrationCountRow = await ctx.database
      .select({ integrationCount: count() })
      .from(ctx.schema.integrationsTable)
      .get();
    const inferenceProfileCountRow = await ctx.database
      .select({ inferenceProfileCount: count() })
      .from(ctx.schema.inferenceProfilesTable)
      .get();

    return {
      agentCallCount: agentCallCountRow?.agentCallCount ?? 0,
      agentCount: agentCountRow?.agentCount ?? 0,
      databaseFilePath: ctx.databaseFilePath,
      inferenceProfileCount: inferenceProfileCountRow?.inferenceProfileCount ?? 0,
      integrationCount: integrationCountRow?.integrationCount ?? 0,
    };
  };
}

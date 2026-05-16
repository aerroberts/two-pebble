import { parseAgentSystemPrompt } from '@two-pebble/datatypes';
import { eq } from 'drizzle-orm';
import type { DatastoreContext } from '../types';

type OperationHandlerInput = {
  id: string;
};

/**
 * Exposes this datastore module contract for package-local callers.
 */
export function agentRegistriesReadOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    const row = await ctx.database
      .select()
      .from(ctx.schema.agentRegistriesTable)
      .where(eq(ctx.schema.agentRegistriesTable.id, input.id))
      .get();

    if (row === undefined) {
      throw new Error(`Agent registry not found: ${input.id}`);
    }

    return {
      ...row,
      systemPrompt: parseAgentSystemPrompt(row.systemPrompt),
      kind: row.thirdPartyAgentInstallId !== null ? ('framework' as const) : ('pebble' as const),
    };
  };
}

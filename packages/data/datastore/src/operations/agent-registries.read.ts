import { eq } from 'drizzle-orm';
import type { DatastoreContext } from '../types';
import { attachDerivedAgentRegistryKind } from '../operation-support/agent-registries-utils';

type OperationHandlerInput = {
  id: string;
};

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

    return attachDerivedAgentRegistryKind(row);
  };
}

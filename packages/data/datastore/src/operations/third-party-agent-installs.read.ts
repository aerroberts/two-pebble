import { eq } from 'drizzle-orm';
import type { DatastoreContext, ThirdPartyAgentInstallRecord } from '../types';

type OperationHandlerInput = {
  id: string;
};

/**
 * Exposes this datastore module contract for package-local callers.
 */
export function thirdPartyAgentInstallsReadOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    const row = await ctx.database
      .select()
      .from(ctx.schema.thirdPartyAgentInstallsTable)
      .where(eq(ctx.schema.thirdPartyAgentInstallsTable.id, input.id))
      .get();

    if (row === undefined) {
      throw new Error(`Third-party agent install not found: ${input.id}`);
    }

    return row as ThirdPartyAgentInstallRecord;
  };
}

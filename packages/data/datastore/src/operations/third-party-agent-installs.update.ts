import { eq } from 'drizzle-orm';
import type {
  DatastoreContext,
  ThirdPartyAgentInstallData,
  ThirdPartyAgentInstallFrameworkId,
  ThirdPartyAgentInstallRecord,
} from '../types';

type OperationHandlerInput = {
  data: ThirdPartyAgentInstallData;
  frameworkId: ThirdPartyAgentInstallFrameworkId;
  id: string;
  name: string;
};

/**
 * Exposes this datastore module contract for package-local callers.
 */
export function thirdPartyAgentInstallsUpdateOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    const existing = await ctx.database
      .select()
      .from(ctx.schema.thirdPartyAgentInstallsTable)
      .where(eq(ctx.schema.thirdPartyAgentInstallsTable.id, input.id))
      .get();

    if (existing === undefined) {
      throw new Error(`Third-party agent install not found: ${input.id}`);
    }

    if (existing.frameworkId !== input.frameworkId) {
      throw new Error(`Third-party agent install frameworkId cannot change: ${input.id}`);
    }

    const row = await ctx.database
      .update(ctx.schema.thirdPartyAgentInstallsTable)
      .set({ data: input.data, name: input.name })
      .where(eq(ctx.schema.thirdPartyAgentInstallsTable.id, input.id))
      .returning()
      .get();

    return row as ThirdPartyAgentInstallRecord;
  };
}

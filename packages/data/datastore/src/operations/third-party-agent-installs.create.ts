import type {
  DatastoreContext,
  ThirdPartyAgentInstallData,
  ThirdPartyAgentInstallFrameworkId,
  ThirdPartyAgentInstallRecord,
} from '../types';

type OperationHandlerInput = {
  data: ThirdPartyAgentInstallData;
  frameworkId: ThirdPartyAgentInstallFrameworkId;
  name: string;
};

/**
 * Exposes this datastore module contract for package-local callers.
 */
export function thirdPartyAgentInstallsCreateOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    const row = await ctx.database
      .insert(ctx.schema.thirdPartyAgentInstallsTable)
      .values({
        data: input.data,
        frameworkId: input.frameworkId,
        name: input.name,
      })
      .returning()
      .get();

    return row as ThirdPartyAgentInstallRecord;
  };
}

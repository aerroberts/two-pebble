import { eq } from 'drizzle-orm';

import type { DatastoreContext } from '../types';

type OperationHandlerInput = {
  id: string;
};

export function thirdPartyAgentInstallsDeleteOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    await ctx.database
      .delete(ctx.schema.thirdPartyAgentInstallsTable)
      .where(eq(ctx.schema.thirdPartyAgentInstallsTable.id, input.id))
      .run();

    return { id: input.id };
  };
}

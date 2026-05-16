import { eq } from 'drizzle-orm';
import type { DatastoreContext, InferenceProfileProvider } from '../types';

type OperationHandlerInput = {
  id: string;
};

/**
 * Exposes this datastore module contract for package-local callers.
 */
export function inferenceProfilesReadOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    const row = await ctx.database
      .select()
      .from(ctx.schema.inferenceProfilesTable)
      .where(eq(ctx.schema.inferenceProfilesTable.id, input.id))
      .get();

    if (row === undefined) {
      throw new Error(`Inference profile not found: ${input.id}`);
    }

    const integration = await ctx.database
      .select({ provider: ctx.schema.integrationsTable.provider })
      .from(ctx.schema.integrationsTable)
      .where(eq(ctx.schema.integrationsTable.id, row.integrationId))
      .get();
    return { ...row, provider: (integration?.provider ?? '') as InferenceProfileProvider };
  };
}

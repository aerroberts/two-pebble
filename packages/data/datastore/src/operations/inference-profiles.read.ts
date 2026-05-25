import { eq } from 'drizzle-orm';
import type { DatastoreContext, InferenceProfileProvider, InferenceProfileRecord } from '../types';
import { toInferenceProfileRecord } from '../utils/inference-profile-record';

type OperationHandlerInput = {
  id: string;
};

/**
 * Exposes this datastore module contract for package-local callers.
 */
export function inferenceProfilesReadOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput): Promise<InferenceProfileRecord> {
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
    if (integration === undefined) {
      throw new Error(`Integration not found: ${row.integrationId}`);
    }
    return toInferenceProfileRecord(row, integration.provider as InferenceProfileProvider);
  };
}

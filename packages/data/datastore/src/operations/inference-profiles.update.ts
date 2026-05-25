import type { InferenceProfile } from '@two-pebble/datatypes';
import { eq } from 'drizzle-orm';
import type { DatastoreContext, InferenceProfileProvider, InferenceProfileRecord } from '../types';
import { toInferenceProfileRecord } from '../utils/inference-profile-record';

type OperationHandlerInput = InferenceProfile & {
  id: string;
  name: string;
};

/**
 * Exposes this datastore module contract for package-local callers.
 */
export function inferenceProfilesUpdateOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput): Promise<InferenceProfileRecord> {
    const existing = await ctx.database
      .select()
      .from(ctx.schema.inferenceProfilesTable)
      .where(eq(ctx.schema.inferenceProfilesTable.id, input.id))
      .get();

    if (existing === undefined) {
      throw new Error(`Inference profile not found: ${input.id}`);
    }

    const integration = await ctx.database
      .select()
      .from(ctx.schema.integrationsTable)
      .where(eq(ctx.schema.integrationsTable.id, input.integrationId))
      .get();

    if (integration === undefined) {
      throw new Error(`Integration not found: ${input.integrationId}`);
    }

    const row = await ctx.database
      .update(ctx.schema.inferenceProfilesTable)
      .set({
        data: input.data,
        integrationId: input.integrationId,
        kind: input.kind,
        name: input.name,
      })
      .where(eq(ctx.schema.inferenceProfilesTable.id, input.id))
      .returning()
      .get();

    return toInferenceProfileRecord(row, integration.provider as InferenceProfileProvider);
  };
}

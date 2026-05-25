import type { InferenceProfile } from '@two-pebble/datatypes';
import { eq } from 'drizzle-orm';
import type { DatastoreContext, InferenceProfileProvider, InferenceProfileRecord } from '../types';
import { toInferenceProfileRecord } from './inference-profiles.record';

type OperationHandlerInput = InferenceProfile & {
  name: string;
};

/**
 * Exposes this datastore module contract for package-local callers.
 */
export function inferenceProfilesCreateOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput): Promise<InferenceProfileRecord> {
    const integration = await ctx.database
      .select()
      .from(ctx.schema.integrationsTable)
      .where(eq(ctx.schema.integrationsTable.id, input.integrationId))
      .get();

    if (integration === undefined) {
      throw new Error(`Integration not found: ${input.integrationId}`);
    }

    const row = await ctx.database
      .insert(ctx.schema.inferenceProfilesTable)
      .values({
        data: input.data,
        integrationId: input.integrationId,
        kind: input.kind,
        name: input.name,
      })
      .returning()
      .get();

    return toInferenceProfileRecord(row, integration.provider as InferenceProfileProvider);
  };
}

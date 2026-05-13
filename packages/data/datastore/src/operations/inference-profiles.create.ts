import { eq } from 'drizzle-orm';
import type { DatastoreContext, InferenceProfileData, InferenceProfileKind } from '../types';
import { attachInferenceProfileProvider } from '../operation-support/inference-profiles-utils';

type OperationHandlerInput = {
  data: InferenceProfileData;
  integrationId: string;
  kind: InferenceProfileKind;
  name: string;
};

export function inferenceProfilesCreateOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
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

    return attachInferenceProfileProvider(ctx, row);
  };
}

import { eq } from 'drizzle-orm';
import { attachInferenceProfileProvider } from '../operation-support/inference-profiles-utils';
import type { DatastoreContext } from '../types';

type OperationHandlerInput = {
  id: string;
};

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

    return attachInferenceProfileProvider(ctx, row);
  };
}

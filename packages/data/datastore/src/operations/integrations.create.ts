import type { DatastoreContext, IntegrationData, IntegrationProvider, IntegrationRecord } from '../types';

type OperationHandlerInput = {
  data: IntegrationData;
  name: string;
  provider: IntegrationProvider;
};

export function integrationsCreateOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    const row = await ctx.database
      .insert(ctx.schema.integrationsTable)
      .values({
        data: input.data,
        name: input.name,
        provider: input.provider,
      })
      .returning()
      .get();

    return row as IntegrationRecord;
  };
}

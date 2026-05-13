import { eq } from 'drizzle-orm';
import type { DatastoreContext, IntegrationData, IntegrationProvider, IntegrationRecord } from '../types';

type OperationHandlerInput = {
  data: IntegrationData;
  id: string;
  name: string;
  provider: IntegrationProvider;
};

export function integrationsUpdateOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    const existing = await ctx.database
      .select()
      .from(ctx.schema.integrationsTable)
      .where(eq(ctx.schema.integrationsTable.id, input.id))
      .get();

    if (existing === undefined) {
      throw new Error(`Integration not found: ${input.id}`);
    }

    if (existing.provider !== input.provider) {
      throw new Error(`Integration provider cannot change: ${input.id}`);
    }

    const row = await ctx.database
      .update(ctx.schema.integrationsTable)
      .set({ data: input.data, name: input.name })
      .where(eq(ctx.schema.integrationsTable.id, input.id))
      .returning()
      .get();

    return row as IntegrationRecord;
  };
}

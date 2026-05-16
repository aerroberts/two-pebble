import { count, inArray } from 'drizzle-orm';
import type { DatastoreContext, InferenceProfileProvider } from '../types';

type OperationHandlerInput = {
  limit: number;
  offset: number;
};

/**
 * Exposes this datastore module contract for package-local callers.
 */
export function inferenceProfilesListOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    const rows = await ctx.database
      .select()
      .from(ctx.schema.inferenceProfilesTable)
      .orderBy(ctx.schema.inferenceProfilesTable.name)
      .limit(input.limit)
      .offset(input.offset)
      .all();
    const total =
      (await ctx.database.select({ value: count() }).from(ctx.schema.inferenceProfilesTable).get())?.value ?? 0;

    const providerByIntegrationId = new Map<string, string>();
    if (rows.length > 0) {
      const integrationIds = Array.from(new Set(rows.map((row) => row.integrationId)));
      const integrations = await ctx.database
        .select({ id: ctx.schema.integrationsTable.id, provider: ctx.schema.integrationsTable.provider })
        .from(ctx.schema.integrationsTable)
        .where(inArray(ctx.schema.integrationsTable.id, integrationIds))
        .all();
      for (const integration of integrations) {
        providerByIntegrationId.set(integration.id, integration.provider);
      }
    }

    return {
      items: rows.map((row) => ({
        ...row,
        provider: (providerByIntegrationId.get(row.integrationId) ?? '') as InferenceProfileProvider,
      })),
      page: {
        limit: input.limit,
        offset: input.offset,
        total,
      },
    };
  };
}

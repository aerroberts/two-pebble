import { count, inArray } from 'drizzle-orm';
import type { DatastoreContext, InferenceProfileProvider, InferenceProfileRecord } from '../types';
import { toInferenceProfileRecord } from '../utils/inference-profile-record';

type OperationHandlerInput = {
  limit: number;
  offset: number;
};

/**
 * Exposes this datastore module contract for package-local callers.
 */
export function inferenceProfilesListOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput): Promise<{
    items: InferenceProfileRecord[];
    page: { limit: number; offset: number; total: number };
  }> {
    const rows = await ctx.database
      .select()
      .from(ctx.schema.inferenceProfilesTable)
      .orderBy(ctx.schema.inferenceProfilesTable.name)
      .limit(input.limit)
      .offset(input.offset)
      .all();
    const total =
      (await ctx.database.select({ value: count() }).from(ctx.schema.inferenceProfilesTable).get())?.value ?? 0;

    const providerByIntegrationId = new Map<string, InferenceProfileRecord['provider']>();
    if (rows.length > 0) {
      const integrationIds = Array.from(new Set(rows.map((row) => row.integrationId)));
      const integrations = await ctx.database
        .select({ id: ctx.schema.integrationsTable.id, provider: ctx.schema.integrationsTable.provider })
        .from(ctx.schema.integrationsTable)
        .where(inArray(ctx.schema.integrationsTable.id, integrationIds))
        .all();
      for (const integration of integrations) {
        providerByIntegrationId.set(integration.id, integration.provider as InferenceProfileProvider);
      }
    }

    const items = rows.map((row) => {
      const provider = providerByIntegrationId.get(row.integrationId);
      if (provider === undefined) {
        throw new Error(`Integration not found: ${row.integrationId}`);
      }
      return toInferenceProfileRecord(row, provider);
    });

    return {
      items,
      page: {
        limit: input.limit,
        offset: input.offset,
        total,
      },
    };
  };
}

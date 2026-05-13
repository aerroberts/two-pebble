import { eq, inArray } from 'drizzle-orm';
import type { DatastoreContext, InferenceProfileProvider, InferenceProfileRecord } from '../types';

type StoredInferenceProfileRow = Omit<InferenceProfileRecord, 'provider'>;

/**
 * Reads the integration row backing one stored inference profile and
 * stitches the integration's provider onto the returned record. The
 * `provider` column was dropped from inference_profiles (migration 0028);
 * downstream consumers continue to receive `record.provider` from this
 * helper instead of the table.
 */
export async function attachInferenceProfileProvider(
  ctx: DatastoreContext,
  row: StoredInferenceProfileRow,
): Promise<InferenceProfileRecord> {
  const integration = await ctx.database
    .select({ provider: ctx.schema.integrationsTable.provider })
    .from(ctx.schema.integrationsTable)
    .where(eq(ctx.schema.integrationsTable.id, row.integrationId))
    .get();
  const provider = (integration?.provider ?? '') as InferenceProfileProvider;
  return { ...row, provider } as InferenceProfileRecord;
}

/**
 * Batches the integration lookup for a list of inference profiles and
 * stitches each row's derived provider in one pass.
 */
export async function attachInferenceProfileProviders(
  ctx: DatastoreContext,
  rows: StoredInferenceProfileRow[],
): Promise<InferenceProfileRecord[]> {
  if (rows.length === 0) return [];
  const integrationIds = Array.from(new Set(rows.map((row) => row.integrationId)));
  const integrations = await ctx.database
    .select({ id: ctx.schema.integrationsTable.id, provider: ctx.schema.integrationsTable.provider })
    .from(ctx.schema.integrationsTable)
    .where(inArray(ctx.schema.integrationsTable.id, integrationIds))
    .all();
  const providerByIntegrationId = new Map<string, string>();
  for (const integration of integrations) {
    providerByIntegrationId.set(integration.id, integration.provider);
  }
  return rows.map((row) => {
    const provider = (providerByIntegrationId.get(row.integrationId) ?? '') as InferenceProfileProvider;
    return { ...row, provider } as InferenceProfileRecord;
  });
}

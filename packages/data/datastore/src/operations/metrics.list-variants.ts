import type {
  DatastoreContext,
  MetricDimensionJsonRecord,
  MetricDimensionSource,
  MetricDimensionsRecord,
  MetricVariant,
} from '../types';

type OperationHandlerInput = {
  name: string;
};

type OperationHandlerOutput = {
  items: MetricVariant[];
};

/**
 * Exposes this datastore module contract for package-local callers.
 */
export function metricsListVariantsOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    const result = await ctx.libsqlClient.execute({
      sql: 'SELECT dimensions, COUNT(*) AS sample_count, MAX(created_at) AS last_seen FROM metrics WHERE name = ? GROUP BY dimensions ORDER BY sample_count DESC',
      args: [input.name],
    });
    const items = result.rows.map(
      (row): MetricVariant => ({
        dimensions: parseDimensions(row.dimensions),
        sampleCount: Number(row.sample_count ?? 0),
        lastSeenAt: Number(row.last_seen ?? 0),
      }),
    );
    return { items } as OperationHandlerOutput;
  };
}

function parseDimensions(raw: MetricDimensionSource): MetricDimensionsRecord {
  if (raw === null || raw === undefined) {
    return {};
  }
  try {
    const parsed = JSON.parse(String(raw)) as MetricDimensionJsonRecord;
    if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {};
    }
    const entries = Object.entries(parsed).map(([key, value]) => [key, String(value)] as const);
    return Object.fromEntries(entries);
  } catch {
    return {};
  }
}

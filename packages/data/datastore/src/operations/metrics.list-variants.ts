import type { DatastoreContext, MetricDimensionsRecord } from '../types';

type OperationHandlerInput = {
  name: string;
};

export type MetricVariant = {
  dimensions: MetricDimensionsRecord;
  sampleCount: number;
  lastSeenAt: number;
};

type OperationHandlerOutput = {
  items: MetricVariant[];
};

export function metricsListVariantsOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput): Promise<OperationHandlerOutput> {
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
    return { items };
  };
}

function parseDimensions(raw: unknown): MetricDimensionsRecord {
  if (raw === null || raw === undefined) return {};
  try {
    const parsed = JSON.parse(String(raw)) as unknown;
    if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    const entries = Object.entries(parsed as Record<string, unknown>).map(
      ([key, value]) => [key, String(value)] as const,
    );
    return Object.fromEntries(entries);
  } catch {
    return {};
  }
}

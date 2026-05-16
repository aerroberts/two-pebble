import type { DatastoreContext, MetricNameSummary } from '../types';

type OperationHandlerInput = {
  empty?: never;
};

/**
 * Exposes this datastore module contract for package-local callers.
 */
export function metricsListNamesOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput): Promise<{ items: MetricNameSummary[] }> {
    void input;
    const result = await ctx.libsqlClient.execute(
      'SELECT name, COUNT(*) AS sample_count, MIN(created_at) AS first_seen, MAX(created_at) AS last_seen FROM metrics GROUP BY name ORDER BY name ASC',
    );
    const items = result.rows.map(
      (row): MetricNameSummary => ({
        name: String(row.name),
        sampleCount: Number(row.sample_count ?? 0),
        firstSeenAt: Number(row.first_seen ?? 0),
        lastSeenAt: Number(row.last_seen ?? 0),
      }),
    );
    return { items };
  };
}

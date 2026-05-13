import type { InValue } from '@libsql/client';
import type { DatastoreContext, MetricAggregateBucket, MetricDimensionsRecord } from '../types';

type OperationHandlerInput = {
  name: string;
  fromTimestamp: number;
  toTimestamp: number;
  bucketSizeMs: number;
  dimensions?: MetricDimensionsRecord;
};

type OperationHandlerOutput = {
  buckets: MetricAggregateBucket[];
};

export function metricsQueryAggregatedOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    if (!Number.isInteger(input.bucketSizeMs) || input.bucketSizeMs <= 0) {
      throw new Error(`bucketSizeMs must be a positive integer; got ${input.bucketSizeMs}`);
    }

    const args: InValue[] = [
      input.bucketSizeMs,
      input.bucketSizeMs,
      input.name,
      input.fromTimestamp,
      input.toTimestamp,
    ];
    let where = 'name = ? AND created_at >= ? AND created_at < ?';
    for (const [key, value] of Object.entries(input.dimensions ?? {})) {
      where += ' AND json_extract(dimensions, ?) = ?';
      args.push(`$.${jsonPathSegment(key)}`, value);
    }

    // CAST forces INTEGER affinity on bucketSizeMs so the division is
    // integer-floored. JS numbers arrive as REAL by default and would otherwise
    // make every row land in a unique fractional bucket.
    const sql = `
      SELECT
        ((created_at / CAST(? AS INTEGER)) * CAST(? AS INTEGER)) AS bucket_start,
        COUNT(*) AS sample_count,
        MIN(value) AS min_value,
        MAX(value) AS max_value,
        AVG(value) AS avg_value,
        SUM(value) AS sum_value
      FROM metrics
      WHERE ${where}
      GROUP BY bucket_start
      ORDER BY bucket_start ASC
    `;

    const result = await ctx.libsqlClient.execute({ sql, args });
    const buckets = result.rows.map((row): MetricAggregateBucket => {
      return {
        bucketStart: Number(row.bucket_start ?? 0),
        sampleCount: Number(row.sample_count ?? 0),
        min: Number(row.min_value ?? 0),
        max: Number(row.max_value ?? 0),
        avg: Number(row.avg_value ?? 0),
        sum: Number(row.sum_value ?? 0),
      };
    });
    return { buckets } as OperationHandlerOutput;
  };
}

function jsonPathSegment(key: string): string {
  // sqlite json_extract path segment: bare for safe identifiers, quoted otherwise.
  if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) return key;
  return `"${key.replaceAll('"', '\\"')}"`;
}

import type { DatastoreContext, MetricDimensionsRecord, MetricRecord } from '../types';

type OperationHandlerInput = {
  name: string;
  value: number;
  dimensions: MetricDimensionsRecord;
  timestamp: number;
};

export function metricsWriteOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    const row = await ctx.database
      .insert(ctx.schema.metricsTable)
      .values({
        name: input.name,
        value: input.value,
        dimensions: input.dimensions,
        createdAt: input.timestamp,
        updatedAt: input.timestamp,
      })
      .returning()
      .get();
    return row as MetricRecord;
  };
}

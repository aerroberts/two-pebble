import type { DatastoreContext, HeartbeatRecord, HeartbeatReport } from '../types';

type OperationHandlerInput = {
  durationMs: number;
  listenerCount: number;
  reports: HeartbeatReport[];
  tickAt: number;
};

export function heartbeatsInsertOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput): Promise<HeartbeatRecord> {
    const row = await ctx.database
      .insert(ctx.schema.heartbeatsTable)
      .values({
        durationMs: input.durationMs,
        listenerCount: input.listenerCount,
        reports: input.reports,
        tickAt: input.tickAt,
      })
      .returning()
      .get();
    return row as HeartbeatRecord;
  };
}

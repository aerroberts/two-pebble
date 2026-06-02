import { eq } from 'drizzle-orm';
import { createUtcNow } from '../table/create-utc-now';
import type { DatastoreContext, TrackedPrCheckRun, TrackedPrRecord, TrackedPrState } from '../types';

type OperationHandlerInput = {
  id: string;
  state?: TrackedPrState;
  title?: string;
  checks?: TrackedPrCheckRun[];
  lastCheckedAt?: number;
  lastEventAt?: number | null;
  etag?: string | null;
};

export function trackedPrsUpdateOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    const existing = await ctx.database
      .select()
      .from(ctx.schema.trackedPrsTable)
      .where(eq(ctx.schema.trackedPrsTable.id, input.id))
      .get();
    if (existing === undefined) {
      throw new Error(`tracked PR "${input.id}" not found`);
    }
    const row = await ctx.database
      .update(ctx.schema.trackedPrsTable)
      .set({
        checks: input.checks ?? existing.checks,
        etag: input.etag === undefined ? existing.etag : input.etag,
        lastCheckedAt: input.lastCheckedAt ?? createUtcNow(),
        lastEventAt: input.lastEventAt === undefined ? existing.lastEventAt : input.lastEventAt,
        state: input.state ?? existing.state,
        title: input.title ?? existing.title,
      })
      .where(eq(ctx.schema.trackedPrsTable.id, input.id))
      .returning()
      .get();
    return row as TrackedPrRecord;
  };
}

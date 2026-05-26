import { eq } from 'drizzle-orm';
import { createUtcNow } from '../table/create-utc-now';
import type { DatastoreContext, TrackedPrRecord, TrackedPrState } from '../types';

type OperationHandlerInput = {
  id: string;
  state?: TrackedPrState;
  checks?: string;
  lastCheckedAt?: number;
  lastEventAt?: number | null;
  etag?: string | null;
};

/**
 * Exposes this datastore module contract for package-local callers.
 */
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
        state: input.state ?? existing.state,
        checks: input.checks ?? existing.checks,
        lastCheckedAt: input.lastCheckedAt ?? createUtcNow(),
        lastEventAt: input.lastEventAt === undefined ? existing.lastEventAt : input.lastEventAt,
        etag: input.etag === undefined ? existing.etag : input.etag,
      })
      .where(eq(ctx.schema.trackedPrsTable.id, input.id))
      .returning()
      .get();
    return row as TrackedPrRecord;
  };
}

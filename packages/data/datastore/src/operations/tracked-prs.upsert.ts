import { and, eq } from 'drizzle-orm';
import { createUtcNow } from '../table/create-utc-now';
import type { DatastoreContext, TrackedPrRecord, TrackedPrState } from '../types';

type OperationHandlerInput = {
  taskId: string;
  deliverableId: string;
  agentId: string;
  integrationId: string;
  repo: string;
  number: number;
  url: string;
  state?: TrackedPrState;
  checks?: string;
  lastCheckedAt?: number;
  lastEventAt?: number | null;
  etag?: string | null;
};

/**
 * Exposes this datastore module contract for package-local callers.
 */
export function trackedPrsUpsertOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    const existing = await ctx.database
      .select()
      .from(ctx.schema.trackedPrsTable)
      .where(and(eq(ctx.schema.trackedPrsTable.repo, input.repo), eq(ctx.schema.trackedPrsTable.number, input.number)))
      .get();
    const values = {
      taskId: input.taskId,
      deliverableId: input.deliverableId,
      agentId: input.agentId,
      integrationId: input.integrationId,
      repo: input.repo,
      number: input.number,
      url: input.url,
      state: input.state ?? 'mergeable',
      checks: input.checks ?? '[]',
      lastCheckedAt: input.lastCheckedAt ?? createUtcNow(),
      lastEventAt: input.lastEventAt ?? null,
      etag: input.etag ?? null,
    };
    if (existing === undefined) {
      const row = await ctx.database.insert(ctx.schema.trackedPrsTable).values(values).returning().get();
      return row as TrackedPrRecord;
    }
    const row = await ctx.database
      .update(ctx.schema.trackedPrsTable)
      .set(values)
      .where(eq(ctx.schema.trackedPrsTable.id, existing.id))
      .returning()
      .get();
    return row as TrackedPrRecord;
  };
}

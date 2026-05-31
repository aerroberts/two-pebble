import { and, eq, or } from 'drizzle-orm';
import { createUtcNow } from '../table/create-utc-now';
import type { DatastoreContext, TrackedPrRecord, TrackedPrState } from '../types';

type OperationHandlerInput = {
  taskId: string;
  deliverableId: string;
  agentId: string;
  repo: string;
  number: number;
  url: string;
  state?: TrackedPrState;
  lastCheckedAt?: number;
  /** Vestigial; defaults to '' since GitHub access no longer uses a token. */
  integrationId?: string;
};

export function trackedPrsUpsertOperation(ctx: DatastoreContext) {
  return async function handler(input: OperationHandlerInput) {
    const existing = await ctx.database
      .select()
      .from(ctx.schema.trackedPrsTable)
      .where(
        or(
          and(eq(ctx.schema.trackedPrsTable.repo, input.repo), eq(ctx.schema.trackedPrsTable.number, input.number)),
          and(
            eq(ctx.schema.trackedPrsTable.taskId, input.taskId),
            eq(ctx.schema.trackedPrsTable.deliverableId, input.deliverableId),
          ),
        ),
      )
      .get();
    const values = {
      agentId: input.agentId,
      deliverableId: input.deliverableId,
      integrationId: input.integrationId ?? '',
      lastCheckedAt: input.lastCheckedAt ?? createUtcNow(),
      repo: input.repo,
      number: input.number,
      state: input.state ?? 'mergeable',
      taskId: input.taskId,
      url: input.url,
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

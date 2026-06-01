import { logger } from '@two-pebble/logger';
import { and, eq } from 'drizzle-orm';
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
    // The table has two independent unique keys: (repo, number) and
    // (taskId, deliverableId). Resolve each separately and branch on which
    // matched, rather than the old single OR-matched select + blind overwrite,
    // which could silently rebind a PR to a different deliverable or collide
    // with the second unique index and throw a raw SQLITE error.
    const byPr = await ctx.database
      .select()
      .from(ctx.schema.trackedPrsTable)
      .where(and(eq(ctx.schema.trackedPrsTable.repo, input.repo), eq(ctx.schema.trackedPrsTable.number, input.number)))
      .get();
    const byDeliverable = await ctx.database
      .select()
      .from(ctx.schema.trackedPrsTable)
      .where(
        and(
          eq(ctx.schema.trackedPrsTable.taskId, input.taskId),
          eq(ctx.schema.trackedPrsTable.deliverableId, input.deliverableId),
        ),
      )
      .get();

    // This PR is already tracked for a different deliverable. Rebinding it would
    // silently destroy the original tracking, so reject with an actionable
    // message instead.
    if (byPr !== undefined && (byPr.taskId !== input.taskId || byPr.deliverableId !== input.deliverableId)) {
      throw new Error(
        `PR ${input.repo}#${input.number} is already tracked for task "${byPr.taskId}" deliverable "${byPr.deliverableId}".`,
      );
    }

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

    // `byPr` (when present) is guaranteed to belong to this deliverable by the
    // guard above, so it and `byDeliverable` refer to the same row when both
    // exist; there is no cross-key collision to write into.
    const existing = byPr ?? byDeliverable;
    if (existing === undefined) {
      const row = await ctx.database.insert(ctx.schema.trackedPrsTable).values(values).returning().get();
      return row as TrackedPrRecord;
    }
    // The deliverable is being re-pointed from one PR to another — an explicit,
    // legitimate change, but worth a breadcrumb.
    if (existing.repo !== input.repo || existing.number !== input.number) {
      logger.info('re-pointing tracked PR for deliverable', {
        deliverableId: input.deliverableId,
        from: `${existing.repo}#${existing.number}`,
        taskId: input.taskId,
        to: `${input.repo}#${input.number}`,
      });
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

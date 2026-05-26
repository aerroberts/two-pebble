import type { TrackedPrRecord } from '@two-pebble/protocol';
import type { DaemonHandlerContext } from '../types';

export function handler(ctx: DaemonHandlerContext) {
  return async (payload: {
    taskId?: string;
    agentId?: string;
    states?: Array<'mergeable' | 'unmergeable' | 'merged' | 'closed'>;
  }) => {
    const { items } = await ctx.datastore.trackedPrs.list(payload);
    return { items: items.map(toProtocolTrackedPr) };
  };
}

export function toProtocolTrackedPr(row: {
  id: string;
  createdAt: number;
  updatedAt: number;
  taskId: string;
  deliverableId: string;
  agentId: string;
  integrationId: string;
  repo: string;
  number: number;
  url: string;
  state: string;
  checks: string;
  lastCheckedAt: number;
  lastEventAt: number | null;
  etag: string | null;
}): TrackedPrRecord {
  return {
    ...row,
    state: row.state as TrackedPrRecord['state'],
    checks: JSON.parse(row.checks) as TrackedPrRecord['checks'],
  };
}

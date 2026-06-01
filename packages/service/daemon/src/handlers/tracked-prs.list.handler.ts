import type { DaemonHandlerContext } from '../types';

export function handler(ctx: DaemonHandlerContext) {
  return async function listTrackedPrs(payload: {
    agentId?: string;
    taskId?: string;
    state?: Array<'mergeable' | 'pending' | 'unmergeable' | 'merged' | 'closed'>;
    limit?: number;
    offset?: number;
  }) {
    return ctx.datastore.trackedPrs.list(payload);
  };
}

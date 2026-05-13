import type { ListThreadsResult } from '../states/thread-snapshots/types';
import type { RealtimeOperationContext } from '../types';

export function listThreadsOperation(ctx: RealtimeOperationContext) {
  return async function listThreads(): Promise<ListThreadsResult> {
    return ctx.datastore.emit('listThreads', {});
  };
}

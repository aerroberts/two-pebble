import type { ReadThreadSnapshotInput } from '../states/thread-snapshots/types';
import type { RealtimeOperationContext } from '../types';

export function readThreadSnapshotOperation(ctx: RealtimeOperationContext) {
  return async function readThreadSnapshot(input: ReadThreadSnapshotInput) {
    return ctx.datastore.emit('readThreadSnapshot', input);
  };
}

import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';

type DeleteMemoryOperation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'deleteMemory'>;
type DeleteMemoryPayload = DeleteMemoryOperation['request'];

/**
 * Removes a memory collection row. The on-disk folder is always kept,
 * matching repository delete — files are deleted manually if needed.
 */
export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(payload: DeleteMemoryPayload) {
    const deleted = await ctx.datastore.memories.delete(payload);
    ctx.events.emit('memoryDeleted', deleted);
    return deleted;
  };
}

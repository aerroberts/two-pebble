import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';

type MemoriesListOperation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'listMemories'>;
type MemoriesListPayload = MemoriesListOperation['request'];

export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(payload: MemoriesListPayload) {
    return ctx.datastore.memories.list({
      limit: payload.limit ?? 200,
      offset: payload.offset ?? 0,
      projectId: payload.projectId,
    });
  };
}

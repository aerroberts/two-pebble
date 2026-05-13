import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';

type DeleteRepositoryOperation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'deleteRepository'>;
type DeleteRepositoryPayload = DeleteRepositoryOperation['request'];

export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(payload: DeleteRepositoryPayload) {
    const deleted = await ctx.datastore.repositories.delete(payload);

    ctx.multicastBridge.emit('repositoryDeleted', deleted);

    return deleted;
  };
}

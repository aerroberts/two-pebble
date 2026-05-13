import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';

type UpdateRepositoryOperation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'updateRepository'>;
type UpdateRepositoryPayload = UpdateRepositoryOperation['request'];

export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(payload: UpdateRepositoryPayload) {
    const repository = await ctx.datastore.repositories.update(payload);

    ctx.multicastBridge.emit('repositoryUpdated', repository);

    return { id: repository.id };
  };
}

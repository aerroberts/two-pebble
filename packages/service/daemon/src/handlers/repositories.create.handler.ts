import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';

type CreateRepositoryOperation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'createRepository'>;
type CreateRepositoryPayload = CreateRepositoryOperation['request'];

export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(payload: CreateRepositoryPayload) {
    const repository = await ctx.datastore.repositories.create(payload);

    ctx.multicastBridge.emit('repositoryUpdated', repository);

    return { id: repository.id };
  };
}

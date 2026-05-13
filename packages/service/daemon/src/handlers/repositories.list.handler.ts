import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';

type ListRepositoriesOperation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'listRepositories'>;
type ListRepositoriesPayload = ListRepositoriesOperation['request'];

export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(payload: ListRepositoriesPayload) {
    return ctx.datastore.repositories.list({
      limit: payload.limit ?? 50,
      offset: payload.offset ?? 0,
    });
  };
}

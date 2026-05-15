import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';

type ListOperation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'listTaskDispatchSettings'>;
type Payload = ListOperation['request'];

export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(_payload: Payload) {
    const { items } = await ctx.datastore.taskBoards.dispatchSettings.list({});
    return {
      items: items.map((record) => ({
        scopeKind: record.scopeKind,
        scopeId: record.scopeId,
        concurrency: record.concurrency,
        dispatchMode: record.dispatchMode,
        autoAgentRegistryId: record.autoAgentRegistryId,
      })),
    };
  };
}

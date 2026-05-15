import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';

type ReadOperation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'readTaskDispatchSettings'>;
type Payload = ReadOperation['request'];

export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(payload: Payload) {
    const settings = await ctx.datastore.taskBoards.dispatchSettings.read({
      scopeKind: payload.scopeKind,
      scopeId: payload.scopeId,
    });
    if (settings === null) {
      return { settings: null };
    }
    return {
      settings: {
        scopeKind: settings.scopeKind,
        scopeId: settings.scopeId,
        concurrency: settings.concurrency,
        dispatchMode: settings.dispatchMode,
        autoAgentRegistryId: settings.autoAgentRegistryId,
      },
    };
  };
}

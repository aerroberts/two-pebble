import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';

type UpdateOperation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'updateTaskDispatchSettings'>;
type Payload = UpdateOperation['request'];

export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(payload: Payload) {
    const settings = await ctx.datastore.taskBoards.dispatchSettings.upsert({
      scopeKind: payload.scopeKind,
      scopeId: payload.scopeId,
      concurrency: payload.concurrency,
      dispatchMode: payload.dispatchMode,
      autoAgentRegistryId: payload.autoAgentRegistryId,
    });
    const wire = {
      scopeKind: settings.scopeKind,
      scopeId: settings.scopeId,
      concurrency: settings.concurrency,
      dispatchMode: settings.dispatchMode,
      autoAgentRegistryId: settings.autoAgentRegistryId,
    };
    ctx.multicastBridge.emit('taskDispatchSettingsUpdated', wire);
    return { settings: wire };
  };
}

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
    if (payload.scopeKind === 'board') {
      ctx.taskDispatcher.kickBoard(payload.scopeId);
    } else {
      // Pool's board is not on the settings row, so look it up across boards.
      const { items: boards } = await ctx.datastore.taskBoards.list({});
      for (const board of boards) {
        const { items: pools } = await ctx.datastore.taskBoards.pools.list({ boardId: board.id });
        if (pools.some((pool) => pool.id === payload.scopeId)) {
          ctx.taskDispatcher.kickBoard(board.id);
          break;
        }
      }
    }
    return { settings: wire };
  };
}

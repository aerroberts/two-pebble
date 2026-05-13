import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';

type ListDepsOperation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'listTaskDependencies'>;
type Payload = ListDepsOperation['request'];

export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(payload: Payload) {
    return ctx.datastore.taskBoards.dependencies.list({ boardId: payload.boardId });
  };
}

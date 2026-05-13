import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';

type ListWorktreesOperation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'listWorktrees'>;
type ListWorktreesPayload = ListWorktreesOperation['request'];

export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(payload: ListWorktreesPayload) {
    return ctx.datastore.worktrees.list({
      limit: payload.limit ?? 50,
      offset: payload.offset ?? 0,
      repositoryId: payload.repositoryId,
      status: payload.status,
    });
  };
}

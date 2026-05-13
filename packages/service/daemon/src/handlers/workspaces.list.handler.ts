import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';

type ListWorkspacesOperation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'listWorkspaces'>;
type ListWorkspacesPayload = ListWorkspacesOperation['request'];

export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(payload: ListWorkspacesPayload) {
    return ctx.datastore.workspaces.list({
      limit: payload.limit ?? 50,
      offset: payload.offset ?? 0,
    });
  };
}

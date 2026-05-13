import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';
import { getOpenFileCommand } from '../utils/files/open-file-command';

type OpenWorktreeOperation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'openWorktree'>;
type OpenWorktreePayload = OpenWorktreeOperation['request'];

export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(payload: OpenWorktreePayload) {
    const worktree = await ctx.datastore.worktrees.read({ id: payload.id });
    Bun.spawn({ cmd: getOpenFileCommand(worktree.path), stderr: 'ignore', stdout: 'ignore' });
    return { path: worktree.path };
  };
}

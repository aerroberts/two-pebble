import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';
import { createWorktreeForRepository } from '../utils/worktrees/create-worktree';

type CreateWorktreeOperation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'createWorktree'>;
type CreateWorktreePayload = CreateWorktreeOperation['request'];

export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(payload: CreateWorktreePayload) {
    return createWorktreeForRepository(ctx, payload);
  };
}

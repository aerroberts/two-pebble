import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';

type LaunchAgentOperation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'launchAgent'>;
type LaunchAgentPayload = LaunchAgentOperation['request'];

export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(payload: LaunchAgentPayload) {
    return ctx.agentRegistry.launch({
      agentRegistryId: payload.agentRegistryId,
      message: payload.message,
    });
  };
}

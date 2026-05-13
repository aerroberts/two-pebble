import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';

type ReadAgentCallOperation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'readAgentCall'>;
type ReadAgentCallPayload = ReadAgentCallOperation['request'];

export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(payload: ReadAgentCallPayload) {
    return ctx.datastore.agent.calls.read({ id: payload.id });
  };
}

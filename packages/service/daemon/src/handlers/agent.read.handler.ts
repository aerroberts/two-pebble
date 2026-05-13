import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import type { DaemonHandlerContext } from '../types';

type ReadAgentOperation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'readAgent'>;
type ReadAgentPayload = ReadAgentOperation['request'];

export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(payload: ReadAgentPayload) {
    return ctx.datastore.agent.read({ id: payload.id });
  };
}
